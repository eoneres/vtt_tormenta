import { FormulaEvaluator } from '../formula/entities/formula-evaluator';
import type { SystemDefinition } from '@vtt/shared-types';

export interface CharacterContext {
  [key: string]: number;
}

/**
 * Computes derived stats (PV, PM, Defesa, skills) from a character context
 * using the system's formula definitions.
 */
export class CharacterFormulaResolver {
  private readonly evaluator = new FormulaEvaluator();

  resolveResource(
    resourceId: string,
    system: SystemDefinition,
    ctx: CharacterContext,
  ): number {
    const resource = system.resources.find((r) => r.id === resourceId);
    if (!resource) throw new Error(`Resource not found: ${resourceId}`);
    return this.evaluator.evaluate(resource.formula, ctx);
  }

  resolveAttributeModifier(attributeValue: number, system: SystemDefinition): number {
    const formula = (system as unknown as { attribute_modifier_formula: string }).attribute_modifier_formula
      ?? 'floor((value - 10) / 2)';
    return this.evaluator.evaluate(formula, { value: attributeValue });
  }

  resolveDefense(
    defenseId: string,
    system: SystemDefinition,
    ctx: CharacterContext,
  ): number {
    const defenses = (system as unknown as { defenses: Array<{ id: string; formula: string }> }).defenses ?? [];
    const defense = defenses.find((d) => d.id === defenseId);
    if (!defense) throw new Error(`Defense not found: ${defenseId}`);
    return this.evaluator.evaluate(defense.formula, ctx);
  }
}
