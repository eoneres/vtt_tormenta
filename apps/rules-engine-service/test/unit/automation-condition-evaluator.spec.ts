import { ConditionEvaluator } from '../../src/domain/automation/entities/condition-evaluator';
import { TemplateResolver } from '../../src/domain/automation/entities/template-resolver';
import type { AutomationEventContext } from '../../src/domain/automation/dsl/automation.types';

const makeContext = (overrides: Partial<AutomationEventContext> = {}): AutomationEventContext => ({
  tableId: 'table-1',
  campaignId: 'campaign-1',
  triggerType: 'ON_DAMAGE_RECEIVED',
  sourceTokenId: 'token-player-1',
  targetTokenId: 'token-npc-1',
  round: 3,
  turn: 2,
  eventData: {
    damage: 15,
    damageType: 'fire',
    currentHp: 25,
    maxHp: 50,
    hpPercent: 50,
    conditions: ['Abalado', 'Envenenado'],
    isFurtive: true,
    attackerClass: 'ladino',
  },
  variables: {
    rollResult: 18,
  },
  ...overrides,
});

describe('ConditionEvaluator', () => {
  let evaluator: ConditionEvaluator;
  let ctx: AutomationEventContext;

  beforeEach(() => {
    evaluator = new ConditionEvaluator();
    ctx = makeContext();
  });

  describe('simple conditions', () => {
    it('eq — matches equal value', () => {
      expect(evaluator.evaluate({ type: 'simple', field: 'eventData.damageType', operator: 'eq', value: 'fire' }, ctx)).toBe(true);
    });

    it('eq — does not match different value', () => {
      expect(evaluator.evaluate({ type: 'simple', field: 'eventData.damageType', operator: 'eq', value: 'cold' }, ctx)).toBe(false);
    });

    it('ne — matches when values differ', () => {
      expect(evaluator.evaluate({ type: 'simple', field: 'eventData.damageType', operator: 'ne', value: 'cold' }, ctx)).toBe(true);
    });

    it('gt — numeric greater than', () => {
      expect(evaluator.evaluate({ type: 'simple', field: 'eventData.damage', operator: 'gt', value: 10 }, ctx)).toBe(true);
      expect(evaluator.evaluate({ type: 'simple', field: 'eventData.damage', operator: 'gt', value: 20 }, ctx)).toBe(false);
    });

    it('gte — numeric greater than or equal', () => {
      expect(evaluator.evaluate({ type: 'simple', field: 'eventData.damage', operator: 'gte', value: 15 }, ctx)).toBe(true);
    });

    it('lt — numeric less than', () => {
      expect(evaluator.evaluate({ type: 'simple', field: 'eventData.hpPercent', operator: 'lt', value: 60 }, ctx)).toBe(true);
    });

    it('lte — matches threshold exactly', () => {
      expect(evaluator.evaluate({ type: 'simple', field: 'eventData.hpPercent', operator: 'lte', value: 50 }, ctx)).toBe(true);
    });

    it('contains — array contains value', () => {
      expect(evaluator.evaluate({ type: 'simple', field: 'eventData.conditions', operator: 'contains', value: 'Envenenado' }, ctx)).toBe(true);
      expect(evaluator.evaluate({ type: 'simple', field: 'eventData.conditions', operator: 'contains', value: 'Caído' }, ctx)).toBe(false);
    });

    it('not_contains — array does not contain value', () => {
      expect(evaluator.evaluate({ type: 'simple', field: 'eventData.conditions', operator: 'not_contains', value: 'Caído' }, ctx)).toBe(true);
    });

    it('is_true — boolean check', () => {
      expect(evaluator.evaluate({ type: 'simple', field: 'eventData.isFurtive', operator: 'is_true' }, ctx)).toBe(true);
    });

    it('is_false — not true', () => {
      expect(evaluator.evaluate({ type: 'simple', field: 'eventData.isFurtive', operator: 'is_false' }, ctx)).toBe(false);
    });

    it('is_null — undefined field returns true', () => {
      expect(evaluator.evaluate({ type: 'simple', field: 'eventData.nonExistent', operator: 'is_null' }, ctx)).toBe(true);
    });

    it('is_not_null — existing field returns true', () => {
      expect(evaluator.evaluate({ type: 'simple', field: 'eventData.damage', operator: 'is_not_null' }, ctx)).toBe(true);
    });
  });

  describe('composite conditions', () => {
    it('AND — both true → true', () => {
      expect(evaluator.evaluate({
        type: 'and',
        conditions: [
          { type: 'simple', field: 'eventData.isFurtive', operator: 'is_true' },
          { type: 'simple', field: 'eventData.attackerClass', operator: 'eq', value: 'ladino' },
        ],
      }, ctx)).toBe(true);
    });

    it('AND — one false → false', () => {
      expect(evaluator.evaluate({
        type: 'and',
        conditions: [
          { type: 'simple', field: 'eventData.isFurtive', operator: 'is_true' },
          { type: 'simple', field: 'eventData.attackerClass', operator: 'eq', value: 'mago' },
        ],
      }, ctx)).toBe(false);
    });

    it('OR — one true → true', () => {
      expect(evaluator.evaluate({
        type: 'or',
        conditions: [
          { type: 'simple', field: 'eventData.attackerClass', operator: 'eq', value: 'mago' },
          { type: 'simple', field: 'eventData.attackerClass', operator: 'eq', value: 'ladino' },
        ],
      }, ctx)).toBe(true);
    });

    it('OR — all false → false', () => {
      expect(evaluator.evaluate({
        type: 'or',
        conditions: [
          { type: 'simple', field: 'eventData.attackerClass', operator: 'eq', value: 'mago' },
          { type: 'simple', field: 'eventData.attackerClass', operator: 'eq', value: 'clérigo' },
        ],
      }, ctx)).toBe(false);
    });

    it('NOT — inverts result', () => {
      expect(evaluator.evaluate({
        type: 'not',
        condition: { type: 'simple', field: 'eventData.attackerClass', operator: 'eq', value: 'mago' },
      }, ctx)).toBe(true);
    });

    it('nested AND inside OR', () => {
      expect(evaluator.evaluate({
        type: 'or',
        conditions: [
          {
            type: 'and',
            conditions: [
              { type: 'simple', field: 'eventData.isFurtive', operator: 'is_true' },
              { type: 'simple', field: 'eventData.attackerClass', operator: 'eq', value: 'ladino' },
            ],
          },
          { type: 'simple', field: 'eventData.damage', operator: 'gt', value: 100 },
        ],
      }, ctx)).toBe(true);
    });
  });

  describe('resolveField()', () => {
    it('resolves top-level context fields', () => {
      expect(evaluator.resolveField('round', ctx)).toBe(3);
      expect(evaluator.resolveField('turn', ctx)).toBe(2);
    });

    it('resolves nested event data', () => {
      expect(evaluator.resolveField('eventData.damage', ctx)).toBe(15);
    });

    it('resolves variables', () => {
      expect(evaluator.resolveField('variables.rollResult', ctx)).toBe(18);
    });

    it('returns undefined for unknown paths', () => {
      expect(evaluator.resolveField('eventData.nonExistent.deep', ctx)).toBeUndefined();
    });
  });
});

