import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AutomationAggregate, CreateAutomationProps } from '../../domain/automation/entities/automation.aggregate';
import { AutomationExecutor } from '../../domain/automation/entities/automation-executor';
import type {
  AutomationDefinition,
  AutomationEventContext,
  AutomationExecutionResult,
  TriggerType,
} from '../../domain/automation/dsl/automation.types';

// ─── In-memory repository (replace with MongoDB in production) ────────────────

const store = new Map<string, AutomationAggregate>();

@Injectable()
export class AutomationRepository {
  async findById(id: string): Promise<AutomationAggregate | null> {
    return store.get(id) ?? null;
  }

  async findByTrigger(
    triggerType: TriggerType,
    system: AutomationDefinition['system'],
  ): Promise<AutomationAggregate[]> {
    return Array.from(store.values()).filter(
      (a) => a.trigger.type === triggerType && a.system === system && a.isEnabled,
    );
  }

  async findByCreator(createdBy: string): Promise<AutomationAggregate[]> {
    return Array.from(store.values()).filter((a) => a.createdBy === createdBy);
  }

  async findTemplates(system: AutomationDefinition['system']): Promise<AutomationAggregate[]> {
    return Array.from(store.values()).filter((a) => a.isTemplate && a.system === system);
  }

  async save(automation: AutomationAggregate): Promise<void> {
    store.set(automation.id, automation);
  }

  async delete(id: string): Promise<void> {
    store.delete(id);
  }
}

// ─── Use Cases ────────────────────────────────────────────────────────────────

@Injectable()
export class CreateAutomationUseCase {
  constructor(private readonly repo: AutomationRepository) {}

  async execute(
    props: CreateAutomationProps,
    requesterId: string,
  ): Promise<AutomationDefinition> {
    const automation = AutomationAggregate.create({
      ...props,
      createdBy: requesterId,
    });
    await this.repo.save(automation);
    return automation.toPlainObject();
  }
}

@Injectable()
export class GetAutomationUseCase {
  constructor(private readonly repo: AutomationRepository) {}

  async execute(id: string): Promise<AutomationDefinition> {
    const automation = await this.repo.findById(id);
    if (!automation) throw new NotFoundException(`Automation "${id}" not found`);
    return automation.toPlainObject();
  }
}

@Injectable()
export class ListTemplatesUseCase {
  constructor(private readonly repo: AutomationRepository) {}

  async execute(system: AutomationDefinition['system']): Promise<AutomationDefinition[]> {
    const templates = await this.repo.findTemplates(system);
    return templates.map((a) => a.toPlainObject());
  }
}

@Injectable()
export class ToggleAutomationUseCase {
  constructor(private readonly repo: AutomationRepository) {}

  async execute(
    id: string,
    enabled: boolean,
    requesterId: string,
    isAdmin: boolean,
  ): Promise<AutomationDefinition> {
    const automation = await this.repo.findById(id);
    if (!automation) throw new NotFoundException(`Automation "${id}" not found`);
    if (!automation.canBeEditedBy(requesterId, isAdmin)) {
      throw new ForbiddenException('Not authorized to modify this automation');
    }
    enabled ? automation.enable() : automation.disable();
    await this.repo.save(automation);
    return automation.toPlainObject();
  }
}

@Injectable()
export class DeleteAutomationUseCase {
  constructor(private readonly repo: AutomationRepository) {}

  async execute(id: string, requesterId: string, isAdmin: boolean): Promise<void> {
    const automation = await this.repo.findById(id);
    if (!automation) throw new NotFoundException(`Automation "${id}" not found`);
    if (!automation.canBeEditedBy(requesterId, isAdmin)) {
      throw new ForbiddenException('Not authorized to delete this automation');
    }
    await this.repo.delete(id);
  }
}

@Injectable()
export class FireAutomationsByTriggerUseCase {
  constructor(
    private readonly repo: AutomationRepository,
    private readonly executor: AutomationExecutor,
  ) {}

  async execute(
    triggerType: TriggerType,
    system: AutomationDefinition['system'],
    context: AutomationEventContext,
  ): Promise<AutomationExecutionResult[]> {
    const automations = await this.repo.findByTrigger(triggerType, system);
    const results: AutomationExecutionResult[] = [];

    for (const automation of automations) {
      // Check token filter on trigger
      if (
        automation.trigger.tokenId &&
        automation.trigger.tokenId !== context.sourceTokenId
      ) {
        continue;
      }

      const result = await this.executor.execute(automation, context);
      results.push(result);
    }

    return results;
  }
}
