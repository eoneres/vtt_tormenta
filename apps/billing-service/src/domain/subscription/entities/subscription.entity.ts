import { generateId } from '@vtt/shared-utils';

// ─── Plans ────────────────────────────────────────────────────────────────────

export type PlanId = 'free' | 'mestre' | 'guild' | 'enterprise';
export type BillingCycle = 'monthly' | 'annual';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'paused' | 'trialing';

export interface PlanFeatures {
  maxCampaigns: number;
  maxPlayersPerTable: number;
  maxMapsPerCampaign: number;
  maxStorageMB: number;
  customSystems: boolean;
  marketplaceAccess: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
  advancedAutomations: boolean;
  revenueShare: number;           // % of marketplace revenue kept by creator
}

export const PLANS: Record<PlanId, { name: string; priceBRL: Record<BillingCycle, number>; features: PlanFeatures }> = {
  free: {
    name: 'Aventureiro (Grátis)',
    priceBRL: { monthly: 0, annual: 0 },
    features: {
      maxCampaigns: 1,
      maxPlayersPerTable: 4,
      maxMapsPerCampaign: 3,
      maxStorageMB: 100,
      customSystems: false,
      marketplaceAccess: false,
      prioritySupport: false,
      apiAccess: false,
      advancedAutomations: false,
      revenueShare: 0,
    },
  },
  mestre: {
    name: 'Mestre',
    priceBRL: { monthly: 2990, annual: 28700 }, // centavos
    features: {
      maxCampaigns: 5,
      maxPlayersPerTable: 8,
      maxMapsPerCampaign: 20,
      maxStorageMB: 2048,
      customSystems: true,
      marketplaceAccess: true,
      prioritySupport: false,
      apiAccess: false,
      advancedAutomations: true,
      revenueShare: 70,
    },
  },
  guild: {
    name: 'Guilda',
    priceBRL: { monthly: 6990, annual: 67100 },
    features: {
      maxCampaigns: 20,
      maxPlayersPerTable: 12,
      maxMapsPerCampaign: 100,
      maxStorageMB: 10240,
      customSystems: true,
      marketplaceAccess: true,
      prioritySupport: true,
      apiAccess: true,
      advancedAutomations: true,
      revenueShare: 80,
    },
  },
  enterprise: {
    name: 'Enterprise',
    priceBRL: { monthly: 0, annual: 0 }, // custom pricing
    features: {
      maxCampaigns: -1,             // unlimited
      maxPlayersPerTable: -1,
      maxMapsPerCampaign: -1,
      maxStorageMB: -1,
      customSystems: true,
      marketplaceAccess: true,
      prioritySupport: true,
      apiAccess: true,
      advancedAutomations: true,
      revenueShare: 85,
    },
  },
};

// ─── Subscription Aggregate ───────────────────────────────────────────────────

export interface SubscriptionProps {
  id: string;
  userId: string;
  planId: PlanId;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: Date;
  paymentMethodId?: string;
  externalSubscriptionId?: string;  // Stripe/Pagar.me ID
  priceAtPurchaseCentavos: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Subscription {
  readonly id: string;
  readonly userId: string;
  readonly createdAt: Date;

  planId: PlanId;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: Date;
  paymentMethodId?: string;
  externalSubscriptionId?: string;
  priceAtPurchaseCentavos: number;
  updatedAt: Date;

  private constructor(props: SubscriptionProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.planId = props.planId;
    this.billingCycle = props.billingCycle;
    this.status = props.status;
    this.currentPeriodStart = props.currentPeriodStart;
    this.currentPeriodEnd = props.currentPeriodEnd;
    this.cancelAtPeriodEnd = props.cancelAtPeriodEnd;
    this.trialEndsAt = props.trialEndsAt;
    this.paymentMethodId = props.paymentMethodId;
    this.externalSubscriptionId = props.externalSubscriptionId;
    this.priceAtPurchaseCentavos = props.priceAtPurchaseCentavos;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static createTrial(userId: string, planId: PlanId, trialDays = 14): Subscription {
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + trialDays);
    const periodEnd = new Date(trialEnd);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    return new Subscription({
      id: generateId(),
      userId,
      planId,
      billingCycle: 'monthly',
      status: 'trialing',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      trialEndsAt: trialEnd,
      priceAtPurchaseCentavos: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  static createFree(userId: string): Subscription {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setFullYear(periodEnd.getFullYear() + 10); // effectively permanent
    return new Subscription({
      id: generateId(),
      userId,
      planId: 'free',
      billingCycle: 'monthly',
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      priceAtPurchaseCentavos: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: SubscriptionProps): Subscription {
    return new Subscription(props);
  }

  // ─── Commands ──────────────────────────────────────────────────────────

  upgrade(planId: PlanId, billingCycle: BillingCycle, priceAtPurchase: number, externalId?: string): void {
    if (this.planId === planId && this.billingCycle === billingCycle) {
      throw new Error('Already subscribed to this plan');
    }
    this.planId = planId;
    this.billingCycle = billingCycle;
    this.status = 'active';
    this.cancelAtPeriodEnd = false;
    this.priceAtPurchaseCentavos = priceAtPurchase;
    this.externalSubscriptionId = externalId ?? this.externalSubscriptionId;
    this.renewPeriod();
    this.touch();
  }

  cancelAtEnd(): void {
    if (this.status === 'cancelled') throw new Error('Already cancelled');
    this.cancelAtPeriodEnd = true;
    this.touch();
  }

  reactivate(): void {
    if (!this.cancelAtPeriodEnd) throw new Error('Not scheduled for cancellation');
    this.cancelAtPeriodEnd = false;
    this.touch();
  }

  markPastDue(): void {
    this.status = 'past_due';
    this.touch();
  }

  renew(priceAtPurchase: number): void {
    this.status = 'active';
    this.priceAtPurchaseCentavos = priceAtPurchase;
    this.renewPeriod();
    this.touch();
  }

  cancel(): void {
    this.status = 'cancelled';
    this.touch();
  }

  // ─── Queries ───────────────────────────────────────────────────────────

  get plan() { return PLANS[this.planId]; }
  get features(): PlanFeatures { return this.plan.features; }
  get isActive(): boolean { return this.status === 'active' || this.status === 'trialing'; }
  get isExpired(): boolean { return this.currentPeriodEnd < new Date(); }

  get priceDisplay(): string {
    if (this.priceAtPurchaseCentavos === 0) return 'Grátis';
    return `R$${(this.priceAtPurchaseCentavos / 100).toFixed(2)}/${this.billingCycle === 'monthly' ? 'mês' : 'ano'}`;
  }

  toPlainObject(): SubscriptionProps {
    return {
      id: this.id, userId: this.userId, planId: this.planId, billingCycle: this.billingCycle,
      status: this.status, currentPeriodStart: this.currentPeriodStart, currentPeriodEnd: this.currentPeriodEnd,
      cancelAtPeriodEnd: this.cancelAtPeriodEnd, trialEndsAt: this.trialEndsAt,
      paymentMethodId: this.paymentMethodId, externalSubscriptionId: this.externalSubscriptionId,
      priceAtPurchaseCentavos: this.priceAtPurchaseCentavos, createdAt: this.createdAt, updatedAt: this.updatedAt,
    };
  }

  private renewPeriod(): void {
    const now = new Date();
    this.currentPeriodStart = now;
    const end = new Date(now);
    if (this.billingCycle === 'monthly') { end.setMonth(end.getMonth() + 1); }
    else { end.setFullYear(end.getFullYear() + 1); }
    this.currentPeriodEnd = end;
  }

  private touch(): void { this.updatedAt = new Date(); }
}
