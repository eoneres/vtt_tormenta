import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TokenDocument } from '../schemas/token.schema';
import { MapToken } from '../../../../domain/token/entities/map-token.entity';
import type { ITokenRepository } from '../../../../domain/token/repositories/token.repository';
import type { Position, TokenAura } from '@vtt/shared-types';

@Injectable()
export class MongooseTokenRepository implements ITokenRepository {
  constructor(@InjectModel(TokenDocument.name) private readonly model: Model<TokenDocument>) {}

  async findById(id: string): Promise<MapToken | null> {
    const doc = await this.model.findById(id).lean();
    return doc ? this.toDomain(doc) : null;
  }

  async findByMap(mapId: string): Promise<MapToken[]> {
    const docs = await this.model.find({ mapId }).lean();
    return docs.map((d) => this.toDomain(d));
  }

  async save(token: MapToken): Promise<void> {
    await this.model.findByIdAndUpdate(
      token.id,
      {
        _id: token.id,
        mapId: token.mapId,
        characterId: token.characterId,
        npcId: token.npcId,
        name: token.name,
        imageUrl: token.imageUrl,
        position: token.position,
        size: token.size,
        hp: token.hp,
        maxHp: token.maxHp,
        conditions: token.conditions,
        auras: token.auras,
        isVisible: token.isVisible,
        controlledBy: token.controlledBy,
      },
      { upsert: true, new: true },
    );
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
  }

  async deleteByMap(mapId: string): Promise<void> {
    await this.model.deleteMany({ mapId });
  }

  private toDomain(doc: Record<string, unknown>): MapToken {
    return MapToken.reconstitute({
      id: String(doc['_id']),
      mapId: doc['mapId'] as string,
      characterId: (doc['characterId'] as string | null) ?? null,
      npcId: (doc['npcId'] as string | null) ?? null,
      name: doc['name'] as string,
      imageUrl: doc['imageUrl'] as string,
      position: doc['position'] as Position,
      size: doc['size'] as number,
      hp: (doc['hp'] as number | null) ?? null,
      maxHp: (doc['maxHp'] as number | null) ?? null,
      conditions: (doc['conditions'] as string[]) ?? [],
      auras: (doc['auras'] as TokenAura[]) ?? [],
      isVisible: doc['isVisible'] as boolean,
      controlledBy: (doc['controlledBy'] as string[]) ?? [],
      createdAt: doc['createdAt'] as Date,
      updatedAt: doc['updatedAt'] as Date,
    });
  }
}
