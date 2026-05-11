import { generateId } from '@vtt/shared-utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ListingCategory =
  | 'homebrew_class'      | 'homebrew_race'    | 'homebrew_spell'
  | 'homebrew_monster'    | 'homebrew_item'    | 'homebrew_campaign'
  | 'module'              | 'map_pack'         | 'token_pack'
  | 'sound_pack'          | 'ruleset'          | 'asset_bundle';

export type ListingStatus =
  | 'draft'        // Not yet submitted for review
  | 'under_review' // Submitted, awaiting moderation
  | 'approved'     // Live on marketplace
  | 'rejected'     // Rejected by moderation
  | 'suspended'    // Temporarily removed
  | 'archived';    // Retired by creator

export type PricingModel =
  | 'free'         // No charge
  | 'paid'         // One-time purchase (in centavos BRL)
  | 'pwyw';        // Pay What You Want (minimum price)

export interface ListingAsset {
  type: 'json_content' | 'image' | 'audio' | 'pdf' | 'archive';
  filename: string;
  sizeBytes: number;
  url: string;        // CDN URL after upload
  checksum: string;   // SHA-256 for integrity
}

export interface ListingReview {
  id: string;
  reviewerId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  body?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateListingProps {
  creatorId: string;
  title: string;
  description: string;
  shortDescription?: string;
  category: ListingCategory;
  tags: string[];
  system: string;
  pricingModel: PricingModel;
  priceInCentavos: number;
  minPwyw?: number;
  coverImageUrl?: string;
  assets: ListingAsset[];
  version: string;
  changelog?: string;
  publishedAt?: Date;
}

export interface ListingProps {
  id: string;
  creatorId: string;
  title: string;
  slug: string | undefined;
  description: string;
  shortDescription: string | undefined;
  category: ListingCategory;
  tags: string[];
  system: string;          // 'tormenta20' | 'dnd5e' | etc.
  pricingModel: PricingModel;
  priceInCentavos: number; // 0 for free
  minPwyw: number | undefined;
  coverImageUrl: string | undefined;
  assets: ListingAsset[];
  status: ListingStatus;
  reviewNote: string | undefined;     // Moderator notes
  downloadCount: number;
  purchaseCount: number;
  totalRevenueCentavos: number;
  reviews: ListingReview[];
  averageRating: number | undefined;
  version: string;         // Semantic version of the content
  changelog: string | undefined;
  publishedAt: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Aggregate ────────────────────────────────────────────────────────────────

export class MarketplaceListing {
  readonly id: string;
  readonly creatorId: string;
  readonly category: ListingCategory;
  readonly system: string;
  readonly createdAt: Date;

  title: string;
  slug: string | undefined;
  description: string;
  shortDescription: string | undefined;
  tags: string[];
  pricingModel: PricingModel;
  priceInCentavos: number;
  minPwyw: number | undefined;
  coverImageUrl: string | undefined;
  assets: ListingAsset[];
  status: ListingStatus;
  reviewNote: string | undefined;
  downloadCount: number;
  purchaseCount: number;
  totalRevenueCentavos: number;
  reviews: ListingReview[];
  averageRating: number | undefined;
  version: string;
  changelog: string | undefined;
  publishedAt: Date | undefined;
  updatedAt: Date;

