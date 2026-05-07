import { DiceEngine } from '../../src/domain/dice/entities/dice-engine';

const SECRET = 'test-hmac-secret';

describe('DiceEngine', () => {
  let engine: DiceEngine;

  beforeEach(() => {
    engine = new DiceEngine(SECRET);
  });

  describe('parseNotation', () => {
    it('parses simple notation: d20', () => {
      const parsed = engine.parseNotation('d20');
      expect(parsed.count).toBe(1);
      expect(parsed.sides).toBe(20);
      expect(parsed.modifier).toBe(0);
    });

    it('parses notation with count: 2d6', () => {
      const parsed = engine.parseNotation('2d6');
      expect(parsed.count).toBe(2);
      expect(parsed.sides).toBe(6);
    });

    it('parses notation with positive modifier: 1d20+5', () => {
      const parsed = engine.parseNotation('1d20+5');
      expect(parsed.modifier).toBe(5);
    });

    it('parses notation with negative modifier: 2d8-2', () => {
      const parsed = engine.parseNotation('2d8-2');
      expect(parsed.modifier).toBe(-2);
    });

    it('parses keep highest: 4d6kh3', () => {
      const parsed = engine.parseNotation('4d6kh3');
      expect(parsed.count).toBe(4);
      expect(parsed.keepHighest).toBe(3);
    });

    it('parses exploding dice: 1d6!', () => {
      const parsed = engine.parseNotation('1d6!');
      expect(parsed.exploding).toBe(true);
    });

    it('throws on invalid notation', () => {
      expect(() => engine.parseNotation('invalid')).toThrow('Invalid dice notation');
    });

    it('throws on count > 100', () => {
      expect(() => engine.parseNotation('101d6')).toThrow();
    });
  });

  describe('roll', () => {
    it('returns result within valid range for 1d20', () => {
      const result = engine.roll({ notation: '1d20', systemId: 'tormenta20' }, 'user-1');
      expect(result.total).toBeGreaterThanOrEqual(1);
      expect(result.total).toBeLessThanOrEqual(20);
    });

    it('returns result within valid range for 2d6+3', () => {
      const result = engine.roll({ notation: '2d6+3', systemId: 'tormenta20' }, 'user-1');
      expect(result.total).toBeGreaterThanOrEqual(5);
      expect(result.total).toBeLessThanOrEqual(15);
    });

    it('produces deterministic result for same seed', () => {
      const result = engine.roll({ notation: '1d20', systemId: 'tormenta20' }, 'user-1');
      expect(engine.verify(result)).toBe(true);
    });

    it('populates required audit fields', () => {
      const result = engine.roll({ notation: '1d20', systemId: 'tormenta20' }, 'user-42');
      expect(result.id).toBeDefined();
      expect(result.seed).toBeDefined();
      expect(result.signature).toBeDefined();
      expect(result.rolledBy).toBe('user-42');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('includes breakdown string', () => {
      const result = engine.roll({ notation: '1d20', systemId: 'tormenta20' }, 'user-1');
      expect(result.breakdown).toContain('=');
    });
  });

  describe('verify', () => {
    it('returns true for untampered result', () => {
      const result = engine.roll({ notation: '2d6', systemId: 'tormenta20' }, 'user-1');
      expect(engine.verify(result)).toBe(true);
    });

    it('returns false if total is tampered', () => {
      const result = engine.roll({ notation: '1d20', systemId: 'tormenta20' }, 'user-1');
      const tampered = { ...result, total: result.total + 10 };
      expect(engine.verify(tampered)).toBe(false);
    });

    it('returns false if seed is tampered', () => {
      const result = engine.roll({ notation: '1d20', systemId: 'tormenta20' }, 'user-1');
      const tampered = { ...result, seed: 'tampered_seed' };
      expect(engine.verify(tampered)).toBe(false);
    });
  });
});
