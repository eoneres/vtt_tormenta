import { Room, Client, ServerError } from 'colyseus';
import { ArraySchema } from '@colyseus/schema';
import { generateId } from '@vtt/shared-utils';
import {
  GameRoomState,
  TokenSchema,
  PositionSchema,
  InitiativeEntrySchema,
  ChatMessageSchema as ChatMsgSchema,
  RevealedAreaSchema,
  FogStateSchema,
  MapStateSchema,
} from './game-room.state';
import {
  AnyCommandSchema,
  COMMANDS,
  type MoveTokenCommand,
  type RollDiceCommand,
  type UpdateHpCommand,
  type ApplyConditionCommand,
  type RemoveConditionCommand,
  type ChatMessageCommand,
  type SetInitiativeCommand,
  type RevealFogCommand,
} from '../commands/game.commands';
import { ServiceClient } from './service-client';
import type { RealtimeEnv } from '../config/env';

interface JoinOptions {
  tableId: string;
  campaignId: string;
  mapId: string;
  userId: string;
  displayName: string;
  token: string; // JWT — validated by Colyseus auth hook
}

const CHAT_HISTORY_MAX = 100;
const GRID_SNAP = (gridSize: number, v: number) =>
  Math.round(v / gridSize) * gridSize;

export class GameRoom extends Room<GameRoomState> {
  private serviceClient!: ServiceClient;
  private env!: RealtimeEnv;
  private mapId!: string;

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  onCreate(options: { env: RealtimeEnv }): void {
    this.env = options.env;
    this.serviceClient = new ServiceClient(
      this.env.VTT_ENGINE_URL,
      this.env.RULES_ENGINE_URL,
    );

    this.setState(new GameRoomState());
    this.setPatchRate(this.env.PATCH_RATE_MS);
    this.maxClients = this.env.MAX_CLIENTS_PER_ROOM;

    this.onMessage('*', (client, type, message) => {
      this.handleCommand(client, { type, ...message }).catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Command error';
        client.send('ERROR', { message: msg });
      });
    });
  }

  async onJoin(client: Client, options: JoinOptions): Promise<void> {
    const { tableId, campaignId, mapId, userId, displayName } = options;

    // First client becomes GM if gmId not set
    if (!this.state.gmId) {
      this.state.gmId = userId;
      this.state.tableId = tableId;
      this.state.campaignId = campaignId;
      this.mapId = mapId;

      // Load initial state from vtt-engine-service
      await this.loadTableState(tableId, mapId);
    }

    this.state.players.set(client.sessionId, displayName);
    client.userData = { userId, displayName };

    this.broadcastSystemMessage(`${displayName} entrou na mesa.`);
  }

  onLeave(client: Client, consented: boolean): void {
    const { displayName } = client.userData as { userId: string; displayName: string };
    this.state.players.delete(client.sessionId);
    this.broadcastSystemMessage(`${displayName} saiu da mesa.`);

    if (!consented) {
      // Allow reconnection for 30s
      this.allowReconnection(client, 30).catch(() => {
        // Client did not reconnect — already removed from players map
      });
    }
  }

  onDispose(): void {
    // State persisted via vtt-engine-service; nothing to flush here
  }

  // ─── Command Dispatcher ────────────────────────────────────────────────────

  private async handleCommand(client: Client, raw: unknown): Promise<void> {
    const parsed = AnyCommandSchema.safeParse(raw);
    if (!parsed.success) {
      client.send('ERROR', { message: 'Invalid command', details: parsed.error.flatten() });
      return;
    }

    const cmd = parsed.data;
    const { userId } = client.userData as { userId: string; displayName: string };

    switch (cmd.type) {
      case COMMANDS.MOVE_TOKEN:
        await this.handleMoveToken(client, userId, cmd);
        break;
      case COMMANDS.ROLL_DICE:
        await this.handleRollDice(client, userId, cmd);
        break;
      case COMMANDS.UPDATE_HP:
        this.handleUpdateHp(client, userId, cmd);
        break;
      case COMMANDS.APPLY_CONDITION:
        this.handleApplyCondition(client, userId, cmd);
        break;
      case COMMANDS.REMOVE_CONDITION:
        this.handleRemoveCondition(client, userId, cmd);
        break;
      case COMMANDS.CHAT_MESSAGE:
        this.handleChatMessage(client, userId, cmd);
        break;
      case COMMANDS.SET_INITIATIVE:
        this.handleSetInitiative(client, userId, cmd);
        break;
      case COMMANDS.NEXT_TURN:
        this.handleNextTurn(client, userId);
        break;
      case COMMANDS.START_COMBAT:
        this.handleStartCombat(client, userId);
        break;
      case COMMANDS.END_COMBAT:
        this.handleEndCombat(client, userId);
        break;
      case COMMANDS.REVEAL_FOG:
        this.handleRevealFog(client, userId, cmd);
        break;
      case COMMANDS.RESET_FOG:
        this.handleResetFog(client, userId);
        break;
      case COMMANDS.PING:
        client.send('PONG', { timestamp: Date.now() });
        break;
    }
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────

  private async handleMoveToken(
    client: Client,
    userId: string,
    cmd: MoveTokenCommand,
  ): Promise<void> {
    const token = this.state.tokens.get(cmd.tokenId);
    if (!token) throw new ServerError(404, 'Token not found');

    // Authorization: GM or token controller
    if (!this.isGm(userId) && !token.controlledBy.includes(userId)) {
      throw new ServerError(403, 'Not authorized to move this token');
    }

    // Snap to grid (authoritative)
    const gridSize = this.state.map.gridSize;
    const snappedX = GRID_SNAP(gridSize, cmd.x);
    const snappedY = GRID_SNAP(gridSize, cmd.y);

    // Bounds check
    if (snappedX < 0 || snappedY < 0 || snappedX > this.state.map.width || snappedY > this.state.map.height) {
      throw new ServerError(400, 'Position out of bounds');
    }

    // Persist async (fire-and-forget with error log)
    this.serviceClient
      .moveToken(cmd.tokenId, this.state.tableId, snappedX, snappedY, userId)
      .catch((err: unknown) => console.error('moveToken persist error', err));

    // Update authoritative state immediately
    token.position.x = snappedX;
    token.position.y = snappedY;
  }

  private async handleRollDice(
    client: Client,
    userId: string,
    cmd: RollDiceCommand,
  ): Promise<void> {
    // Authoritative: roll happens server-side
    const result = await this.serviceClient.roll(cmd.notation, userId);

    const msg = new ChatMsgSchema();
    msg.id = generateId();
    msg.senderId = userId;
    msg.senderName = (client.userData as { displayName: string }).displayName;
    msg.type = 'roll';
    msg.content = cmd.label ?? cmd.notation;
    msg.timestamp = Date.now();
    msg.rollData = JSON.stringify({
      notation: result.notation,
      rolls: result.rolls,
      total: result.total,
      breakdown: result.breakdown,
      signature: result.signature,
    });

    if (cmd.isPrivate) {
      // Send only to GM and roller
      client.send('CHAT', msg);
      const gmClient = this.findGmClient();
      if (gmClient && gmClient.sessionId !== client.sessionId) {
        gmClient.send('CHAT', msg);
      }
    } else {
      this.appendChat(msg);
    }
  }

  private handleUpdateHp(client: Client, userId: string, cmd: UpdateHpCommand): void {
    if (!this.isGm(userId)) throw new ServerError(403, 'Only GM can update HP');

    const token = this.state.tokens.get(cmd.tokenId);
    if (!token) throw new ServerError(404, 'Token not found');

    const newHp = Math.max(0, Math.min(token.maxHp, token.hp + cmd.delta));
    token.hp = newHp;

    this.broadcastSystemMessage(
      `${token.name}: ${cmd.delta > 0 ? '+' : ''}${cmd.delta} PV (${newHp}/${token.maxHp})`,
    );
  }

  private handleApplyCondition(client: Client, userId: string, cmd: ApplyConditionCommand): void {
    if (!this.isGm(userId)) throw new ServerError(403, 'Only GM can apply conditions');

    const token = this.state.tokens.get(cmd.tokenId);
    if (!token) throw new ServerError(404, 'Token not found');

    if (!token.conditions.includes(cmd.conditionId)) {
      token.conditions.push(cmd.conditionId);
    }
  }

  private handleRemoveCondition(client: Client, userId: string, cmd: RemoveConditionCommand): void {
    if (!this.isGm(userId)) throw new ServerError(403, 'Only GM can remove conditions');

    const token = this.state.tokens.get(cmd.tokenId);
    if (!token) throw new ServerError(404, 'Token not found');

    const idx = token.conditions.indexOf(cmd.conditionId);
    if (idx !== -1) token.conditions.splice(idx, 1);
  }

  private handleChatMessage(client: Client, userId: string, cmd: ChatMessageCommand): void {
    const msg = new ChatMsgSchema();
    msg.id = generateId();
    msg.senderId = userId;
    msg.senderName = (client.userData as { displayName: string }).displayName;
    msg.type = cmd.isEmote ? 'emote' : 'text';
    msg.content = cmd.content;
    msg.timestamp = Date.now();
    this.appendChat(msg);
  }

  private handleSetInitiative(client: Client, userId: string, cmd: SetInitiativeCommand): void {
    if (!this.isGm(userId)) throw new ServerError(403, 'Only GM can set initiative');

    this.state.initiative.splice(0, this.state.initiative.length);

    const sorted = [...cmd.entries].sort((a, b) => b.initiative - a.initiative);
    for (const entry of sorted) {
      const token = this.state.tokens.get(entry.tokenId);
      const e = new InitiativeEntrySchema();
      e.tokenId = entry.tokenId;
      e.name = token?.name ?? entry.tokenId;
      e.initiative = entry.initiative;
      e.hasActed = false;
      this.state.initiative.push(e);
    }
  }

  private handleNextTurn(client: Client, userId: string): void {
    if (!this.isGm(userId)) throw new ServerError(403, 'Only GM can advance turn');
    if (this.state.phase !== 'combat') throw new ServerError(400, 'Not in combat');

    const count = this.state.initiative.length;
    if (count === 0) return;

    const current = this.state.initiative[this.state.turn];
    if (current) current.hasActed = true;

    this.state.turn = (this.state.turn + 1) % count;

    if (this.state.turn === 0) {
      this.state.round++;
      // Reset hasActed for new round
      for (const entry of this.state.initiative) {
        entry.hasActed = false;
      }
    }
  }

  private handleStartCombat(client: Client, userId: string): void {
    if (!this.isGm(userId)) throw new ServerError(403, 'Only GM can start combat');
    this.state.phase = 'combat';
    this.state.round = 1;
    this.state.turn = 0;
    this.broadcastSystemMessage('⚔️ Combate iniciado!');
  }

  private handleEndCombat(client: Client, userId: string): void {
    if (!this.isGm(userId)) throw new ServerError(403, 'Only GM can end combat');
    this.state.phase = 'exploration';
    this.state.round = 0;
    this.state.turn = 0;
    this.state.initiative.splice(0, this.state.initiative.length);
    this.broadcastSystemMessage('🕊️ Combate encerrado.');
  }

  private handleRevealFog(client: Client, userId: string, cmd: RevealFogCommand): void {
    if (!this.isGm(userId)) throw new ServerError(403, 'Only GM can reveal fog');

    const existing = this.state.fog.revealedAreas.findIndex(
      (a) => a.tokenId === cmd.tokenId,
    );
    if (existing !== -1) {
      this.state.fog.revealedAreas.splice(existing, 1);
    }

    const area = new RevealedAreaSchema();
    area.tokenId = cmd.tokenId;
    area.polygon = JSON.stringify(cmd.polygon);
    this.state.fog.revealedAreas.push(area);
  }

  private handleResetFog(client: Client, userId: string): void {
    if (!this.isGm(userId)) throw new ServerError(403, 'Only GM can reset fog');
    this.state.fog.revealedAreas.splice(0, this.state.fog.revealedAreas.length);
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private isGm(userId: string): boolean {
    return this.state.gmId === userId;
  }

  private findGmClient(): Client | undefined {
    return this.clients.find(
      (c) => (c.userData as { userId: string }).userId === this.state.gmId,
    );
  }

  private appendChat(msg: ChatMsgSchema): void {
    this.state.chatHistory.push(msg);
    // Keep rolling window
    if (this.state.chatHistory.length > CHAT_HISTORY_MAX) {
      this.state.chatHistory.splice(0, 1);
    }
  }

  private broadcastSystemMessage(content: string): void {
    const msg = new ChatMsgSchema();
    msg.id = generateId();
    msg.senderId = 'system';
    msg.senderName = 'Sistema';
    msg.type = 'system';
    msg.content = content;
    msg.timestamp = Date.now();
    this.appendChat(msg);
  }

  private async loadTableState(tableId: string, mapId: string): Promise<void> {
    try {
      const state = await this.serviceClient.getTableState(tableId, mapId);

      // Populate map
      this.state.map.id = state.map.id;
      this.state.map.name = state.map.name;
      this.state.map.imageUrl = state.map.imageUrl;
      this.state.map.gridType = state.map.gridType;
      this.state.map.gridSize = state.map.gridSize;
      this.state.map.width = state.map.width;
      this.state.map.height = state.map.height;

      // Populate tokens
      for (const t of state.tokens) {
        const token = new TokenSchema();
        token.id = t.id;
        token.name = t.name;
        token.imageUrl = t.imageUrl;
        token.position = new PositionSchema();
        token.position.x = t.position.x;
        token.position.y = t.position.y;
        token.size = t.size;
        token.hp = t.hp;
        token.maxHp = t.maxHp;
        token.isVisible = t.isVisible;
        token.characterId = t.characterId ?? '';
        token.npcId = t.npcId ?? '';
        for (const c of t.conditions) token.conditions.push(c);
        for (const ctrl of t.controlledBy) token.controlledBy.push(ctrl);
        this.state.tokens.set(t.id, token);
      }
    } catch (err) {
      console.error('Failed to load table state:', err);
      // Room continues with empty state — GM can set up manually
    }
  }
}
