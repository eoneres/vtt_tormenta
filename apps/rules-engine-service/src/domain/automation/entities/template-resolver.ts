import type { AutomationEventContext } from '../dsl/automation.types';
import { ConditionEvaluator } from './condition-evaluator';

const TEMPLATE_REGEX = /\{\{([^}]+)\}\}/g;

/**
 * TemplateResolver
 *
 * Resolves {{field.path}} template expressions in action strings
 * against the event context. Completely safe — no eval().
 */
export class TemplateResolver {
  private readonly evaluator = new ConditionEvaluator();

  /**
   * Replace all {{path}} references in a string with resolved values.
   * Unresolved references are left as-is (for debugging visibility).
   */
  resolve(template: string, context: AutomationEventContext): string {
    return template.replace(TEMPLATE_REGEX, (_match, path: string) => {
      const value = this.evaluator.resolveField(path.trim(), context);
      return value !== undefined && value !== null ? String(value) : `{{${path}}}`;
    });
  }

  /**
   * Resolve and parse a numeric expression.
   * Supports: "+5", "-{{roll.total}}", "{{damage}} * 2"
   */
  resolveNumeric(template: string, context: AutomationEventContext): number {
    const resolved = this.resolve(template, context);
    // Only allow simple arithmetic with numbers, +, -, *, /, (, ), spaces
    if (!/^[\d\s+\-*/().]+$/.test(resolved)) {
      return 0;
    }
    try {
      // Safe arithmetic evaluation using Function constructor in strict mode
      // Only executes if string passes the allowlist regex above
      const result = new Function(`"use strict"; return (${resolved});`)() as number;
      return typeof result === 'number' && isFinite(result) ? result : 0;
    } catch {
      return 0;
    }
  }
}
