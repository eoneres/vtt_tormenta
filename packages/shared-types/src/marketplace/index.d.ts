export declare enum MarketplaceItemType {
    ADVENTURE = "ADVENTURE",
    MAP = "MAP",
    TOKEN_SET = "TOKEN_SET",
    SYSTEM = "SYSTEM",
    AUTOMATION_MODULE = "AUTOMATION_MODULE",
    SOUNDTRACK = "SOUNDTRACK"
}
export declare enum MarketplaceItemStatus {
    DRAFT = "DRAFT",
    UNDER_REVIEW = "UNDER_REVIEW",
    PUBLISHED = "PUBLISHED",
    SUSPENDED = "SUSPENDED"
}
export declare enum DrmLevel {
    NONE = "NONE",
    ACCOUNT_BOUND = "ACCOUNT_BOUND",
    PLATFORM_BOUND = "PLATFORM_BOUND"
}
export interface MarketplaceItem {
    id: string;
    creatorId: string;
    type: MarketplaceItemType;
    title: string;
    description: string;
    price: number;
    currency: 'BRL' | 'USD';
    status: MarketplaceItemStatus;
    drmLevel: DrmLevel;
    systemIds: string[];
    tags: string[];
    previewImageUrl: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Purchase {
    id: string;
    userId: string;
    itemId: string;
    amount: number;
    currency: string;
    paymentProvider: 'pagarme' | 'stripe';
    paymentId: string;
    createdAt: Date;
}
//# sourceMappingURL=index.d.ts.map