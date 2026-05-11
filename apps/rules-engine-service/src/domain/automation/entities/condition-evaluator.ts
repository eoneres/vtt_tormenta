import type {
  AutomationCondition,
  SimpleCondition,
  CompositeCondition,
  NotCondition,
  AutomationEventContext,
} from '../dsl/automation.types';

/**
 * ConditionEvaluator
 *
 * Evaluates AutomationCondition trees against an event context.
 * Uses a safe JSONPath-like accessor to resolve field references.
 * No eval() usage — all operations are explicit and typed.
 */
export class ConditionEvaluator {
  evaluate(condition: AutomationCondition, context: AutomationEventContext): boolean {
    switch (condition.type) {
      case 'simple':
        return this.evaluateSimple(condition, context);
      case 'and':
        return this.evaluateAnd(condition, context);
      case 'or':
        return this.evaluateOr(condition, context);
      case 'not':
        return this.evaluateNot(condition, context);
      default:
        return false;
    }
  }

  private evaluateSimple(cond: SimpleCondition, context: AutomationEventContext): boolean {
    const fieldValue = this.resolveField(cond.field, context);

    switch (cond.operator) {
      case 'eq':        return fieldValue === cond.value;
      case 'ne':        return fieldValue !== cond.value;
      case 'gt':        return typeof fieldValue === 'number' && typeof cond.value === 'number' && fieldValue > cond.value;
      case 'gte':       return typeof fieldValue === 'number' && typeof cond.value === 'number' && fieldValue >= cond.value;
      case 'lt':        return typeof fieldValue === 'number' && typeof cond.value === 'number' && fieldValue < cond.value;
      case 'lte':       return typeof fieldValue === 'number' && typeof cond.value === 'number' && fieldValue <= cond.value;
      case 'contains':
        if (Array.isArray(fieldValue)) return fieldValue.includes(cond.value);
        if (typeof fieldValue === 'string' && typeof cond.value === 'string') return fieldValue.includes(cond.value);
        return false;
      case 'not_contains':
        if (Array.isArray(fieldValue)) return !fieldValue.includes(cond.value);
        if (typeof fieldValue === 'string' && typeof cond.value === 'string') return !fieldValue.includes(cond.value);
        return true;
      case 'is_true':   return fieldValue === true || fieldValue === 1 || fieldValue === 'true';
      case 'is_false':  return fieldValue === false || fieldValue === 0 || fieldValue === 'false';
      case 'is_null':   return fieldValue === null || fieldValue === undefined;
      case 'is_not_null': return fieldValue !== null && fieldValue !== undefined;
      default:          return false;
    }
  }

  private evaluateAnd(cond: CompositeCondition, context: AutomationEventContext): boolean {
    return cond.conditions.every((c) => this.evaluate(c, context));
  }

  private evaluateOr(cond: CompositeCondition, context: AutomationEventContext): boolean {
    return cond.conditions.some((c) => this.evaluate(c, context));
  }

  private evaluateNot(cond: NotCondition, context: AutomationEventContext): boolean {
    return !this.evaluate(cond.condition, context);
  }

  /**
   * Resolves a dot-notation field path against the context.
   * Supported roots: token, target, roll, event, variables, round, turn
   *
   * Examples:
   *   "eventData.damage"      → context.eventData.damage
   *   "variables.rollResult"  → context.variables.rollResult
   *   "round"                 → context.round
   */
  resolveField(path: string, context: AutomationEventContext): unknown {
    const parts = path.split('.');
    let current: unknown = this.getRootValue(parts[0]!, context);

    for (let i = 1; i < parts.length; i++) {
      if (current === null || current === undefined) return undefined;
      if (typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[parts[i]!];
    }

    return current;
  }

  private getRootValue(root: string, context: AutomationEventContext): unknown {
    switch (root) {
      case 'eventData':  return context.eventData;
      case 'variables':  return context.variables;
      case 'round':      return context.round;
      case 'turn':       return context.turn;
      case 'sourceTokenId': return context.sourceTokenId;
      case 'targetTokenId': return context.targetTokenId;
      default:           return undefined;
    }
  }
}
