import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'tokens', timestamps: true })
export class TokenDocument extends Document {
  @Prop({ required: true }) mapId!: string;
  @Prop({ default: null }) characterId!: string | null;
  @Prop({ default: null }) npcId!: string | null;
  @Prop({ required: true }) name!: string;
  @Prop({ required: true }) imageUrl!: string;
  @Prop({ type: Object, required: true }) position!: { x: number; y: number };
  @Prop({ default: 1 }) size!: number;
  @Prop({ default: null }) hp!: number | null;
  @Prop({ default: null }) maxHp!: number | null;
  @Prop({ type: [String], default: [] }) conditions!: string[];
  @Prop({ type: [Object], default: [] }) auras!: object[];
  @Prop({ default: true }) isVisible!: boolean;
  @Prop({ type: [String], default: [] }) controlledBy!: string[];
}

export const TokenSchema = SchemaFactory.createForClass(TokenDocument);
TokenSchema.index({ mapId: 1 });
