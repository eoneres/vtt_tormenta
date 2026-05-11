import { AutomationExecutor, IGameStateAdapter } from '../../src/domain/automation/entities/automation-executor';
import { DiceEngine } from '../../src/domain/dice/entities/dice-engine';
import { AutomationAggregate } from '../../src/domain/automation/entities/automation.aggregate';
import type { AutomationEventContext } from '../../src/domain/automation/dsl/automation.types';

// ─── Mock State Adapter ───────────────────────────────────────────────────────

class MockStateAdapter implements IGameStateAdapter {
  public hpMap = new Map<string, { hp: number; maxHp: number }>();
  public conditionMap = new Map<string, string[]>();
  public chatMessages: Array<{ message: string; flavor?: string }> = [];

  async getTokenHp(tableId: string, tokenId: string) {
    return this.hpMap.get(tokenId) ?? { hp: 30, maxHp: 50 };
  }

  async setTokenHp(tableId: string, tokenId: string, hp: number) {
    const current = this.hpMap.get(tokenId) ?? { hp: 30, maxHp: 50 };
    this.hpMap.set(tokenId, { ...current, hp });
  }

  async getTokenConditions(tableId: string, tokenId: string) {
    return this.conditionMap.get(tokenId) ?? [];
  }

  async addTokenCondition(tableId: string, tokenId: string, condition: string) {
    const existing = this.conditionMap.get(tokenId) ?? [];
    this.conditionMap.set(tokenId, [...existing, condition]);
  }

  async removeTokenCondition(tableId: string, tokenId: string, condition: string) {
    const existing = this.conditionMap.get(tokenId) ?? [];
    this.conditionMap.set(tokenId, existing.filter((c) => c !== condition));
  }

