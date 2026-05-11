import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AutomationAggregate } from '../../../domain/automation/entities/automation.aggregate';
import type { AutomationDefinition, TriggerType } from '../../../domain/automation/dsl/automation.types';
import { AutomationDocument } from './schemas/automation.schema';

/**
 * MongooseAutomationRepository
 *
 * Replaces the in-memory AutomationRepository in production.
 * Wire this in rules-engine.module.ts by providing it in place of AutomationRepository.
 */
@Injectable()
export class MongooseAutomationRepository {
  constructor(
    @InjectModel(AutomationDocument.name)
    private readonly model: Model<AutomationDocument>,
  ) {}

  async findById(id: string): Promise<AutomationAggregate | null> {
    const doc = await this.model.findOne({ id }).lean().exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByTrigger(
    triggerType: TriggerType,
    system: AutomationDefinition['system'],
  ): Promise<AutomationAggregate[]> {
    const docs = await this.model
      .find({ 'trigger.type': triggerType, system, isEnabled: true })
      .lean()
      .exec();
    return docs.map(this.toDomain.bind(this));
  }

  async findByCreator(createdBy: string): Promise<AutomationAggregate[]> {
    const docs = await this.model.find({ createdBy }).lean().exec();
    return docs.map(this.toDomain.bind(this));
  }

  async findTemplates(system: AutomationDefinition['system']): Promise<AutomationAggregate[]> {
    const docs = await this.model.find({ isTemplate: true, system }).lean().exec();
    return docs.map(this.toDomain.bind(this));
  }

  async save(automation: AutomationAggregate): Promise<void> {
    await this.model.create(this.toDocument(automation));
  }

  async update(automation: AutomationAggregate): Promise<void> {
    await this.model
      .updateOne({ id: automation.id }, { $set: this.toDocument(automation) })
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }

  // ─── Mapping ─────────────────────────────────────────────────────────────

  private toDomain(doc: Record<string, unknown>): AutomationAggregate {
    return AutomationAggregate.reconstitute({
      id: doc['id'] as string,
      name: doc['name'] as string,
      description: doc['description'] as string | undefined,
      system: doc['system'] as AutomationDefinition['system'],
      scope: doc['scope'] as AutomationDefinition['scope'],
      isTemplate: doc['isTemplate'] as boolean,
      isEnabled: doc['isEnabled'] as boolean,
      trigger: doc['trigger'] as AutomationDefinition['trigger'],
      condition: doc['condition'] as AutomationDefinition['condition'],
      actions: doc['actions'] as AutomationDefinition['actions'],
      maxFiresPerRound: doc['maxFiresPerRound'] as number | undefined,
      tags: doc['tags'] as string[],
      createdBy: doc['createdBy'] as string,
      createdAt: doc['createdAt'] as Date,
      updatedAt: doc['updatedAt'] as Date,
    });
  }

  private toDocument(a: AutomationAggregate): Record<string, unknown> {
    return {
      id: a.id,
      name: a.name,
      description: a.description,
      system: a.system,
      scope: a.scope,
      isTemplate: a.isTemplate,
      isEnabled: a.isEnabled,
      trigger: a.trigger,
      condition: a.condition,
      actions: a.actions,
      maxFiresPerRound: a.maxFiresPerRound,
      tags: a.tags,
      createdBy: a.createdBy,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    };
  }
}
