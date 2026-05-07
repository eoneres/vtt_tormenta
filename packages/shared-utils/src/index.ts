import { createHash, randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import type { PaginatedResult, PaginationQuery } from '@vtt/shared-types';

// ─── ID Generation ────────────────────────────────────────────────────────────

export function generateId(): string {
  return uuidv4();
}

export function generateTraceId(): string {
  return randomBytes(16).toString('hex');
}

export function generateRequestId(): string {
  return `req_${randomBytes(8).toString('hex')}`;
}

// ─── Hashing ─────────────────────────────────────────────────────────────────

export function hashIp(ip: string): string {
  return createHash('sha256').update(ip + (process.env['IP_HASH_SALT'] ?? '')).digest('hex').slice(0, 16);
}

export function hashEmail(email: string): string {
  return createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
}

// ─── LGPD — PII Anonymization ─────────────────────────────────────────────────

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***@***.***';
  const masked = local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : '***';
  return `${masked}@${domain}`;
}

export function anonymizeUser(userId: string): string {
  return `anon_${createHash('sha256').update(userId).digest('hex').slice(0, 12)}`;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  query: PaginationQuery,
): PaginatedResult<T> {
  const page = query.page ?? 1;
  const pageSize = Math.min(query.pageSize ?? 20, 100);
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export function getPaginationOffset(query: PaginationQuery): { skip: number; take: number } {
  const page = Math.max(query.page ?? 1, 1);
  const take = Math.min(query.pageSize ?? 20, 100);
  return { skip: (page - 1) * take, take };
}

// ─── Slug ─────────────────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ─── Date ─────────────────────────────────────────────────────────────────────

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isExpired(date: Date): boolean {
  return date < new Date();
}

// ─── Retry ───────────────────────────────────────────────────────────────────

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 100,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, baseDelayMs * Math.pow(2, attempt - 1)));
      }
    }
  }

  throw lastError;
}
