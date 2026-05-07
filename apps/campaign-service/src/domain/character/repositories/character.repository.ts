import type { Character } from '../entities/character.entity';
import type { PaginationQuery, PaginatedResult } from '@vtt/shared-types';

export interface ICharacterRepository {
  findById(id: string): Promise<Character | null>;
  findByCampaign(campaignId: string, query: PaginationQuery): Promise<PaginatedResult<Character>>;
  findByUser(userId: string, query: PaginationQuery): Promise<PaginatedResult<Character>>;
  save(character: Character): Promise<void>;
  delete(id: string): Promise<void>;
}

export const CHARACTER_REPOSITORY = Symbol('ICharacterRepository');
