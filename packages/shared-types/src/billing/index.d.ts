export declare enum SubscriptionPlan {
    FREE = "FREE",
    ADVENTURER = "ADVENTURER",
    HERO = "HERO",
    LEGEND = "LEGEND"
}
export declare enum SubscriptionStatus {
    ACTIVE = "ACTIVE",
    PAST_DUE = "PAST_DUE",
    CANCELED = "CANCELED",
    EXPIRED = "EXPIRED"
}
export interface Subscription {
    id: string;
    userId: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    paymentProvider: 'pagarme' | 'stripe';
    externalSubscriptionId: string;
}
export interface Plan {
    id: SubscriptionPlan;
    name: string;
    priceMonthlyBrl: number;
    priceYearlyBrl: number;
    features: PlanFeature[];
}
export interface PlanFeature {
    key: string;
    label: string;
    value: string | number | boolean;
}
//# sourceMappingURL=index.d.ts.map