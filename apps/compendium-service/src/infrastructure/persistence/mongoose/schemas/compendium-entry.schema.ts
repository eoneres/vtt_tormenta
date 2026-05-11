import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EntryType, GameSystem } from '../../../domain/entry/entry.entity';

@Schema({ _id: false })
class AttributeSchema {
  @Prop({ required: true }) key!: string;
  @Prop({ type: Schema.Types.Mixed, required: true }) value!: unknown;
  @Prop() label?: string;
}

@Schema({ _id: false })
class RelationSchema {
  @Prop({ required: true }) type!: string;
  @Prop({ required: true }) targetId!: string;
  @Prop({ required: true }) targetName!: string;
}

@Schema({ _id: false })
class SourceSchema {
  @Prop({ required: true }) book!: string;
  @Prop() page?: number;
  @Prop() url?: string;
}

@Schema({
  collection: 'compendium_entries',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  versionKey: false,
})
export class CompendiumEntryDocument extends Document {
  @Prop({ required: true }) declare id: string;
  @Prop({ required: true }) name!: string;
  @Prop({ required: true }) slug!: string;
  @Prop({ required: true }) description!: string;
  @Prop() shortDescription?: string;
  @Prop({ required: true, enum: Object.values(EntryType) }) type!: EntryType;
  @Prop({ required: true, enum: ['tormenta20', 'dnd5e', 'shadowrun', 'custom'] }) system!: GameSystem;
  @Prop({ type: [String], default: [] }) tags!: string[];
  @Prop({ type: [AttributeSchema], default: [] }) attributes!: AttributeSchema[];
  @Prop({ type: [RelationSchema], default: [] }) relations!: RelationSchema[];
  @Prop({ type: SourceSchema }) source?: SourceSchema;
  @Prop({ required: true, default: false }) isOfficial!: boolean;
  @Prop({ required: true, default: true }) isHomebrew!: boolean;
  @Prop({ required: true, default: true }) isPublic!: boolean;
  @Prop() createdBy?: string;
  @Prop({ required: true, default: 1 }) version!: number;
  @Prop({ required: true }) searchVector!: string;
  @Prop({ required: true }) createdAt!: Date;
  @Prop({ required: true }) updatedAt!: Date;
}

export const CompendiumEntrySchema = SchemaFactory.createForClass(CompendiumEntryDocument);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Unique constraint on slug + system combination
CompendiumEntrySchema.index({ slug: 1, system: 1 }, { unique: true });
// Domain ID lookup
CompendiumEntrySchema.index({ id: 1 }, { unique: true });
// List queries
CompendiumEntrySchema.index({ system: 1, type: 1, isPublic: 1 });
CompendiumEntrySchema.index({ system: 1, tags: 1 });
CompendiumEntrySchema.index({ createdBy: 1, isHomebrew: 1 });
CompendiumEntrySchema.index({ isOfficial: 1, system: 1 });
// Full-text search index on searchVector
CompendiumEntrySchema.index({ searchVector: 'text', name: 'text', tags: 'text' });
// Sort indexes
CompendiumEntrySchema.index({ name: 1 });
CompendiumEntrySchema.index({ updatedAt: -1 });
