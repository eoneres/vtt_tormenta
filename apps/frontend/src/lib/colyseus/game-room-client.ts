import { Client, Room } from 'colyseus.js';
import type { AnyCommand } from '../../../apps/realtime-gateway-service/src/commands/game.commands';

// Re-export command types for use in components
export type { AnyCommand };

export interface RoomChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'roll' | 'emote' | 'system';
  timestamp: number;
  rollData?: {
    notation: string;
    rolls: number[];
    total: number;
    breakdown: string;
    signature: string;
  };
}

export interface RoomToken {
  id: string;
  name: string;
  imageUrl: string;
  position: { x: number; y: number };
  size: number;
  hp: number;
  maxHp: number;
  isVisible: boolean;
  conditions: string[];
  controlledBy: string[];
  characterId: string;
  npcId: string;
}

export interface RoomMapState {
  id: string;
  name: string;
  imageUrl: string;
  gridType: string;
  gridSize: number;
  width: number;
  height: number;
}

export interface RoomState {
  tableId: string;
  campaignId: string;
  gmId: string;
  phase: 'exploration' | 'combat' | 'paused';
  round: number;
  turn: number;
  map: RoomMapState;
  tokens: Map<string, RoomToken>;
  initiative: Array<{ tokenId: string; name: string; initiative: number; hasActed: boolean }>;
  chatHistory: RoomChatMessage[];
  fog: { mode: string; revealedAreas: Array<{ tokenId: string; polygon: string }> };
  players: Map<string, string>;
}

type StateChangeCallback = (state: RoomState) => void;
type ErrorCallback = (message: string) => void;

const REALTIME_URL = process.env['NEXT_PUBLIC_REALTIME_URL'] ?? 'ws://localhost:2567';

export class GameRoomClient {
  private client: Client;
  private room: Room | null = null;
  private onStateChange: StateChangeCallback | null = null;
  private onError: ErrorCallback | null = null;
  private onChatMessage: ((msg: RoomChatMessage) => void) | null = null;

  constructor() {
    this.client = new Client(REALTIME_URL);
  }

  async join(options: {
    tableId: string;
    campaignId: string;
    mapId: string;
    userId: string;
    displayName: string;
    token: string;
  }): Promise<void> {
    this.room = await this.client.joinOrCreate('game_room', options);

    this.room.onStateChange((state) => {
      this.onStateChange?.(this.serializeState(state));
    });

    this.room.onMessage('CHAT', (msg: RoomChatMessage) => {
      this.onChatMessage?.(msg);
    });

    this.room.onMessage('ERROR', ({ message }: { message: string }) => {
      this.onError?.(message);
    });

    this.room.onError((code, message) => {
      this.onError?.(`Room error ${code}: ${message}`);
    });

    this.room.onLeave(() => {
      this.room = null;
    });
  }

  send(command: AnyCommand): void {
    if (!this.room) throw new Error('Not connected to room');
    const { type, ...payload } = command;
    this.room.send(type, payload);
  }

  leave(): void {
    this.room?.leave();
    this.room = null;
  }

  get sessionId(): string | null {
    return this.room?.sessionId ?? null;
  }

  get connected(): boolean {
    return this.room !== null;
  }

  onState(cb: StateChangeCallback): void { this.onStateChange = cb; }
  onErr(cb: ErrorCallback): void { this.onError = cb; }
  onChat(cb: (msg: RoomChatMessage) => void): void { this.onChatMessage = cb; }

  // Colyseus schema → plain object (avoids proxy issues in Zustand)
  private serializeState(state: unknown): RoomState {
    const s = state as Record<string, unknown>;
    return {
      tableId: s['tableId'] as string,
      campaignId: s['campaignId'] as string,
      gmId: s['gmId'] as string,
      phase: s['phase'] as RoomState['phase'],
      round: s['round'] as number,
      turn: s['turn'] as number,
      map: s['map'] as RoomMapState,
      tokens: new Map(Object.entries(s['tokens'] as Record<string, RoomToken>)),
      initiative: Array.from(s['initiative'] as unknown[]) as RoomState['initiative'],
      chatHistory: Array.from(s['chatHistory'] as unknown[]) as RoomChatMessage[],
      fog: s['fog'] as RoomState['fog'],
      players: new Map(Object.entries(s['players'] as Record<string, string>)),
    };
  }
}
