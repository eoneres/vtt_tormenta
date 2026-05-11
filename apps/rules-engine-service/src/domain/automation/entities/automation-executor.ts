import { Injectable, Logger } from '@nestjs/common';
import { DiceEngine } from '../../dice/entities/dice-engine';
import { ConditionEvaluator } from './condition-evaluator';
import { TemplateResolver } from './template-resolver';
import type {
  AutomationDefinition,
  AutomationEventContext,
  AutomationExecutionResult,
  ActionExecutionResult,
  AutomationAction,
  ApplyConditionAction,
  RemoveConditionAction,
  ModifyHpAction,
  RollDiceAction,
  SendChatAction,
} from '../dsl/automation.types';

// ─── Game State Adapter (injected by the room/service layer) ─────────────────

export interface IGameStateAdapter {
  getTokenHp(tableId: string, tokenId: string): Promise<{ hp: number; maxHp: number }>;
  setTokenHp(tableId: string, tokenId: string, hp: number): Promise<void>;
  getTokenConditions(tableId: string, tokenId: string): Promise<string[]>;
  addTokenCondition(tableId: string, tokenId: string, condition: string): Promise<void>;
  removeTokenCondition(tableId: string, tokenId: string, condition: string): Promise<void>;
  sendChatMessage(tableId: string, message: string, flavor?: string): Promise<void>;
}

// ─── Executor ─────────────────────────────────────────────────────────────────

@Injectable()
export class AutomationExecutor {
  private readonly logger = new Logger(AutomationExecutor.name);
  private readonly conditionEvaluator = new ConditionEvaluator();
  private readonly templateResolver = new TemplateResolver();

  constructor(
    private readonly diceEngine: DiceEngine,
    private readonly stateAdapter: IGameStateAdapter,
  ) {}

  async execute(
    automation: AutomationDefinition,
    context: AutomationEventContext,
  ): Promise<AutomationExecutionResult> {
    const start = Date.now();
    const result: AutomationExecutionResult = {
      automationId: automation.id,
      fired: false,
      conditionMet: false,
      actionsExecuted: 0,
      actionResults: [],
      durationMs: 0,
    };

    try {
      // Evaluate condition gate
      if (automation.condition) {
        result.conditionMet = this.conditionEvaluator.evaluate(automation.condition, context);
        if (!result.conditionMet) {
          result.durationMs = Date.now() - start;
          return result;
        }
      } else {
        result.conditionMet = true;
      }

      result.fired = true;

      // Execute each action in sequence
      for (const action of automation.actions) {
        const actionResult = await this.executeAction(action, context, automation);
        result.actionResults.push(actionResult);
        result.actionsExecuted++;

        // On critical action failure, stop execution
        if (!actionResult.success && actionResult.error?.includes('FATAL')) {
          this.logger.warn(`Automation ${automation.id} halted on fatal action error`);
          break;
        }
      }
    } catch (err) {
      result.error = err instanceof Error ? err.message : String(err);
      this.logger.error(`Automation ${automation.id} execution error`, err);
    }

    result.durationMs = Date.now() - start;
    return result;
  }

