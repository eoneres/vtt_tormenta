import type { Campaign } from '../entities/campaign.entity';
import type { PaginationQuery, PaginatedResult } from '@vtt/shared-types';

export interface CampaignFilters {
  ownerId?: string;
  systemId?: string;
  isPublic?: boolean;
}

export interface ICampaignRepository {
  findById(id: string): Promise<Campaign | null>;
  findByOwner(ownerId: string, query: PaginationQuery): Promise<PaginatedResult<Campaign>>;
  findPublic(query: PaginationQuery, filters?: CampaignFilters): Promise<PaginatedResult<Campaign>>;
  save(campaign: Campaign): Promise<void>;
  delete(id: string): Promise<void>;
}

export const CAMPAIGN_REPOSITORY = Symbol('ICampaignRepository');
