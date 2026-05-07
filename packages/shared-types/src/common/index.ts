export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  traceId: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  ipHash: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface HealthCheck {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  version: string;
  timestamp: string;
  checks: Record<string, 'ok' | 'error'>;
}

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface ServiceContext {
  traceId: string;
  userId?: string;
  sessionId?: string;
  requestId: string;
}