  private constructor(props: ListingProps) {
    this.id = props.id;
    this.creatorId = props.creatorId;
    this.title = props.title;
    this.slug = props.slug;
    this.description = props.description;
    this.shortDescription = props.shortDescription;
    this.category = props.category;
    this.tags = props.tags;
    this.system = props.system;
    this.pricingModel = props.pricingModel;
    this.priceInCentavos = props.priceInCentavos;
    this.minPwyw = props.minPwyw;
    this.coverImageUrl = props.coverImageUrl;
    this.assets = props.assets;
    this.status = props.status;
    this.reviewNote = props.reviewNote;
    this.downloadCount = props.downloadCount;
    this.purchaseCount = props.purchaseCount;
    this.totalRevenueCentavos = props.totalRevenueCentavos;
    this.reviews = props.reviews;
    this.averageRating = props.averageRating;
    this.version = props.version;
    this.changelog = props.changelog;
    this.publishedAt = props.publishedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  // ─── Factory ─────────────────────────────────────────────────────────

  static create(props: CreateListingProps): MarketplaceListing {
    if (!props.title.trim()) throw new Error('Listing title is required');
    if (props.pricingModel === 'paid' && props.priceInCentavos < 100) {
      throw new Error('Paid listings must cost at least R$1,00 (100 centavos)');
    }
    const now = new Date();
    return new MarketplaceListing({
      ...props,
      shortDescription: props.shortDescription ?? undefined,
      minPwyw: props.minPwyw ?? undefined,
      coverImageUrl: props.coverImageUrl ?? undefined,
      changelog: props.changelog ?? undefined,
      publishedAt: props.publishedAt ?? undefined,
      id: generateId(),
      slug: MarketplaceListing.slugify(props.title),
      status: 'draft',
      downloadCount: 0,
      purchaseCount: 0,
      totalRevenueCentavos: 0,
      reviews: [],
      reviewNote: undefined,
      averageRating: undefined,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: ListingProps): MarketplaceListing {
    return new MarketplaceListing(props);
  }

  // ─── Commands ────────────────────────────────────────────────────────

  submitForReview(): void {
    if (this.status !== 'draft') throw new Error('Only draft listings can be submitted');
    if (this.assets.length === 0) throw new Error('Listing must have at least one asset');
    this.status = 'under_review';
    this.touch();
  }

  approve(reviewNote?: string): void {
    this.status = 'approved';
    this.reviewNote = reviewNote;
    this.publishedAt = this.publishedAt ?? new Date();
    this.touch();
  }

  reject(reviewNote: string): void {
    if (!reviewNote.trim()) throw new Error('Rejection must include a reason');
    this.status = 'rejected';
    this.reviewNote = reviewNote;
    this.touch();
  }

  suspend(reason: string): void {
    this.status = 'suspended';
    this.reviewNote = reason;
    this.touch();
  }

  publish(): void {
    if (this.status !== 'approved') throw new Error('Only approved listings can be published');
    this.publishedAt = new Date();
    this.touch();
  }

  recordDownload(): void {
    this.downloadCount += 1;
    this.touch();
  }

  recordPurchase(amountCentavos: number): void {
    this.purchaseCount += 1;
    this.totalRevenueCentavos += amountCentavos;
    this.touch();
  }

  addReview(review: Omit<ListingReview, 'id' | 'createdAt' | 'updatedAt'>): ListingReview {
    // One review per reviewer
    const existing = this.reviews.find((r) => r.reviewerId === review.reviewerId);
    if (existing) throw new Error('User has already reviewed this listing');

    const now = new Date();
    const newReview: ListingReview = {
      ...review,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    this.reviews = [...this.reviews, newReview];
    this.recalculateRating();
    this.touch();
    return newReview;
  }

  updateContent(patch: Partial<Pick<ListingProps, 'title' | 'description' | 'tags' | 'coverImageUrl' | 'changelog' | 'version'>>): void {
    if (patch.title) { this.title = patch.title; this.slug = MarketplaceListing.slugify(patch.title); }
    if (patch.description) this.description = patch.description;
    if (patch.tags) this.tags = patch.tags;
    if (patch.coverImageUrl !== undefined) this.coverImageUrl = patch.coverImageUrl;
    if (patch.changelog) this.changelog = patch.changelog;
    if (patch.version) this.version = patch.version;
    // Content updates reset to draft if approved (requires re-review)
    if (this.status === 'approved') this.status = 'draft';
    this.touch();
  }

  canBeEditedBy(userId: string, isAdmin: boolean): boolean {
    return isAdmin || this.creatorId === userId;
  }

  get priceForDisplay(): string {
    if (this.pricingModel === 'free') return 'Grátis';
    if (this.pricingModel === 'pwyw') {
      return this.minPwyw ? `Pague o quanto quiser (mín. R$${(this.minPwyw / 100).toFixed(2)})` : 'Pague o quanto quiser';
    }
    return `R$${(this.priceInCentavos / 100).toFixed(2)}`;
  }

  // ─── Private ─────────────────────────────────────────────────────────

  private recalculateRating(): void {
    if (this.reviews.length === 0) { this.averageRating = undefined; return; }
    const sum = this.reviews.reduce((s, r) => s + r.rating, 0);
    this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
  }

  private touch(): void { this.updatedAt = new Date(); }

  static slugify(title: string): string {
    return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  toPlainObject(): ListingProps {
    return {
      id: this.id, creatorId: this.creatorId, title: this.title, slug: this.slug,
      description: this.description, shortDescription: this.shortDescription,
      category: this.category, tags: this.tags, system: this.system,
      pricingModel: this.pricingModel, priceInCentavos: this.priceInCentavos,
      minPwyw: this.minPwyw, coverImageUrl: this.coverImageUrl, assets: this.assets,
      status: this.status, reviewNote: this.reviewNote, downloadCount: this.downloadCount,
      purchaseCount: this.purchaseCount, totalRevenueCentavos: this.totalRevenueCentavos,
      reviews: this.reviews, averageRating: this.averageRating, version: this.version,
      changelog: this.changelog, publishedAt: this.publishedAt,
      createdAt: this.createdAt, updatedAt: this.updatedAt,
    };
  }
}
