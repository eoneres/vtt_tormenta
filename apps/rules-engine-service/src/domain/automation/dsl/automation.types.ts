/**
 * Automation DSL — System-Agnostic Rule Automation
 *
 * Automations are JSON-serializable definitions that describe:
 *  - WHEN something happens (Trigger)
 *  - IF a condition is met (Condition)
 *  - DO something (Action)
 *
 * Designed to be RPG-system agnostic. System-specific automations
 * are implemented as plugins that emit well-known events.
 */

// ─── Trigger Types ────────────────────────────────────────────────────────────

export type TriggerType =
  | 'ON_TURN_START'
  | 'ON_TURN_END'
  | 'ON_ATTACK_ROLL'
  | 'ON_DAMAGE_DEALT'
  | 'ON_DAMAGE_RECEIVED'
  | 'ON_HP_CHANGE'
  | 'ON_HP_BELOW_THRESHOLD'
  | 'ON_CONDITION_APPLIED'
  | 'ON_CONDITION_REMOVED'
  | 'ON_SPELL_CAST'
  | 'ON_ABILITY_USED'
  | 'ON_INITIATIVE_ROLLED'
  | 'ON_ROUND_START'
  | 'ON_ROUND_END'
  | 'ON_COMBAT_START'
  | 'ON_COMBAT_END'
  | 'ON_MOVE'
  | 'MANUAL';

export interface TriggerDefinition {
  type: TriggerType;
  /** Optional filter: only trigger for specific token IDs */
  tokenId?: string;
  /** For HP_BELOW_THRESHOLD: the HP percentage threshold (0-100) */
  hpThreshold?: number;
  /** For condition triggers: which condition name */
  conditionName?: string;
  /** For spell/ability triggers: which spell/ability ID */
  abilityId?: string;
}

// ─── Condition Types ─────────────────────────────────────────────────────────

export type ConditionOperator =
  | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'contains' | 'not_contains'
  | 'is_true' | 'is_false'
  | 'is_null' | 'is_not_null';

export interface SimpleCondition {
  type: 'simple';
  /** JSONPath-like expression into the event context, e.g. "token.hp", "roll.total" */
  field: string;
  operator: ConditionOperator;
  value?: string | number | boolean;
}

export interface CompositeCondition {
  type: 'and' | 'or';
  conditions: AutomationCondition[];
}

export interface NotCondition {
  type: 'not';
  condition: AutomationCondition;
}

export type AutomationCondition = SimpleCondition | CompositeCondition | NotCondition;

// ─── Action Types ─────────────────────────────────────────────────────────────

export type ActionType =
  | 'APPLY_CONDITION'
  | 'REMOVE_CONDITION'
  | 'MODIFY_HP'
  | 'MODIFY_MP'
  | 'ROLL_DICE'
  | 'APPLY_DAMAGE'
  | 'HEAL'
  | 'SEND_CHAT_MESSAGE'
  | 'SET_TOKEN_ATTRIBUTE'
  | 'TRIGGER_AUTOMATION'
  | 'PLAY_SOUND'
  | 'SHOW_ANIMATION'
  | 'ADD_TO_INITIATIVE'
  | 'REMOVE_FROM_INITIATIVE';

export interface ActionTarget {
  type: 'self' | 'target' | 'all_allies' | 'all_enemies' | 'all_tokens' | 'specific';
  tokenId?: string;
}

export interface BaseAction {
  type: ActionType;
  target: ActionTarget;
  /** Template expressions can reference event context via {{field}} syntax */
  label?: string;
}

export interface ApplyConditionAction extends BaseAction {
  type: 'APPLY_CONDITION';
  conditionName: string;
  /** Duration in rounds; undefined = permanent */
  durationRounds?: number;
}

export interface RemoveConditionAction extends BaseAction {
  type: 'REMOVE_CONDITION';
  conditionName: string;
}

export interface ModifyHpAction extends BaseAction {
  type: 'MODIFY_HP';
  /** Template: e.g. "-{{roll.total}}" or "+5" */
  amount: string;
  isHealing?: boolean;
}

export interface ModifyMpAction extends BaseAction {
  type: 'MODIFY_MP';
  amount: string;
}

export interface RollDiceAction extends BaseAction {
  type: 'ROLL_DICE';
  notation: string;
  /** Key to store the result in context for subsequent actions */
  storeAs?: string;
  /** Whether to announce in chat */
  announce?: boolean;
}

export interface SendChatAction extends BaseAction {
  type: 'SEND_CHAT_MESSAGE';
  /** Supports {{variable}} template syntax */
  message: string;
  flavor?: string;
}

export interface SetTokenAttributeAction extends BaseAction {
  type: 'SET_TOKEN_ATTRIBUTE';
  attributeKey: string;
  value: string | number | boolean;
}

export interface PlaySoundAction extends BaseAction {
  type: 'PLAY_SOUND';
  soundId: string;
  volume?: number;
}

export interface TriggerAutomationAction extends BaseAction {
  type: 'TRIGGER_AUTOMATION';
  automationId: string;
}

export type AutomationAction =
  | ApplyConditionAction
  | RemoveConditionAction
  | ModifyHpAction
  | ModifyMpAction
  | RollDiceAction
  | SendChatAction
  | SetTokenAttributeAction
  | PlaySoundAction
  | TriggerAutomationAction;

// ─── Automation Definition ────────────────────────────────────────────────────

export interface AutomationDefinition {
  id: string;
  name: string;
  description?: string;
  system: 'tormenta20' | 'dnd5e' | 'shadowrun' | 'custom';
  /** Who can use this automation */
  scope: 'global' | 'campaign' | 'character';
  isTemplate: boolean;
  isEnabled: boolean;
  trigger: TriggerDefinition;
  condition?: AutomationCondition;
  actions: AutomationAction[];
  /** Maximum times this can fire per round (prevents infinite loops) */
  maxFiresPerRound?: number;
  /** Tags for organization */
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Execution Context ────────────────────────────────────────────────────────

export interface AutomationEventContext {
  tableId: string;
  campaignId: string;
  triggerType: TriggerType;
  /** The token that triggered the automation */
  sourceTokenId?: string;
  /** The target token of the triggering action */
  targetTokenId?: string;
  /** Event-specific data (roll result, damage amount, etc.) */
  eventData: Record<string, unknown>;
  /** Variables accumulated during execution */
  variables: Record<string, unknown>;
  /** Round and turn info */
  round: number;
  turn: number;
}

export interface AutomationExecutionResult {
  automationId: string;
  fired: boolean;
  conditionMet: boolean;
  actionsExecuted: number;
  actionResults: ActionExecutionResult[];
  error?: string;
  durationMs: number;
}

export interface ActionExecutionResult {
  actionType: ActionType;
  success: boolean;
  output?: Record<string, unknown>;
  error?: string;
}
