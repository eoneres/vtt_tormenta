import { Inject } from '@nestjs/common';
import {
  Controller, Get, Post, Patch,
  Body, Param, Query, Headers, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MarketplaceListing } from '../../../domain/listing/entities/marketplace-listing.entity';
import {
  IMarketplaceListingRepository,
  MARKETPLACE_LISTING_REPOSITORY,
} from '../../../domain/listing/repositories/marketplace-listing.repository';
import type { ListingCategory, PricingModel } from '../../../domain/listing/entities/marketplace-listing.entity';

@ApiTags('Marketplace')
@Controller('v1/marketplace')
export class MarketplaceController {
  constructor(
    @Inject(MARKETPLACE_LISTING_REPOSITORY)
    private readonly repository: IMarketplaceListingRepository,
  ) {}

  // ─── Public browsing ──────────────────────────────────────────────────

  @Get('listings')
  @ApiOperation({ summary: 'Browse approved marketplace listings' })
  @ApiQuery({ name: 'system', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'pricing', enum: ['free', 'paid', 'pwyw'], required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async browse(
    @Query('system') system?: string,
    @Query('category') category?: string,
    @Query('pricing') pricing?: string,
    @Query('q') q?: string,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    const result = await this.repository.findApproved(
      { limit: Number(limit), offset: Number(offset) },
      { system, category, pricingModel: pricing as any, query: q },
    );

    const listings = result.items.map((l) => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      shortDescription: l.shortDescription,
      category: l.category,
      system: l.system,
      pricingModel: l.pricingModel,
      priceDisplay: l.priceForDisplay,
      coverImageUrl: l.coverImageUrl,
      downloadCount: l.downloadCount,
      averageRating: l.averageRating,
      reviewCount: l.reviews.length,
      creatorId: l.creatorId,
      publishedAt: l.publishedAt,
    }));

    return { listings, total: result.total, hasMore: result.total > Number(offset) + Number(limit) };
  }

  @Get('listings/:slug')
  @ApiOperation({ summary: 'Get listing detail by slug' })
  async getBySlug(@Param('slug') slug: string) {
    const listing = await this.repository.findBySlug(slug);
    if (!listing) return { statusCode: 404, message: 'Listing not found' };
    return listing.toPlainObject();
  }

  // ─── Creator endpoints ──────────────────────────────────────────────────

  @Post('listings')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new marketplace listing (draft)' })
  async create(
    @Body() body: {
      title: string; description: string; shortDescription?: string;
      category: ListingCategory; system: string;
      pricingModel: PricingModel; priceInCentavos?: number; minPwyw?: number;
      tags?: string[]; version?: string;
    },
    @Headers('x-user-id') userId: string,
  ) {
    const listing = MarketplaceListing.create({
      creatorId: userId,
      title: body.title,
      description: body.description,
      shortDescription: body.shortDescription,
      category: body.category,
      system: body.system,
      pricingModel: body.pricingModel,
      priceInCentavos: body.priceInCentavos ?? 0,
      minPwyw: body.minPwyw,
      tags: body.tags ?? [],
      version: body.version ?? '1.0.0',
      assets: [],
    });

    await this.repository.save(listing);
    return listing.toPlainObject();
  }

  @Get('my-listings')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all listings by the authenticated creator' })
  async myListings(
    @Headers('x-user-id') userId: string,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    const result = await this.repository.findByCreator(userId, {
      limit: Number(limit),
      offset: Number(offset),
    });

    const listings = result.items.map((l) => ({
      id: l.id,
      title: l.title,
      status: l.status,
      pricingModel: l.pricingModel,
      priceDisplay: l.priceForDisplay,
      downloadCount: l.downloadCount,
      purchaseCount: l.purchaseCount,
      totalRevenueCentavos: l.totalRevenueCentavos,
      averageRating: l.averageRating,
      reviewCount: l.reviews.length,
      updatedAt: l.updatedAt,
    }));

    return { listings, total: result.total };
  }

  @Post('listings/:id/submit')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit listing for review' })
  async submit(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    const listing = await this.repository.findById(id);
    if (!listing || listing.creatorId !== userId) return { statusCode: 403, message: 'Forbidden' };
    listing.submitForReview();
    await this.repository.save(listing);
    return { status: listing.status };
  }

  // ─── Moderation (admin) ───────────────────────────────────────────────

  @Patch('listings/:id/approve')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a listing (admin)' })
  async approve(
    @Param('id') id: string,
    @Body('reviewNote') reviewNote?: string,
  ) {
    const listing = await this.repository.findById(id);
    if (!listing) return { statusCode: 404, message: 'Not found' };
    listing.approve(reviewNote);
    await this.repository.save(listing);
    return { status: listing.status, publishedAt: listing.publishedAt };
  }

  @Patch('listings/:id/reject')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a listing (admin)' })
  async reject(
    @Param('id') id: string,
    @Body('reviewNote') reviewNote: string,
  ) {
    const listing = await this.repository.findById(id);
    if (!listing) return { statusCode: 404, message: 'Not found' };
    listing.reject(reviewNote);
    await this.repository.save(listing);
    return { status: listing.status, reviewNote: listing.reviewNote };
  }

  // ─── Reviews ──────────────────────────────────────────────────────────

  @Post('listings/:id/reviews')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a review for a listing' })
  async addReview(
    @Param('id') id: string,
    @Body() body: { rating: 1|2|3|4|5; title?: string; body?: string },
    @Headers('x-user-id') userId: string,
  ) {
    const listing = await this.repository.findById(id);
    if (!listing || listing.status !== 'approved') return { statusCode: 404, message: 'Not found' };
    const review = listing.addReview({ reviewerId: userId, ...body });
    await this.repository.save(listing);
    return review;
  }

  // ─── Stats ────────────────────────────────────────────────────────────

  @Get('stats')
  @ApiOperation({ summary: 'Marketplace aggregate statistics' })
  async stats() {
    const approved = await this.repository.findAllApproved();
    return {
      totalListings: approved.length,
      freeListings: approved.filter((l) => l.pricingModel === 'free').length,
      paidListings: approved.filter((l) => l.pricingModel === 'paid').length,
      totalDownloads: approved.reduce((s, l) => s + l.downloadCount, 0),
      totalPurchases: approved.reduce((s, l) => s + l.purchaseCount, 0),
      bySystem: Object.fromEntries(
        [...new Set(approved.map((l) => l.system))].map((sys) => [
          sys,
          approved.filter((l) => l.system === sys).length,
        ]),
      ),
    };
  }
}
