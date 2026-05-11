import type { MarketplaceListing } from '../entities/marketplace-listing.entity';
import type { PaginationQuery, PaginatedResult } from '@vtt/shared-types';

export interface MarketplaceListingFilters {
  system?: string;
  category?: string;
  pricingModel?: 'free' | 'paid' | 'pwyw';
  query?: string;
}

export interface IMarketplaceListingRepository {
  findById(id: string): Promise<MarketplaceListing | null>;
  findBySlug(slug: string): Promise<MarketplaceListing | null>;
  findApproved(query: PaginationQuery, filters?: MarketplaceListingFilters): Promise<PaginatedResult<MarketplaceListing>>;
  findAllApproved(filters?: MarketplaceListingFilters): Promise<MarketplaceListing[]>;
  findByCreator(creatorId: string, query: PaginationQuery): Promise<PaginatedResult<MarketplaceListing>>;
  save(listing: MarketplaceListing): Promise<void>;
  delete(id: string): Promise<void>;
}

export const MARKETPLACE_LISTING_REPOSITORY = Symbol('IMarketplaceListingRepository');
