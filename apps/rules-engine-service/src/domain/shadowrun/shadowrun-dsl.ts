/**
 * Shadowrun DSL — Domain Specific Language
 *
 * Implementa as mecânicas únicas de Shadowrun:
 * - Dice Pools (d6 system)
 * - Glitch Detection (falhas críticas)
 * - Edge System (reroll pool)
 * - Damage Resistance
 * - Attribute + Skill combinations
 */

export interface DicePoolRollResult {
  rolls: number[];
  successes: number;
  isGlitch: boolean; // 50%+ failed dice = glitch
  isCriticalGlitch: boolean; // Glitch com 0 successes = crítico
  totalHits: number;
  rerolled?: boolean;
  edgeUsed?: boolean;
}

export interface ShadowrunAttribute {
  value: number; // 1-18 tipicamente
  augmented?: number; // Com cyber/magia
}

export interface ShadowrunSkill {
  name: string;
  rating: number; // 1-6
  attribute: keyof ShadowrunAttributes;
  specialization?: string;
  bonus?: number;
}

export interface ShadowrunAttributes {
  body: ShadowrunAttribute;
  agility: ShadowrunAttribute;
  reaction: ShadowrunAttribute;
  strength: ShadowrunAttribute;
  willpower: ShadowrunAttribute;
  logic: ShadowrunAttribute;
  intuition: ShadowrunAttribute;
  charisma: ShadowrunAttribute;
  edge: ShadowrunAttribute; // 1-7 normalmente
}

/**
 * DicePool System — núcleo de Shadowrun
 * Rola N d6, conta sucessos (4+), detecta glitches
 */
export class ShadowrunDicePool {
  /**
   * Rola um pool de dados
   */
  static roll(poolSize: number): DicePoolRollResult {
    if (poolSize < 1) {
      return {
        rolls: [],
        successes: 0,
        isGlitch: false,
        isCriticalGlitch: false,
        totalHits: 0,
      };
    }

    const rolls = Array.from({ length: poolSize }, () => Math.floor(Math.random() * 6) + 1);

    const successes = rolls.filter((r) => r >= 4).length;
    const failures = rolls.filter((r) => r === 1).length;
    const failureRate = failures / poolSize;

    // Glitch: 50% ou mais de dados falhando
    const isGlitch = failureRate >= 0.5;
    const isCriticalGlitch = isGlitch && successes === 0;

    return {
      rolls,
      successes,
      isGlitch,
      isCriticalGlitch,
      totalHits: successes,
    };
  }

  /**
   * Test com atributo + skill
   */
  static test(attribute: number, skill: number, bonus: number = 0): DicePoolRollResult {
    const poolSize = Math.max(0, attribute + skill + bonus);
    const result = this.roll(poolSize);

    return {
      ...result,
      totalHits: result.successes, // Em testes simples, hits = sucessos
    };
  }

  /**
   * Combat roll (oposto de dois pools)
   */
  static opposedTest(
    attacker: { attribute: number; skill: number; bonus?: number },
    defender: { attribute: number; skill: number; bonus?: number },
  ): { attackerHits: number; defenderHits: number; attackerWins: boolean } {
    const attackPool = this.roll(attacker.attribute + attacker.skill + (attacker.bonus || 0));
    const defendPool = this.roll(defender.attribute + defender.skill + (defender.bonus || 0));

    const attackerHits = attackPool.successes;
    const defenderHits = defendPool.successes;

    return {
      attackerHits,
      defenderHits,
      attackerWins: attackerHits > defenderHits,
    };
  }

  /**
   * Threshold Test — precisa de X sucessos mínimos
   */
  static thresholdTest(poolSize: number, threshold: number): boolean {
    const result = this.roll(poolSize);
    return result.successes >= threshold;
  }

  /**
   * Extended Test — acumula sucessos ao longo do tempo
   */
  static extendedTest(
    poolSize: number,
    threshold: number,
    maxAttempts: number = 10,
  ): { success: boolean; totalSuccesses: number; attempts: number; glitches: DicePoolRollResult[] } {
    let totalSuccesses = 0;
    let attempts = 0;
    const glitches: DicePoolRollResult[] = [];

    while (totalSuccesses < threshold && attempts < maxAttempts) {
      const roll = this.roll(poolSize);
      totalSuccesses += roll.successes;
      attempts++;

      if (roll.isGlitch) {
        glitches.push(roll);
        if (roll.isCriticalGlitch) {
          // Critical glitch = zera tudo
          totalSuccesses = 0;
          break;
        }
      }
    }

    return {
      success: totalSuccesses >= threshold,
      totalSuccesses,
      attempts,
      glitches,
    };
  }

