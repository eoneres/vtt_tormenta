import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketplaceListingOrmEntity } from '../entities/marketplace-listing.orm-entity';
import { MarketplaceListing } from '../../../../domain/listing/entities/marketplace-listing.entity';
import type {
  IMarketplaceListingRepository,
  MarketplaceListingFilters,
} from '../../../../domain/listing/repositories/marketplace-listing.repository';
import type { PaginationQuery, PaginatedResult } from '@vtt/shared-types';
import { buildPaginatedResult, getPaginationOffset } from '@vtt/shared-utils';

@Injectable()
export class TypeOrmMarketplaceListingRepository implements IMarketplaceListingRepository {
  constructor(
    @InjectRepository(MarketplaceListingOrmEntity)
    private readonly repo: Repository<MarketplaceListingOrmEntity>,
  ) {}

  async findById(id: string): Promise<MarketplaceListing | null> {
    const row = await this.repo.findOneBy({ id });
    return row ? this.toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<MarketplaceListing | null> {
    const row = await this.repo.findOneBy({ slug, status: 'approved' });
    return row ? this.toDomain(row) : null;
  }

  async findApproved(query: PaginationQuery, filters?: MarketplaceListingFilters): Promise<PaginatedResult<MarketplaceListing>> {
    const { skip, take } = getPaginationOffset(query);
    const qb = this.repo.createQueryBuilder('listing').where('listing.status = :status', { status: 'approved' });

    if (filters?.system) qb.andWhere('listing.system = :system', { system: filters.system });
    if (filters?.category) qb.andWhere('listing.category = :category', { category: filters.category });
    if (filters?.pricingModel) qb.andWhere('listing.pricingModel = :pricingModel', { pricingModel: filters.pricingModel });
    if (filters?.query) {
      const term = `%${filters.query.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(listing.title) LIKE :term OR LOWER(listing.description) LIKE :term OR ARRAY_TO_STRING(listing.tags, \\',\') ILIKE :term)',
        { term },
      );
    }

    const [rows, total] = await qb.skip(skip).take(take).orderBy('listing.createdAt', 'DESC').getManyAndCount();
    return buildPaginatedResult(rows.map((row) => this.toDomain(row)), total, query);
  }

  async findAllApproved(filters?: MarketplaceListingFilters): Promise<MarketplaceListing[]> {
    const qb = this.repo.createQueryBuilder('listing').where('listing.status = :status', { status: 'approved' });
    if (filters?.system) qb.andWhere('listing.system = :system', { system: filters.system });
    if (filters?.category) qb.andWhere('listing.category = :category', { category: filters.category });
    if (filters?.pricingModel) qb.andWhere('listing.pricingModel = :pricingModel', { pricingModel: filters.pricingModel });
    const rows = await qb.orderBy('listing.createdAt', 'DESC').getMany();
    return rows.map((row) => this.toDomain(row));
  }

  async findByCreator(creatorId: string, query: PaginationQuery): Promise<PaginatedResult<MarketplaceListing>> {
    const { skip, take } = getPaginationOffset(query);
    const [rows, total] = await this.repo.findAndCount({
      where: { creatorId },
      skip,
      take,
      order: { updatedAt: 'DESC' },
    });
    return buildPaginatedResult(rows.map((row) => this.toDomain(row)), total, query);
  }

  async save(listing: MarketplaceListing): Promise<void> {
    await this.repo.save(this.toOrm(listing));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(row: MarketplaceListingOrmEntity): MarketplaceListing {
    return MarketplaceListing.reconstitute({
      id: row.id,
      creatorId: row.creatorId,
      title: row.title,
      slug: row.slug,
      description: row.description,
      shortDescription: row.shortDescription,
      category: row.category as any,
      tags: row.tags,
      system: row.system,
      pricingModel: row.pricingModel as any,
      priceInCentavos: row.priceInCentavos,
      minPwyw: row.minPwyw,
      coverImageUrl: row.coverImageUrl,
      assets: row.assets,
      status: row.status as any,
      reviewNote: row.reviewNote,
      downloadCount: row.downloadCount,
      purchaseCount: row.purchaseCount,
      totalRevenueCentavos: row.totalRevenueCentavos,
      reviews: row.reviews,
      averageRating: row.averageRating,
      version: row.version,
      changelog: row.changelog,
      publishedAt: row.publishedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private toOrm(listing: MarketplaceListing): MarketplaceListingOrmEntity {
    const row = new MarketplaceListingOrmEntity();
    Object.assign(row, {
      id: listing.id,
      creatorId: listing.creatorId,
      title: listing.title,
      slug: listing.slug,
      description: listing.description,
      shortDescription: listing.shortDescription,
      category: listing.category,
      tags: listing.tags,
      system: listing.system,
      pricingModel: listing.pricingModel,
      priceInCentavos: listing.priceInCentavos,
      minPwyw: listing.minPwyw,
      coverImageUrl: listing.coverImageUrl,
      assets: listing.assets,
      status: listing.status,
      reviewNote: listing.reviewNote,
      downloadCount: listing.downloadCount,
      purchaseCount: listing.purchaseCount,
      totalRevenueCentavos: listing.totalRevenueCentavos,
      reviews: listing.reviews,
      averageRating: listing.averageRating,
      version: listing.version,
      changelog: listing.changelog,
      publishedAt: listing.publishedAt,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    });
    return row;
  }
}
