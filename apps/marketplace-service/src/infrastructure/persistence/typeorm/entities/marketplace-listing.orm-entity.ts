import { Column, Entity, PrimaryColumn } from 'typeorm';
import type { ListingAsset, ListingReview, ListingStatus, PricingModel } from '../../../../domain/listing/entities/marketplace-listing.entity';

@Entity('marketplace_listings')
export class MarketplaceListingOrmEntity {
  @PrimaryColumn('text')
  id!: string;

  @Column('text')
  creatorId!: string;

  @Column('text')
  title!: string;

  @Column('text', { nullable: true })
  slug?: string;

  @Column('text')
  description!: string;

  @Column('text', { nullable: true })
  shortDescription?: string;

  @Column('text')
  category!: string;

  @Column('text', { array: true, default: [] })
  tags!: string[];

  @Column('text')
  system!: string;

  @Column({ type: 'enum', enum: ['free', 'paid', 'pwyw'], default: 'free' })
  pricingModel!: PricingModel;

  @Column('int')
  priceInCentavos!: number;

  @Column('int', { nullable: true })
  minPwyw?: number;

  @Column('text', { nullable: true })
  coverImageUrl?: string;

  @Column('jsonb', { default: [] })
  assets!: ListingAsset[];

  @Column({ type: 'enum', enum: ['draft', 'under_review', 'approved', 'rejected', 'suspended', 'archived'], default: 'draft' })
  status!: ListingStatus;

  @Column('text', { nullable: true })
  reviewNote?: string;

  @Column('int', { default: 0 })
  downloadCount!: number;

  @Column('int', { default: 0 })
  purchaseCount!: number;

  @Column('int', { default: 0 })
  totalRevenueCentavos!: number;

  @Column('jsonb', { default: [] })
  reviews!: ListingReview[];

  @Column('float', { nullable: true })
  averageRating?: number;

  @Column('text')
  version!: string;

  @Column('text', { nullable: true })
  changelog?: string;

  @Column('timestamptz', { nullable: true })
  publishedAt?: Date;

  @Column('timestamptz')
  createdAt!: Date;

  @Column('timestamptz')
  updatedAt!: Date;
}
