export interface AuditLogEntry {
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  ipHash: string;
  metadata: Record<string, unknown>;
}

export interface IAuditLogger {
  log(entry: AuditLogEntry): Promise<void>;
}

export const AUDIT_LOGGER = Symbol('IAuditLogger');
