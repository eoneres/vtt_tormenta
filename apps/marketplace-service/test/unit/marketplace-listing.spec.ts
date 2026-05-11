import { MarketplaceListing, CreateListingProps } from '../../src/domain/listing/entities/marketplace-listing.entity';

function makeListingProps(overrides: Partial<Parameters<typeof MarketplaceListing.create>[0]> = {}) {
  return {
    creatorId: 'creator-1',
    title: 'Masmorra do Rei Lich',
    description: 'Uma campanha épica para 4-6 jogadores de nível 10-15.',
    shortDescription: 'Campanha épica Tormenta20',
    category: 'homebrew_campaign' as const,
    system: 'tormenta20',
    pricingModel: 'free' as const,
    priceInCentavos: 0,
    tags: ['campanha', 'tormenta20', 'alto nível'],
    assets: [],
    version: '1.0.0',
    ...overrides,
  };
}

describe('MarketplaceListing', () => {
  // ─── Creation ──────────────────────────────────────────────────────────

  describe('create()', () => {
    it('creates a listing in draft status', () => {
      const listing = MarketplaceListing.create(makeListingProps());
      expect(listing.status).toBe('draft');
      expect(listing.id).toBeDefined();
    });

    it('generates slug from title', () => {
      const listing = MarketplaceListing.create(makeListingProps({ title: 'Masmorra do Rei Lich' }));
      expect(listing.slug).toBe('masmorra-do-rei-lich');
    });

    it('initializes download and purchase counts to zero', () => {
      const listing = MarketplaceListing.create(makeListingProps());
      expect(listing.downloadCount).toBe(0);
      expect(listing.purchaseCount).toBe(0);
      expect(listing.totalRevenueCentavos).toBe(0);
    });

    it('initializes reviews array as empty', () => {
      const listing = MarketplaceListing.create(makeListingProps());
      expect(listing.reviews).toHaveLength(0);
    });

    it('throws if title is empty', () => {
      expect(() => MarketplaceListing.create(makeListingProps({ title: '' }))).toThrow();
    });

    it('throws if paid listing has price < 100 centavos', () => {
      expect(() => MarketplaceListing.create(makeListingProps({
        pricingModel: 'paid',
        priceInCentavos: 50,
      }))).toThrow(/100 centavos/);
    });

    it('allows paid listing with price >= 100 centavos', () => {
      const listing = MarketplaceListing.create(makeListingProps({
        pricingModel: 'paid',
        priceInCentavos: 2990,
      }));
      expect(listing.pricingModel).toBe('paid');
      expect(listing.priceInCentavos).toBe(2990);
    });
  });

  // ─── Status workflow ───────────────────────────────────────────────────

  describe('status workflow', () => {
    it('submitForReview requires at least one asset', () => {
      const listing = MarketplaceListing.create(makeListingProps({ assets: [] }));
      expect(() => listing.submitForReview()).toThrow(/asset/);
    });

    it('submitForReview transitions draft → under_review', () => {
      const listing = MarketplaceListing.create(makeListingProps({
        assets: [{
          type: 'json_content' as const,
          filename: 'campaign.json',
          sizeBytes: 1024,
          url: 'https://cdn.vtt.com/campaign.json',
          checksum: 'abc123',
        }],
      }));
      listing.submitForReview();
      expect(listing.status).toBe('under_review');
    });

    it('approve transitions to approved', () => {
      const listing = MarketplaceListing.create(makeListingProps({
        assets: [{ type: 'json_content', filename: 'f.json', sizeBytes: 100, url: 'u', checksum: 'c' }],
      }));
      listing.submitForReview();
      listing.approve('Excelente conteúdo!');
      expect(listing.status).toBe('approved');
      expect(listing.reviewNote).toBe('Excelente conteúdo!');
      expect(listing.publishedAt).toBeInstanceOf(Date);
    });

    it('reject transitions to rejected with required note', () => {
      const listing = MarketplaceListing.create(makeListingProps({
        assets: [{ type: 'json_content', filename: 'f.json', sizeBytes: 100, url: 'u', checksum: 'c' }],
      }));
      listing.submitForReview();
      listing.reject('Conteúdo inadequado: falta descrição detalhada');
      expect(listing.status).toBe('rejected');
      expect(listing.reviewNote).toContain('Conteúdo inadequado');
    });

    it('reject requires non-empty reason', () => {
      const listing = MarketplaceListing.create(makeListingProps({
        assets: [{ type: 'json_content', filename: 'f.json', sizeBytes: 100, url: 'u', checksum: 'c' }],
      }));
      listing.submitForReview();
      expect(() => listing.reject('')).toThrow(/reason/i);
    });

    it('suspend transitions to suspended', () => {
      const listing = MarketplaceListing.create(makeListingProps({
        assets: [{ type: 'json_content', filename: 'f.json', sizeBytes: 100, url: 'u', checksum: 'c' }],
      }));
      listing.submitForReview();
      listing.approve();
      listing.suspend('Conteúdo reportado por direitos autorais');
      expect(listing.status).toBe('suspended');
    });

    it('submitForReview fails if not in draft status', () => {
      const listing = MarketplaceListing.create(makeListingProps({
        assets: [{ type: 'json_content', filename: 'f.json', sizeBytes: 100, url: 'u', checksum: 'c' }],
      }));
      listing.submitForReview();
      expect(() => listing.submitForReview()).toThrow(/draft/);
    });
  });

  // ─── Metrics ───────────────────────────────────────────────────────────

  describe('metrics tracking', () => {
    it('recordDownload increments downloadCount', () => {
      const listing = MarketplaceListing.create(makeListingProps());
      listing.recordDownload();
      listing.recordDownload();
      expect(listing.downloadCount).toBe(2);
    });

    it('recordPurchase increments purchaseCount and revenue', () => {
      const listing = MarketplaceListing.create(makeListingProps({ pricingModel: 'paid', priceInCentavos: 2990 }));
      listing.recordPurchase(2990);
      listing.recordPurchase(2990);
      expect(listing.purchaseCount).toBe(2);
      expect(listing.totalRevenueCentavos).toBe(5980);
    });
  });

  // ─── Reviews ───────────────────────────────────────────────────────────

  describe('reviews', () => {
    it('addReview adds a review with generated ID', () => {
      const listing = MarketplaceListing.create(makeListingProps());
      const review = listing.addReview({ reviewerId: 'user-1', rating: 5, title: 'Incrível!', body: 'Muito bem feito.' });
      expect(review.id).toBeDefined();
      expect(listing.reviews).toHaveLength(1);
    });

    it('averageRating is calculated correctly', () => {
      const listing = MarketplaceListing.create(makeListingProps());
      listing.addReview({ reviewerId: 'u1', rating: 4 });
      listing.addReview({ reviewerId: 'u2', rating: 2 });
      expect(listing.averageRating).toBe(3); // (4+2)/2 = 3
    });

    it('does not allow duplicate review from same user', () => {
      const listing = MarketplaceListing.create(makeListingProps());
      listing.addReview({ reviewerId: 'user-1', rating: 5 });
      expect(() => listing.addReview({ reviewerId: 'user-1', rating: 3 })).toThrow(/already reviewed/);
    });
  });

  // ─── Price display ─────────────────────────────────────────────────────

  describe('priceForDisplay', () => {
    it.each([
      ['free', 0, undefined, 'Grátis'],
      ['paid', 2990, undefined, 'R$29.90'],
      ['pwyw', 0, 0, 'Pague o quanto quiser'],
      ['pwyw', 0, 500, 'Pague o quanto quiser (mín. R$5.00)'],
    ] as const)('%s plan with %d centavos shows "%s"', (pricingModel, price, minPwyw, expected) => {
      const overrides: Partial<CreateListingProps> = {
        pricingModel: pricingModel as any,
        priceInCentavos: price,
      };
      if (minPwyw !== undefined) {
        overrides.minPwyw = minPwyw;
      }
      const listing = MarketplaceListing.create(makeListingProps(overrides));
      expect(listing.priceForDisplay).toBe(expected);
    });
  });

  // ─── Permissions ───────────────────────────────────────────────────────

  describe('canBeEditedBy()', () => {
    it('allows creator to edit', () => {
      const listing = MarketplaceListing.create(makeListingProps({ creatorId: 'creator-1' }));
      expect(listing.canBeEditedBy('creator-1', false)).toBe(true);
    });

    it('denies non-creator non-admin', () => {
      const listing = MarketplaceListing.create(makeListingProps({ creatorId: 'creator-1' }));
      expect(listing.canBeEditedBy('other-user', false)).toBe(false);
    });

    it('allows admin to edit any listing', () => {
      const listing = MarketplaceListing.create(makeListingProps({ creatorId: 'creator-1' }));
      expect(listing.canBeEditedBy('admin-user', true)).toBe(true);
    });
  });

  // ─── Content update resets status ─────────────────────────────────────

  describe('updateContent()', () => {
    it('resets approved listing to draft on content update', () => {
      const listing = MarketplaceListing.create(makeListingProps({
        assets: [{ type: 'json_content', filename: 'f.json', sizeBytes: 100, url: 'u', checksum: 'c' }],
      }));
      listing.submitForReview();
      listing.approve();
      expect(listing.status).toBe('approved');

      listing.updateContent({ title: 'Novo Título', version: '1.1.0' });
      expect(listing.status).toBe('draft');
      expect(listing.title).toBe('Novo Título');
      expect(listing.version).toBe('1.1.0');
    });
  });
});
