import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'compendium_entries', timestamps: true })
export class EntryDocument extends Document {
  @Prop({ required: true, unique: true })
  entryId!: string;

  @Prop({ required: true, enum: ['tormenta20', 'dnd5e', 'shadowrun'] })
  system!: string;

  @Prop({ required: true, enum: ['race', 'class', 'spell', 'item', 'monster', 'power'] })
  type!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ required: true, type: Object })
  content!: Record<string, unknown>;

  createdAt!: Date;
  updatedAt!: Date;
}

export const EntrySchema = SchemaFactory.createForClass(EntryDocument);
EntrySchema.index({ name: 'text', description: 'text', 'content.summary': 'text', 'content.details': 'text' });
