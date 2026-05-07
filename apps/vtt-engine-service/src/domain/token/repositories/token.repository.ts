import type { MapToken } from '../entities/map-token.entity';

export interface ITokenRepository {
  findById(id: string): Promise<MapToken | null>;
  findByMap(mapId: string): Promise<MapToken[]>;
  save(token: MapToken): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByMap(mapId: string): Promise<void>;
}

export const TOKEN_REPOSITORY = Symbol('ITokenRepository');
