import { Subscription, PLANS, PlanId } from '../../src/domain/subscription/entities/subscription.entity';

describe('Subscription entity', () => {

  // ─── PLANS catalog ────────────────────────────────────────────────────────

  describe('PLANS catalog', () => {
    it('has all expected plan IDs', () => {
      expect(Object.keys(PLANS)).toEqual(['free', 'mestre', 'guild', 'enterprise']);
    });

    it('free plan has zero price', () => {
      expect(PLANS.free.priceBRL.monthly).toBe(0);
      expect(PLANS.free.priceBRL.annual).toBe(0);
    });

    it('mestre plan has monthly and annual prices', () => {
      expect(PLANS.mestre.priceBRL.monthly).toBeGreaterThan(0);
      expect(PLANS.mestre.priceBRL.annual).toBeGreaterThan(0);
    });

    it('annual price is less than 12x monthly (discount)', () => {
      for (const id of ['mestre', 'guild'] as PlanId[]) {
        const plan = PLANS[id];
        expect(plan.priceBRL.annual).toBeLessThan(plan.priceBRL.monthly * 12);
      }
    });

    it('enterprise has unlimited campaigns (-1)', () => {
      expect(PLANS.enterprise.features.maxCampaigns).toBe(-1);
    });

    it('free plan has no API access', () => {
      expect(PLANS.free.features.apiAccess).toBe(false);
    });

    it('guild plan has API access and priority support', () => {
      expect(PLANS.guild.features.apiAccess).toBe(true);
      expect(PLANS.guild.features.prioritySupport).toBe(true);
    });

    it('revenue share increases with plan tier', () => {
      expect(PLANS.free.features.revenueShare).toBe(0);
      expect(PLANS.mestre.features.revenueShare).toBeGreaterThan(0);
      expect(PLANS.guild.features.revenueShare).toBeGreaterThan(PLANS.mestre.features.revenueShare);
      expect(PLANS.enterprise.features.revenueShare).toBeGreaterThan(PLANS.guild.features.revenueShare);
    });
  });

  // ─── createFree ───────────────────────────────────────────────────────────

  describe('createFree()', () => {
    it('creates active free subscription', () => {
      const sub = Subscription.createFree('user-1');
      expect(sub.planId).toBe('free');
      expect(sub.status).toBe('active');
      expect(sub.isActive).toBe(true);
    });

    it('has far-future period end', () => {
      const sub = Subscription.createFree('user-1');
      const yearsOut = (sub.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365);
      expect(yearsOut).toBeGreaterThan(5);
    });

    it('priceAtPurchase is 0', () => {
      const sub = Subscription.createFree('user-1');
      expect(sub.priceAtPurchaseCentavos).toBe(0);
    });
  });

  // ─── createTrial ─────────────────────────────────────────────────────────

  describe('createTrial()', () => {
    it('creates trialing subscription', () => {
      const sub = Subscription.createTrial('user-2', 'mestre', 14);
      expect(sub.status).toBe('trialing');
      expect(sub.isActive).toBe(true);
      expect(sub.planId).toBe('mestre');
    });

    it('trialEndsAt is set to N days from now', () => {
      const before = Date.now();
      const sub = Subscription.createTrial('user-2', 'mestre', 14);
      const after = Date.now();
      const trialMs = sub.trialEndsAt!.getTime();
      const expectedMs = 14 * 24 * 60 * 60 * 1000;
      expect(trialMs - before).toBeGreaterThanOrEqual(expectedMs - 1000);
      expect(trialMs - after).toBeLessThanOrEqual(expectedMs + 1000);
    });

    it('period end is after trial end', () => {
      const sub = Subscription.createTrial('user-2', 'guild', 7);
      expect(sub.currentPeriodEnd.getTime()).toBeGreaterThan(sub.trialEndsAt!.getTime());
    });
  });

  // ─── upgrade ─────────────────────────────────────────────────────────────

  describe('upgrade()', () => {
    it('upgrades from free to mestre', () => {
      const sub = Subscription.createFree('user-3');
      sub.upgrade('mestre', 'monthly', PLANS.mestre.priceBRL.monthly, 'ext-123');
      expect(sub.planId).toBe('mestre');
      expect(sub.status).toBe('active');
      expect(sub.externalSubscriptionId).toBe('ext-123');
    });

    it('sets new period dates on upgrade', () => {
      const sub = Subscription.createFree('user-3');
      const before = Date.now();
      sub.upgrade('guild', 'annual', PLANS.guild.priceBRL.annual);
      expect(sub.currentPeriodStart.getTime()).toBeGreaterThanOrEqual(before);
      const expectedEnd = new Date();
      expectedEnd.setFullYear(expectedEnd.getFullYear() + 1);
      expect(sub.currentPeriodEnd.getTime()).toBeGreaterThan(Date.now());
    });

    it('throws if upgrading to same plan and cycle', () => {
      const sub = Subscription.createFree('user-3');
      expect(() => sub.upgrade('free', 'monthly', 0)).toThrow(/Already subscribed/);
    });

    it('resets cancelAtPeriodEnd on upgrade', () => {
      const sub = Subscription.createFree('user-3');
      sub.upgrade('mestre', 'monthly', 2990);
      sub.cancelAtEnd();
      expect(sub.cancelAtPeriodEnd).toBe(true);
      sub.upgrade('guild', 'monthly', 6990);
      expect(sub.cancelAtPeriodEnd).toBe(false);
    });
  });

  // ─── cancel / reactivate ─────────────────────────────────────────────────

  describe('cancelAtEnd()', () => {
    it('sets cancelAtPeriodEnd to true', () => {
      const sub = Subscription.createTrial('user-4', 'mestre', 14);
      sub.cancelAtEnd();
      expect(sub.cancelAtPeriodEnd).toBe(true);
    });

    it('does not immediately change status', () => {
      const sub = Subscription.createFree('user-4');
      sub.upgrade('mestre', 'monthly', 2990);
      sub.cancelAtEnd();
      expect(sub.status).toBe('active');
    });

    it('throws if already cancelled', () => {
      const sub = Subscription.createFree('user-4');
      sub.upgrade('mestre', 'monthly', 2990);
      sub.cancel();
      expect(() => sub.cancelAtEnd()).toThrow(/Already cancelled/);
    });
  });

  describe('reactivate()', () => {
    it('clears cancelAtPeriodEnd', () => {
      const sub = Subscription.createFree('user-5');
      sub.upgrade('mestre', 'monthly', 2990);
      sub.cancelAtEnd();
      sub.reactivate();
      expect(sub.cancelAtPeriodEnd).toBe(false);
    });

    it('throws if not scheduled for cancellation', () => {
      const sub = Subscription.createFree('user-5');
      sub.upgrade('mestre', 'monthly', 2990);
      expect(() => sub.reactivate()).toThrow(/Not scheduled/);
    });
  });

  // ─── payment events ───────────────────────────────────────────────────────

  describe('payment lifecycle', () => {
    it('markPastDue changes status to past_due', () => {
      const sub = Subscription.createFree('user-6');
      sub.upgrade('mestre', 'monthly', 2990);
      sub.markPastDue();
      expect(sub.status).toBe('past_due');
      expect(sub.isActive).toBe(false);
    });

    it('renew restores active status and renews period', () => {
      const sub = Subscription.createFree('user-6');
      sub.upgrade('mestre', 'monthly', 2990);
      sub.markPastDue();
      const before = Date.now();
      sub.renew(2990);
      expect(sub.status).toBe('active');
      expect(sub.currentPeriodStart.getTime()).toBeGreaterThanOrEqual(before);
    });

    it('cancel sets status to cancelled', () => {
      const sub = Subscription.createFree('user-7');
      sub.upgrade('mestre', 'monthly', 2990);
      sub.cancel();
      expect(sub.status).toBe('cancelled');
      expect(sub.isActive).toBe(false);
    });
  });

  // ─── features proxy ───────────────────────────────────────────────────────

  describe('features proxy', () => {
    it('returns correct features for active plan', () => {
      const sub = Subscription.createFree('user-8');
      expect(sub.features.maxCampaigns).toBe(1);
      expect(sub.features.apiAccess).toBe(false);
    });

    it('features change after upgrade', () => {
      const sub = Subscription.createFree('user-8');
      sub.upgrade('guild', 'monthly', 6990);
      expect(sub.features.apiAccess).toBe(true);
      expect(sub.features.maxCampaigns).toBeGreaterThan(1);
    });
  });

  // ─── price display ────────────────────────────────────────────────────────

  describe('priceDisplay', () => {
    it('shows Grátis for free', () => {
      const sub = Subscription.createFree('user-9');
      expect(sub.priceDisplay).toBe('Grátis');
    });

    it('shows formatted BRL for paid plan', () => {
      const sub = Subscription.createFree('user-9');
      sub.upgrade('mestre', 'monthly', 2990);
      expect(sub.priceDisplay).toBe('R$29.90/mês');
    });

    it('shows ano for annual cycle', () => {
      const sub = Subscription.createFree('user-9');
      sub.upgrade('guild', 'annual', 67100);
      expect(sub.priceDisplay).toBe('R$671.00/ano');
    });
  });

  // ─── serialization ────────────────────────────────────────────────────────

  describe('serialization', () => {
    it('toPlainObject includes all fields', () => {
      const sub = Subscription.createFree('user-10');
      const plain = sub.toPlainObject();
      expect(plain).toHaveProperty('id');
      expect(plain).toHaveProperty('userId', 'user-10');
      expect(plain).toHaveProperty('planId', 'free');
      expect(plain).toHaveProperty('status', 'active');
      expect(plain).toHaveProperty('createdAt');
      expect(plain).toHaveProperty('updatedAt');
    });

    it('reconstitute preserves all state', () => {
      const sub = Subscription.createTrial('user-10', 'mestre', 14);
      sub.upgrade('guild', 'annual', 67100);
      const plain = sub.toPlainObject();
      const restored = Subscription.reconstitute(plain);
      expect(restored.id).toBe(sub.id);
      expect(restored.planId).toBe('guild');
      expect(restored.billingCycle).toBe('annual');
    });
  });
});
