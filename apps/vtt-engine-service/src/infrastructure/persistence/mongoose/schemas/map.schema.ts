import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GridType } from '@vtt/shared-types';

@Schema({ collection: 'maps', timestamps: true })
export class MapDocument extends Document {
  @Prop({ required: true }) campaignId!: string;
  @Prop({ required: true }) name!: string;
  @Prop({ required: true }) imageUrl!: string;
  @Prop({ required: true, enum: GridType }) gridType!: GridType;
  @Prop({ required: true }) gridSize!: number;
  @Prop({ required: true }) width!: number;
  @Prop({ required: true }) height!: number;
  @Prop({ type: [Object], default: [] }) layers!: object[];
  @Prop({ type: [Object], default: [] }) walls!: object[];
}

export const MapSchema = SchemaFactory.createForClass(MapDocument);
MapSchema.index({ campaignId: 1 });
