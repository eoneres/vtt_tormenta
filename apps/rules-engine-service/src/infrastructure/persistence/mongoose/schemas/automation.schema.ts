import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  collection: 'automations',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  versionKey: false,
})
export class AutomationDocument extends Document {
  @Prop({ required: true, unique: true }) declare id: string;
  @Prop({ required: true }) name!: string;
  @Prop() description?: string;

  @Prop({ required: true, enum: ['tormenta20', 'dnd5e', 'shadowrun', 'custom'] })
  system!: string;

  @Prop({ required: true, enum: ['global', 'campaign', 'character'] })
  scope!: string;

  @Prop({ required: true, default: false }) isTemplate!: boolean;
  @Prop({ required: true, default: true })  isEnabled!: boolean;

  @Prop({ type: Schema.Types.Mixed, required: true }) trigger!: Record<string, unknown>;
  @Prop({ type: Schema.Types.Mixed }) condition?: Record<string, unknown>;
  @Prop({ type: [Schema.Types.Mixed], required: true }) actions!: Record<string, unknown>[];

  @Prop() maxFiresPerRound?: number;
  @Prop({ type: [String], default: [] }) tags!: string[];
  @Prop({ required: true }) createdBy!: string;
  @Prop({ required: true }) createdAt!: Date;
  @Prop({ required: true }) updatedAt!: Date;
}

export const AutomationSchema = SchemaFactory.createForClass(AutomationDocument);

// ─── Indexes ──────────────────────────────────────────────────────────────────
AutomationSchema.index({ id: 1 }, { unique: true });
AutomationSchema.index({ system: 1, 'trigger.type': 1, isEnabled: 1 });
AutomationSchema.index({ isTemplate: 1, system: 1 });
AutomationSchema.index({ createdBy: 1 });