  async sendChatMessage(tableId: string, message: string, flavor?: string) {
    this.chatMessages.push({ message, flavor });
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeContext(overrides: Partial<AutomationEventContext> = {}): AutomationEventContext {
  return {
    tableId: 'table-1',
    campaignId: 'campaign-1',
    triggerType: 'ON_DAMAGE_RECEIVED',
    sourceTokenId: 'token-barbarian',
    targetTokenId: 'token-goblin',
    round: 2,
    turn: 1,
    eventData: { damage: 10, damageType: 'slashing', conditions: [] },
    variables: {},
    ...overrides,
  };
}

function makeAutomation(overrides: Partial<Parameters<typeof AutomationAggregate.create>[0]> = {}) {
  return AutomationAggregate.create({
    name: 'Test Automation',
    system: 'tormenta20',
    scope: 'global',
    isTemplate: false,
    trigger: { type: 'ON_DAMAGE_RECEIVED' },
    actions: [
      {
        type: 'SEND_CHAT_MESSAGE',
        target: { type: 'self' },
        message: 'Test message',
      },
    ],
    tags: [],
    createdBy: 'user-1',
    ...overrides,
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AutomationExecutor', () => {
  let executor: AutomationExecutor;
  let stateAdapter: MockStateAdapter;
  let diceEngine: DiceEngine;

  beforeEach(() => {
    stateAdapter = new MockStateAdapter();
    diceEngine = new DiceEngine('test-hmac-secret');
    executor = new AutomationExecutor(diceEngine, stateAdapter);
  });

  // ─── Condition gating ────────────────────────────────────────────────────

  describe('condition gating', () => {
    it('fires when no condition is defined', async () => {
      const automation = makeAutomation();
      const ctx = makeContext();
      const result = await executor.execute(automation, ctx);
      expect(result.fired).toBe(true);
      expect(result.conditionMet).toBe(true);
    });

    it('does not fire when condition is not met', async () => {
      const automation = makeAutomation({
        condition: {
          type: 'simple',
          field: 'eventData.damage',
          operator: 'gt',
          value: 100,
        },
      });
      const ctx = makeContext();
      const result = await executor.execute(automation, ctx);
      expect(result.fired).toBe(false);
      expect(result.conditionMet).toBe(false);
    });

    it('fires when condition is met', async () => {
      const automation = makeAutomation({
        condition: {
          type: 'simple',
          field: 'eventData.damage',
          operator: 'gt',
          value: 5,
        },
      });
      const ctx = makeContext(); // damage = 10
      const result = await executor.execute(automation, ctx);
      expect(result.fired).toBe(true);
    });
  });

  // ─── SEND_CHAT_MESSAGE ───────────────────────────────────────────────────

  describe('SEND_CHAT_MESSAGE action', () => {
    it('sends a message to chat', async () => {
      const automation = makeAutomation({
        actions: [{
          type: 'SEND_CHAT_MESSAGE',
          target: { type: 'self' },
          message: 'Damage dealt: {{eventData.damage}}',
        }],
      });
      const ctx = makeContext();
      await executor.execute(automation, ctx);
      expect(stateAdapter.chatMessages).toHaveLength(1);
      expect(stateAdapter.chatMessages[0]!.message).toBe('Damage dealt: 10');
    });

    it('resolves template expressions in messages', async () => {
      const automation = makeAutomation({
        actions: [{
          type: 'SEND_CHAT_MESSAGE',
          target: { type: 'self' },
          message: 'Rodada {{round}}, turno {{turn}}',
        }],
      });
      const ctx = makeContext({ round: 5, turn: 3 });
      await executor.execute(automation, ctx);
      expect(stateAdapter.chatMessages[0]!.message).toBe('Rodada 5, turno 3');
    });
  });

  // ─── APPLY_CONDITION ──────────────────────────────────────────────────────

  describe('APPLY_CONDITION action', () => {
    it('applies a condition to the source token', async () => {
      const automation = makeAutomation({
        actions: [{
          type: 'APPLY_CONDITION',
          target: { type: 'self' },
          conditionName: 'Abalado',
        }],
      });
      const ctx = makeContext();
      await executor.execute(automation, ctx);
      const conditions = await stateAdapter.getTokenConditions('table-1', 'token-barbarian');
      expect(conditions).toContain('Abalado');
    });

    it('applies a condition to the target token', async () => {
      const automation = makeAutomation({
        actions: [{
          type: 'APPLY_CONDITION',
          target: { type: 'target' },
          conditionName: 'Caído',
        }],
      });
      const ctx = makeContext();
      await executor.execute(automation, ctx);
      const conditions = await stateAdapter.getTokenConditions('table-1', 'token-goblin');
      expect(conditions).toContain('Caído');
    });
  });

  // ─── REMOVE_CONDITION ─────────────────────────────────────────────────────

  describe('REMOVE_CONDITION action', () => {
    it('removes an existing condition', async () => {
      stateAdapter.conditionMap.set('token-barbarian', ['Abalado', 'Caído']);
      const automation = makeAutomation({
        actions: [{
          type: 'REMOVE_CONDITION',
          target: { type: 'self' },
          conditionName: 'Abalado',
        }],
      });
      const ctx = makeContext();
      await executor.execute(automation, ctx);
      const conditions = await stateAdapter.getTokenConditions('table-1', 'token-barbarian');
      expect(conditions).not.toContain('Abalado');
      expect(conditions).toContain('Caído');
    });
  });

  // ─── MODIFY_HP ────────────────────────────────────────────────────────────

  describe('MODIFY_HP action', () => {
    it('reduces HP by a fixed amount', async () => {
      stateAdapter.hpMap.set('token-goblin', { hp: 30, maxHp: 50 });
      const automation = makeAutomation({
        actions: [{
          type: 'MODIFY_HP',
          target: { type: 'target' },
          amount: '-10',
        }],
      });
      const ctx = makeContext();
      await executor.execute(automation, ctx);
      const { hp } = await stateAdapter.getTokenHp('table-1', 'token-goblin');
      expect(hp).toBe(20);
    });

    it('increases HP via HEAL action', async () => {
      stateAdapter.hpMap.set('token-barbarian', { hp: 10, maxHp: 50 });
      const automation = makeAutomation({
        actions: [{
          type: 'HEAL',
          target: { type: 'self' },
          amount: '15',
          isHealing: true,
        }],
      });
      const ctx = makeContext();
      await executor.execute(automation, ctx);
      const { hp } = await stateAdapter.getTokenHp('table-1', 'token-barbarian');
      expect(hp).toBe(25);
    });

    it('clamps HP to 0 (does not go negative)', async () => {
      stateAdapter.hpMap.set('token-goblin', { hp: 5, maxHp: 50 });
      const automation = makeAutomation({
        actions: [{
          type: 'MODIFY_HP',
          target: { type: 'target' },
          amount: '-50',
        }],
      });
      const ctx = makeContext();
      await executor.execute(automation, ctx);
      const { hp } = await stateAdapter.getTokenHp('table-1', 'token-goblin');
      expect(hp).toBe(0);
    });

    it('clamps HP to maxHp on heal', async () => {
      stateAdapter.hpMap.set('token-barbarian', { hp: 45, maxHp: 50 });
      const automation = makeAutomation({
        actions: [{
          type: 'HEAL',
          target: { type: 'self' },
          amount: '20',
          isHealing: true,
        }],
      });
      const ctx = makeContext();
      await executor.execute(automation, ctx);
      const { hp } = await stateAdapter.getTokenHp('table-1', 'token-barbarian');
      expect(hp).toBe(50);
    });
  });

  // ─── ROLL_DICE ────────────────────────────────────────────────────────────

  describe('ROLL_DICE action', () => {
    it('executes a dice roll and stores result in context variables', async () => {
      const automation = makeAutomation({
        actions: [{
          type: 'ROLL_DICE',
          target: { type: 'self' },
          notation: '1d6',
          storeAs: 'sneakDamage',
          announce: false,
        }],
      });
      const ctx = makeContext();
      await executor.execute(automation, ctx);
      expect(typeof ctx.variables['sneakDamage']).toBe('number');
      expect(ctx.variables['sneakDamage']).toBeGreaterThanOrEqual(1);
      expect(ctx.variables['sneakDamage']).toBeLessThanOrEqual(6);
    });

    it('rolls can be referenced by subsequent chat messages via template', async () => {
      const automation = makeAutomation({
        actions: [
          {
            type: 'ROLL_DICE',
            target: { type: 'self' },
            notation: '1d6',
            storeAs: 'poisonDamage',
            announce: false,
          },
          {
            type: 'SEND_CHAT_MESSAGE',
            target: { type: 'self' },
            message: 'Veneno: {{variables.poisonDamage}} dano',
          },
        ],
      });
      const ctx = makeContext();
      await executor.execute(automation, ctx);
      const msg = stateAdapter.chatMessages[0]!.message;
      // Should not contain {{variables.poisonDamage}} as literal
      expect(msg).not.toContain('{{');
      expect(msg).toMatch(/Veneno: \d+ dano/);
    });
  });

  // ─── Execution results ────────────────────────────────────────────────────

  describe('execution result structure', () => {
    it('returns correct actionsExecuted count', async () => {
      const automation = makeAutomation({
        actions: [
          { type: 'SEND_CHAT_MESSAGE', target: { type: 'self' }, message: 'msg 1' },
          { type: 'SEND_CHAT_MESSAGE', target: { type: 'self' }, message: 'msg 2' },
        ],
      });
      const ctx = makeContext();
      const result = await executor.execute(automation, ctx);
      expect(result.actionsExecuted).toBe(2);
      expect(result.actionResults).toHaveLength(2);
      expect(result.actionResults.every((r) => r.success)).toBe(true);
    });

    it('records durationMs', async () => {
      const automation = makeAutomation();
      const ctx = makeContext();
      const result = await executor.execute(automation, ctx);
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('automation id is preserved in result', async () => {
      const automation = makeAutomation();
      const ctx = makeContext();
      const result = await executor.execute(automation, ctx);
      expect(result.automationId).toBe(automation.id);
    });
  });
});
