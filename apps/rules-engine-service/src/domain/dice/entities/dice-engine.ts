import { createHmac, randomBytes } from 'crypto';
import { generateId } from '@vtt/shared-utils';
import type { DiceRollResult, DiceRollRequest } from '@vtt/shared-types';

interface ParsedDiceExpression {
  count: number;
  sides: number;
  modifier: number;
  keepHighest: number | null;
  keepLowest: number | null;
  exploding: boolean;
  rerollBelow: number | null;
}

export class DiceEngine {
  private readonly hmacSecret: string;

  constructor(hmacSecret: string) {
    this.hmacSecret = hmacSecret;
  }

  roll(request: DiceRollRequest, rolledBy: string): DiceRollResult {
    const seed = randomBytes(16).toString('hex');
    const parsed = this.parseNotation(request.notation);
    const rolls = this.executeRolls(parsed, seed);
    const total = this.calculateTotal(rolls, parsed);
    const breakdown = this.buildBreakdown(rolls, parsed, total);
    const signature = this.sign(seed, total, request.notation, rolledBy);

    return {
      id: generateId(),
      notation: request.notation,
      rolls,
      total,
      breakdown,
      seed,
      signature,
      timestamp: new Date(),
      rolledBy,
    };
  }

  verify(result: DiceRollResult): boolean {
    const expected = this.sign(result.seed, result.total, result.notation, result.rolledBy);
    return expected === result.signature;
  }

  parseNotation(notation: string): ParsedDiceExpression {
    // Supports: 1d20, 2d6+3, 4d6kh3, 1d6!, 2d8-1, d20
    const normalized = notation.toLowerCase().trim();

    let exploding = false;
    let keepHighest: number | null = null;
    let keepLowest: number | null = null;
    let rerollBelow: number | null = null;
    let modifier = 0;

    let working = normalized;

    // Exploding dice: 1d6!
    if (working.includes('!')) {
      exploding = true;
      working = working.replace('!', '');
    }

    // Keep highest: 4d6kh3
    const khMatch = working.match(/kh(\d+)/);
    if (khMatch?.[1]) {
      keepHighest = parseInt(khMatch[1], 10);
      working = working.replace(/kh\d+/, '');
    }

    // Keep lowest: 4d6kl1
    const klMatch = working.match(/kl(\d+)/);
    if (klMatch?.[1]) {
      keepLowest = parseInt(klMatch[1], 10);
      working = working.replace(/kl\d+/, '');
    }

    // Reroll below: 2d6r2
    const rerollMatch = working.match(/r(\d+)/);
    if (rerollMatch?.[1]) {
      rerollBelow = parseInt(rerollMatch[1], 10);
      working = working.replace(/r\d+/, '');
    }

    // Modifier: +3 or -2
    const modMatch = working.match(/([+-]\d+)$/);
    if (modMatch?.[1]) {
      modifier = parseInt(modMatch[1], 10);
      working = working.replace(/[+-]\d+$/, '');
    }

    // Dice: 2d6 or d20
    const diceMatch = working.match(/^(\d*)d(\d+)$/);
    if (!diceMatch) {
      throw new Error(`Invalid dice notation: ${notation}`);
    }

    const count = diceMatch[1] ? parseInt(diceMatch[1], 10) : 1;
    const sides = parseInt(diceMatch[2]!, 10);

    if (count < 1 || count > 100) throw new Error('Dice count must be between 1 and 100');
    if (sides < 2 || sides > 1000) throw new Error('Dice sides must be between 2 and 1000');

    return { count, sides, modifier, keepHighest, keepLowest, exploding, rerollBelow };
  }

  private executeRolls(parsed: ParsedDiceExpression, seed: string): number[] {
    const rolls: number[] = [];

    for (let i = 0; i < parsed.count; i++) {
      let roll = this.rollSingle(parsed.sides, seed, i);

      // Reroll once if below threshold
      if (parsed.rerollBelow !== null && roll <= parsed.rerollBelow) {
        roll = this.rollSingle(parsed.sides, seed, i + 1000);
      }

      rolls.push(roll);

      // Exploding dice: keep rolling on max
      if (parsed.exploding) {
        let explodeRoll = roll;
        let explodeCount = 0;
        while (explodeRoll === parsed.sides && explodeCount < 10) {
          explodeRoll = this.rollSingle(parsed.sides, seed, i + 2000 + explodeCount);
          rolls.push(explodeRoll);
          explodeCount++;
        }
      }
    }

    return rolls;
  }

  private rollSingle(sides: number, seed: string, index: number): number {
    // Deterministic roll from seed + index for auditability
    const hash = createHmac('sha256', this.hmacSecret)
      .update(`${seed}:${index}`)
      .digest('hex');
    const value = parseInt(hash.slice(0, 8), 16);
    return (value % sides) + 1;
  }

  private calculateTotal(rolls: number[], parsed: ParsedDiceExpression): number {
    let activeRolls = [...rolls];

    if (parsed.keepHighest !== null) {
      activeRolls = [...rolls].sort((a, b) => b - a).slice(0, parsed.keepHighest);
    } else if (parsed.keepLowest !== null) {
      activeRolls = [...rolls].sort((a, b) => a - b).slice(0, parsed.keepLowest);
    }

    return activeRolls.reduce((sum, r) => sum + r, 0) + parsed.modifier;
  }

  private buildBreakdown(rolls: number[], parsed: ParsedDiceExpression, total: number): string {
    const rollStr = rolls.join(', ');
    const modStr = parsed.modifier !== 0
      ? ` ${parsed.modifier > 0 ? '+' : ''}${parsed.modifier}`
      : '';
    return `[${rollStr}]${modStr} = ${total}`;
  }

  private sign(seed: string, total: number, notation: string, rolledBy: string): string {
    return createHmac('sha256', this.hmacSecret)
      .update(`${seed}:${total}:${notation}:${rolledBy}`)
      .digest('hex');
  }
}
