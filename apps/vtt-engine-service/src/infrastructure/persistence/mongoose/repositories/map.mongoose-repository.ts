import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MapDocument } from '../schemas/map.schema';
import { GameMap } from '../../../../domain/map/entities/game-map.entity';
import type { IMapRepository } from '../../../../domain/map/repositories/map.repository';
import type { GridType, LayerConfig, Wall } from '@vtt/shared-types';

@Injectable()
export class MongooseMapRepository implements IMapRepository {
  constructor(@InjectModel(MapDocument.name) private readonly model: Model<MapDocument>) {}

  async findById(id: string): Promise<GameMap | null> {
    const doc = await this.model.findById(id).lean();
    return doc ? this.toDomain(doc) : null;
  }

  async findByCampaign(campaignId: string): Promise<GameMap[]> {
    const docs = await this.model.find({ campaignId }).lean();
    return docs.map((d) => this.toDomain(d));
  }

  async save(map: GameMap): Promise<void> {
    await this.model.findByIdAndUpdate(
      map.id,
      {
        _id: map.id,
        campaignId: map.campaignId,
        name: map.name,
        imageUrl: map.imageUrl,
        gridType: map.gridType,
        gridSize: map.gridSize,
        width: map.width,
        height: map.height,
        layers: map.layers,
        walls: map.walls,
      },
      { upsert: true, new: true },
    );
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
  }

  private toDomain(doc: Record<string, unknown>): GameMap {
    return GameMap.reconstitute({
      id: String(doc['_id']),
      campaignId: doc['campaignId'] as string,
      name: doc['name'] as string,
      imageUrl: doc['imageUrl'] as string,
      gridType: doc['gridType'] as GridType,
      gridSize: doc['gridSize'] as number,
      width: doc['width'] as number,
      height: doc['height'] as number,
      layers: (doc['layers'] as LayerConfig[]) ?? [],
      walls: (doc['walls'] as Wall[]) ?? [],
      createdAt: doc['createdAt'] as Date,
      updatedAt: doc['updatedAt'] as Date,
    });
  }
}