  /**
   * Edge — reroll failed dice
   * Gasta Edge do personagem para reroller dados que falharam
   */
  static useEdge(result: DicePoolRollResult, edgeAvailable: number): DicePoolRollResult {
    if (edgeAvailable < 1 || result.rerolled) {
      return result;
    }

    const failedDice = result.rolls.filter((r) => r < 4);
    if (failedDice.length === 0) {
      return result; // Nada para reroller
    }

    // Reroller todos os falhas
    const rerolls = Array.from({ length: failedDice.length }, () =>
      Math.floor(Math.random() * 6) + 1,
    );
    const newSuccesses = rerolls.filter((r) => r >= 4).length;

    return {
      ...result,
      rolls: [...result.rolls, ...rerolls],
      successes: result.successes + newSuccesses,
      totalHits: result.successes + newSuccesses,
      rerolled: true,
      edgeUsed: true,
    };
  }
}

/**
 * Damage Calculation
 */
export class ShadowrunDamage {
  /**
   * Armor Rating reduz dano
   */
  static applyArmor(baseDamage: number, armorRating: number): number {
    const armorEffectiveness = Math.ceil(armorRating / 2);
    return Math.max(1, baseDamage - armorEffectiveness);
  }

  /**
   * Damage Resistance via testes de resistência
   */
  static resistancTest(
    damage: number,
    attributes: {
      body: number;
      willpower: number;
    },
    resistanceType: 'physical' | 'magical' | 'stun',
  ): { finalDamage: number; resistanceHits: number } {
    const resistanceAttribute = resistanceType === 'magical' ? attributes.willpower : attributes.body;
    const result = ShadowrunDicePool.roll(resistanceAttribute);

    // Cada sucesso de resistência reduz 1 dano
    const finalDamage = Math.max(1, damage - result.successes);

    return {
      finalDamage,
      resistanceHits: result.successes,
    };
  }

  /**
   * Drain (dano mágico aos lançadores)
   */
  static calculateDrain(spellLevel: number, charisma: number): DicePoolRollResult {
    const drainAttribute = charisma;
    const drainPoolSize = spellLevel + drainAttribute;

    return ShadowrunDicePool.roll(Math.max(1, drainPoolSize));
  }

  /**
   * Fading (dano a usuários de magia astral)
   */
  static calculateFading(spellLevel: number, willpower: number): DicePoolRollResult {
    const fadingPoolSize = spellLevel + willpower;
    return ShadowrunDicePool.roll(Math.max(1, fadingPoolSize));
  }
}

/**
 * Initiative System
 */
export class ShadowrunInitiative {
  /**
   * Calcula iniciativa de combate
   */
  static calculateInitiative(
    reaction: number,
    intuition: number,
    bonusFromSpell?: number,
  ): number {
    const initiativeScore = reaction + intuition;
    const dicePool = ShadowrunDicePool.roll(initiativeScore + (bonusFromSpell || 0));

    return initiativeScore * 10 + dicePool.totalHits; // Base + sorte
  }

  /**
   * Determina ordem de combate
   */
  static determineOrder(combatants: Array<{ name: string; initiative: number }>): string[] {
    return combatants.sort((a, b) => b.initiative - a.initiative).map((c) => c.name);
  }
}

/**
 * Matrix System (Hacking)
 */
export class ShadowrunMatrix {
  /**
   * Matrix Attack (Hacker vs Defender)
   */
  static matrixAttack(
    hackerLogic: number,
    hackerComputer: number, // Skill
    systemDefenseRating: number,
    targetFirewall: number,
  ): boolean {
    const attackPool = hackerLogic + hackerComputer;
    const defendPool = systemDefenseRating + targetFirewall;

    const attackResult = ShadowrunDicePool.roll(attackPool);
    const defendResult = ShadowrunDicePool.roll(defendPool);

    return attackResult.successes > defendResult.successes;
  }

  /**
   * Jack Out test para escapar antes de crash
   */
  static jackOutTest(willpower: number, biofeedbackDamage: number): DicePoolRollResult {
    const poolSize = Math.max(1, willpower - biofeedbackDamage);
    return ShadowrunDicePool.roll(poolSize);
  }
}

/**
 * Magic System (Spell Casting)
 */
export class ShadowrunMagic {
  /**
   * Spellcasting test
   */
  static castSpell(
    magicAttribute: number, // Magia do lançador
    spellSkill: number, // Habilidade em magia
    spellLevel: number,
    targetDefenseAttribute: number = 0, // Se alvo resiste
  ): {
    castSuccess: boolean;
    drain: DicePoolRollResult;
    targetResistance?: DicePoolRollResult;
  } {
    const castPool = magicAttribute + spellSkill;
    const castResult = ShadowrunDicePool.roll(castPool);

    const drain = ShadowrunDamage.calculateDrain(spellLevel, magicAttribute);

    const resistance = targetDefenseAttribute > 0 ? ShadowrunDicePool.roll(targetDefenseAttribute) : undefined;

    return {
      castSuccess: castResult.successes > 0,
      drain,
      targetResistance: resistance,
    };
  }

  /**
   * Counterspell test
   */
  static counterspell(casterWillpower: number, countermagic: number): DicePoolRollResult {
    return ShadowrunDicePool.roll(casterWillpower + countermagic);
  }
}

export const ShadowrunSystem = {
  DicePool: ShadowrunDicePool,
  Damage: ShadowrunDamage,
  Initiative: ShadowrunInitiative,
  Matrix: ShadowrunMatrix,
  Magic: ShadowrunMagic,
};