  private async executeAction(
    action: AutomationAction,
    context: AutomationEventContext,
    automation: AutomationDefinition,
  ): Promise<ActionExecutionResult> {
    try {
      const output = await this.dispatchAction(action, context);
      return { actionType: action.type, success: true, output };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Action ${action.type} failed in automation ${automation.id}: ${error}`);
      return { actionType: action.type, success: false, error };
    }
  }

  private async dispatchAction(
    action: AutomationAction,
    context: AutomationEventContext,
  ): Promise<Record<string, unknown>> {
    switch (action.type) {
      case 'ROLL_DICE':
        return this.executeRollDice(action as RollDiceAction, context);
      case 'MODIFY_HP':
        return this.executeModifyHp(action as ModifyHpAction, context);
      case 'APPLY_CONDITION':
        return this.executeApplyCondition(action as ApplyConditionAction, context);
      case 'REMOVE_CONDITION':
        return this.executeRemoveCondition(action as RemoveConditionAction, context);
      case 'SEND_CHAT_MESSAGE':
        return this.executeSendChat(action as SendChatAction, context);
      case 'HEAL':
        return this.executeHeal(action as ModifyHpAction, context);
      default:
        this.logger.warn(`Unsupported action type: ${action.type}`);
        return { skipped: true, reason: 'unsupported_action_type' };
    }
  }

  // ─── Action Implementations ───────────────────────────────────────────────

  private executeRollDice(
    action: RollDiceAction,
    context: AutomationEventContext,
  ): Record<string, unknown> {
    const notation = this.templateResolver.resolve(action.notation, context);
    const result = this.diceEngine.roll(
      { notation },
      context.sourceTokenId ?? 'automation',
    );

    // Store result in context variables if requested
    if (action.storeAs) {
      context.variables[action.storeAs] = result.total;
      context.variables[`${action.storeAs}_rolls`] = result.rolls;
      context.variables[`${action.storeAs}_breakdown`] = result.breakdown;
    }

    return {
      notation,
      total: result.total,
      rolls: result.rolls,
      breakdown: result.breakdown,
    };
  }

  private async executeModifyHp(
    action: ModifyHpAction,
    context: AutomationEventContext,
  ): Promise<Record<string, unknown>> {
    const tokenId = this.resolveTargetToken(action, context);
    if (!tokenId) return { skipped: true, reason: 'no_target_token' };

    const delta = this.templateResolver.resolveNumeric(action.amount, context);
    const { hp, maxHp } = await this.stateAdapter.getTokenHp(context.tableId, tokenId);
    const newHp = Math.max(0, Math.min(maxHp, hp + delta));
    await this.stateAdapter.setTokenHp(context.tableId, tokenId, newHp);

    return { tokenId, previousHp: hp, newHp, delta };
  }

  private async executeHeal(
    action: ModifyHpAction,
    context: AutomationEventContext,
  ): Promise<Record<string, unknown>> {
    const positiveAction: ModifyHpAction = {
      ...action,
      // Ensure heal is always positive
      amount: action.amount.startsWith('-') ? action.amount.slice(1) : action.amount,
    };
    return this.executeModifyHp(positiveAction, context);
  }

  private async executeApplyCondition(
    action: ApplyConditionAction,
    context: AutomationEventContext,
  ): Promise<Record<string, unknown>> {
    const tokenId = this.resolveTargetToken(action, context);
    if (!tokenId) return { skipped: true, reason: 'no_target_token' };

    await this.stateAdapter.addTokenCondition(context.tableId, tokenId, action.conditionName);
    return { tokenId, conditionName: action.conditionName };
  }

  private async executeRemoveCondition(
    action: RemoveConditionAction,
    context: AutomationEventContext,
  ): Promise<Record<string, unknown>> {
    const tokenId = this.resolveTargetToken(action, context);
    if (!tokenId) return { skipped: true, reason: 'no_target_token' };

    await this.stateAdapter.removeTokenCondition(context.tableId, tokenId, action.conditionName);
    return { tokenId, conditionName: action.conditionName };
  }

  private async executeSendChat(
    action: SendChatAction,
    context: AutomationEventContext,
  ): Promise<Record<string, unknown>> {
    const message = this.templateResolver.resolve(action.message, context);
    const flavor = action.flavor
      ? this.templateResolver.resolve(action.flavor, context)
      : undefined;

    await this.stateAdapter.sendChatMessage(context.tableId, message, flavor);
    return { message, flavor };
  }

  // ─── Target Resolution ────────────────────────────────────────────────────

  private resolveTargetToken(
    action: AutomationAction,
    context: AutomationEventContext,
  ): string | null {
    switch (action.target.type) {
      case 'self':     return context.sourceTokenId ?? null;
      case 'target':   return context.targetTokenId ?? null;
      case 'specific': return action.target.tokenId ?? null;
      default:         return context.sourceTokenId ?? null;
    }
  }
}
