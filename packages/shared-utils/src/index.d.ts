import type { PaginatedResult, PaginationQuery } from '@vtt/shared-types';
export declare function generateId(): string;
export declare function generateTraceId(): string;
export declare function generateRequestId(): string;
export declare function hashIp(ip: string): string;
export declare function hashEmail(email: string): string;
export declare function maskEmail(email: string): string;
export declare function anonymizeUser(userId: string): string;
export declare function buildPaginatedResult<T>(data: T[], total: number, query: PaginationQuery): PaginatedResult<T>;
export declare function getPaginationOffset(query: PaginationQuery): {
    skip: number;
    take: number;
};
export declare function slugify(text: string): string;
export declare function addDays(date: Date, days: number): Date;
export declare function isExpired(date: Date): boolean;
export declare function withRetry<T>(fn: () => Promise<T>, maxAttempts?: number, baseDelayMs?: number): Promise<T>;
//# sourceMappingURL=index.d.ts.map