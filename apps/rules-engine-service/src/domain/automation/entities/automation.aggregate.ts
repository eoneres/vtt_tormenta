import { generateId } from '@vtt/shared-utils';
import type {
  AutomationDefinition,
  TriggerDefinition,
  AutomationCondition,
  AutomationAction,
} from '../dsl/automation.types';

export type { AutomationDefinition };

export interface CreateAutomationProps {
  name: string;
  description?: string;
  system: AutomationDefinition['system'];
  scope: AutomationDefinition['scope'];
  isTemplate: boolean;
  trigger: TriggerDefinition;
  condition?: AutomationCondition;
  actions: AutomationAction[];
  maxFiresPerRound?: number;
  tags?: string[];
  createdBy: string;
}

/**
 * AutomationAggregate
 *
 * Domain entity representing a single automation rule.
 * Immutable after construction except via explicit commands.
 */
export class AutomationAggregate implements AutomationDefinition {
  readonly id: string;
  readonly system: AutomationDefinition['system'];
  readonly scope: AutomationDefinition['scope'];
  readonly isTemplate: boolean;
  readonly createdBy: string;
  readonly createdAt: Date;

  name: string;
  description?: string;
  isEnabled: boolean;
  trigger: TriggerDefinition;
  condition?: AutomationCondition;
  actions: AutomationAction[];
  maxFiresPerRound?: number;
  tags: string[];
  updatedAt: Date;

  private constructor(props: AutomationDefinition) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.system = props.system;
    this.scope = props.scope;
    this.isTemplate = props.isTemplate;
    this.isEnabled = props.isEnabled;
    this.trigger = props.trigger;
    this.condition = props.condition;
    this.actions = props.actions;
    this.maxFiresPerRound = props.maxFiresPerRound;
    this.tags = props.tags;
    this.createdBy = props.createdBy;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: CreateAutomationProps): AutomationAggregate {
    if (props.actions.length === 0) {
      throw new Error('Automation must have at least one action');
    }
    if (props.actions.length > 20) {
      throw new Error('Automation cannot have more than 20 actions');
    }

    const now = new Date();
    return new AutomationAggregate({
      id: generateId(),
      ...props,
      isEnabled: true,
      tags: props.tags ?? [],
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: AutomationDefinition): AutomationAggregate {
    return new AutomationAggregate(props);
  }

  enable(): void {
    this.isEnabled = true;
    this.updatedAt = new Date();
  }

  disable(): void {
    this.isEnabled = false;
    this.updatedAt = new Date();
  }

  updateActions(actions: AutomationAction[]): void {
    if (actions.length === 0) throw new Error('Automation must have at least one action');
    if (actions.length > 20) throw new Error('Too many actions');
    this.actions = actions;
    this.updatedAt = new Date();
  }

  updateCondition(condition?: AutomationCondition): void {
    this.condition = condition;
    this.updatedAt = new Date();
  }

  canBeEditedBy(userId: string, isAdmin: boolean): boolean {
    if (isAdmin) return true;
    if (this.isTemplate) return false;
    return this.createdBy === userId;
  }

  toPlainObject(): AutomationDefinition {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      system: this.system,
      scope: this.scope,
      isTemplate: this.isTemplate,
      isEnabled: this.isEnabled,
      trigger: this.trigger,
      condition: this.condition,
      actions: this.actions,
      maxFiresPerRound: this.maxFiresPerRound,
      tags: this.tags,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
