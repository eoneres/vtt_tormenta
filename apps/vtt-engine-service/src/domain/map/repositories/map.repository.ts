import type { GameMap } from '../entities/game-map.entity';

export interface IMapRepository {
  findById(id: string): Promise<GameMap | null>;
  findByCampaign(campaignId: string): Promise<GameMap[]>;
  save(map: GameMap): Promise<void>;
  delete(id: string): Promise<void>;
}

export const MAP_REPOSITORY = Symbol('IMapRepository');