describe('TemplateResolver', () => {
  let resolver: TemplateResolver;
  let ctx: AutomationEventContext;

  beforeEach(() => {
    resolver = new TemplateResolver();
    ctx = makeContext();
  });

  describe('resolve()', () => {
    it('resolves simple template expressions', () => {
      expect(resolver.resolve('Dano: {{eventData.damage}}', ctx)).toBe('Dano: 15');
    });

    it('resolves multiple placeholders', () => {
      expect(resolver.resolve('Rodada {{round}}, turno {{turn}}', ctx)).toBe('Rodada 3, turno 2');
    });

    it('leaves unresolved placeholders intact', () => {
      expect(resolver.resolve('{{eventData.unknown}} test', ctx)).toBe('{{eventData.unknown}} test');
    });

    it('passes through strings without templates', () => {
      expect(resolver.resolve('texto simples', ctx)).toBe('texto simples');
    });

    it('resolves variables', () => {
      expect(resolver.resolve('Roll: {{variables.rollResult}}', ctx)).toBe('Roll: 18');
    });
  });

  describe('resolveNumeric()', () => {
    it('resolves a plain number string', () => {
      expect(resolver.resolveNumeric('5', ctx)).toBe(5);
    });

    it('resolves a negative number string', () => {
      expect(resolver.resolveNumeric('-10', ctx)).toBe(-10);
    });

    it('resolves template expression to number', () => {
      expect(resolver.resolveNumeric('{{eventData.damage}}', ctx)).toBe(15);
    });

    it('resolves arithmetic expression', () => {
      expect(resolver.resolveNumeric('{{eventData.damage}} * 2', ctx)).toBe(30);
    });

    it('returns 0 for invalid/unsafe expressions', () => {
      expect(resolver.resolveNumeric('require("fs")', ctx)).toBe(0);
      expect(resolver.resolveNumeric('process.exit()', ctx)).toBe(0);
    });
  });
});
