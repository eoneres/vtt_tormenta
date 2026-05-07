import { FormulaEvaluator } from '../../src/domain/formula/entities/formula-evaluator';

describe('FormulaEvaluator', () => {
  let evaluator: FormulaEvaluator;

  beforeEach(() => {
    evaluator = new FormulaEvaluator();
  });

  it('evaluates simple addition', () => {
    expect(evaluator.evaluate('2 + 3')).toBe(5);
  });

  it('evaluates subtraction', () => {
    expect(evaluator.evaluate('10 - 4')).toBe(6);
  });

  it('evaluates multiplication', () => {
    expect(evaluator.evaluate('3 * 4')).toBe(12);
  });

  it('evaluates division', () => {
    expect(evaluator.evaluate('10 / 2')).toBe(5);
  });

  it('evaluates floor()', () => {
    expect(evaluator.evaluate('floor(7 / 2)')).toBe(3);
  });

  it('evaluates ceil()', () => {
    expect(evaluator.evaluate('ceil(7 / 2)')).toBe(4);
  });

  it('evaluates min() and max()', () => {
    expect(evaluator.evaluate('min(3, 5)')).toBe(3);
    expect(evaluator.evaluate('max(3, 5)')).toBe(5);
  });

  it('evaluates T20 attribute modifier formula', () => {
    // floor((16 - 10) / 2) = 3
    expect(evaluator.evaluate('floor((value - 10) / 2)', { value: 16 })).toBe(3);
    // floor((8 - 10) / 2) = -1
    expect(evaluator.evaluate('floor((value - 10) / 2)', { value: 8 })).toBe(-1);
  });

  it('substitutes context variables', () => {
    expect(evaluator.evaluate('a + b', { a: 5, b: 3 })).toBe(8);
  });

  it('handles negative numbers', () => {
    expect(evaluator.evaluate('-3 + 5')).toBe(2);
  });

  it('throws on division by zero', () => {
    expect(() => evaluator.evaluate('5 / 0')).toThrow('Division by zero');
  });

  it('throws on unknown token', () => {
    expect(() => evaluator.evaluate('foo(1)')).toThrow();
  });
});
