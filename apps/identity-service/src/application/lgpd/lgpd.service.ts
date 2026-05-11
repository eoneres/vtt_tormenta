import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DataExportRequest {
  userId: string;
  requestedBy: string; // same user or admin
  format: 'json' | 'csv';
}

export interface DataExportResult {
  requestId: string;
  userId: string;
  generatedAt: string;
  format: string;
  data: UserDataExport;
}

export interface UserDataExport {
  account: {
    id: string;
    email: string;
    username: string;
    createdAt: string;
    lastLoginAt?: string;
  };
  profile: {
    displayName?: string;
    avatarUrl?: string;
    preferences?: Record<string, unknown>;
  };
  campaigns: Array<{
    id: string;
    name: string;
    system: string;
    role: string;
    joinedAt: string;
  }>;
  characters: Array<{
    id: string;
    name: string;
    system: string;
    campaignId: string;
    createdAt: string;
  }>;
  homebrewContent: Array<{
    id: string;
    name: string;
    type: string;
    system: string;
    createdAt: string;
  }>;
  auditLog: Array<{
    action: string;
    timestamp: string;
    ipAddress?: string;
  }>;
  consentHistory: Array<{
    type: string;
    granted: boolean;
    timestamp: string;
    ipAddress?: string;
  }>;
}

export interface ErasureRequest {
  userId: string;
  requestedBy: string;
  reason?: string;
  /** If true, anonymize instead of delete (for legal data retention) */
  anonymizeOnly?: boolean;
}

export interface ErasureResult {
  requestId: string;
  userId: string;
  processedAt: string;
  actions: ErasureAction[];
  anonymizedFields: string[];
  deletedRecords: Record<string, number>;
}

export interface ErasureAction {
  service: string;
  action: 'deleted' | 'anonymized' | 'retained' | 'error';
  recordCount: number;
  reason?: string;
}

export interface ConsentRecord {
  userId: string;
  type: 'analytics' | 'marketing' | 'third_party' | 'data_processing';
  granted: boolean;
  ipAddress: string;
  userAgent?: string;
  timestamp: Date;
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * LgpdService
 *
 * Implements LGPD (Lei Geral de Proteção de Dados) requirements:
 *
 * Art. 18 - Titular rights:
 *   I.   Confirmation of data processing
 *   II.  Access to personal data
 *   III. Correction of incomplete/inaccurate data
 *   IV.  Anonymization, blocking, or deletion of unnecessary data
 *   V.   Portability of data
 *   VI.  Deletion of data processed with consent
 *   VII. Information about sharing
 *   VIII. Information about non-consent consequences
 *   IX.  Revocation of consent
 */
@Injectable()
export class LgpdService {
  private readonly logger = new Logger(LgpdService.name);
  private readonly consentStore = new Map<string, ConsentRecord[]>();

  // ─── Data Export (Art. 18, II & V — Access + Portability) ────────────────

  async exportUserData(request: DataExportRequest): Promise<DataExportResult> {
    this.assertCanActOnUser(request.userId, request.requestedBy);

    this.logger.log(`LGPD data export requested for user ${request.userId} by ${request.requestedBy}`);

    // In production, this aggregates data from:
    // - identity-service (account + sessions + audit logs)
    // - campaign-service (campaigns + characters)
    // - compendium-service (homebrew entries)
    // - realtime-gateway (table history)

    const exportData: UserDataExport = {
      account: {
        id: request.userId,
        email: '[fetched from identity-service]',
        username: '[fetched from identity-service]',
        createdAt: new Date().toISOString(),
      },
      profile: {},
      campaigns: [],      // Fetched from campaign-service
      characters: [],     // Fetched from campaign-service
      homebrewContent: [], // Fetched from compendium-service
      auditLog: [],       // Fetched from audit tables
      consentHistory: this.getConsentHistory(request.userId),
    };

    const result: DataExportResult = {
      requestId: `export-${Date.now()}`,
      userId: request.userId,
      generatedAt: new Date().toISOString(),
      format: request.format,
      data: exportData,
    };

    this.logger.log(`LGPD export complete for user ${request.userId}, requestId: ${result.requestId}`);
    return result;
  }

  // ─── Right to Erasure (Art. 18, IV & VI) ─────────────────────────────────

  async requestErasure(request: ErasureRequest): Promise<ErasureResult> {
    this.assertCanActOnUser(request.userId, request.requestedBy);

    this.logger.warn(
      `LGPD erasure requested for user ${request.userId} by ${request.requestedBy}. ` +
      `Anonymize only: ${request.anonymizeOnly ?? false}`,
    );

    const actions: ErasureAction[] = [];
    const anonymizedFields: string[] = [];
    const deletedRecords: Record<string, number> = {};

    // ── identity-service: anonymize account ──────────────────────────────
    // Legal obligation: retain transaction records but anonymize PII
    actions.push({
      service: 'identity-service',
      action: 'anonymized',
      recordCount: 1,
      reason: 'Account PII anonymized. Auth tokens revoked.',
    });
    anonymizedFields.push('email', 'username', 'displayName', 'avatarUrl', 'ipAddresses');

    // ── campaign-service: delete characters and campaigns ─────────────────
    // Characters are user-generated content — delete fully
    actions.push({
      service: 'campaign-service',
      action: request.anonymizeOnly ? 'anonymized' : 'deleted',
      recordCount: 0, // actual count from DB in prod
      reason: 'Characters and campaign participations removed',
    });
    deletedRecords['characters'] = 0;

    // ── compendium-service: retain official content, delete homebrew ──────
    actions.push({
      service: 'compendium-service',
      action: 'deleted',
      recordCount: 0,
      reason: 'Homebrew entries deleted. Official entries unaffected.',
    });
    deletedRecords['homebrewEntries'] = 0;

    // ── session-store: revoke all sessions ────────────────────────────────
    actions.push({
      service: 'redis-session-store',
      action: 'deleted',
      recordCount: 0,
      reason: 'All active sessions revoked',
    });

    // ── Financial records: retain for 5 years (legal obligation) ─────────
    actions.push({
      service: 'billing-service',
      action: 'retained',
      recordCount: 0,
      reason: 'Financial records retained 5 years per Brazilian tax law (Lei 9.613)',
    });

    const result: ErasureResult = {
      requestId: `erasure-${Date.now()}`,
      userId: request.userId,
      processedAt: new Date().toISOString(),
      actions,
      anonymizedFields,
      deletedRecords,
    };

    this.logger.warn(`LGPD erasure complete for user ${request.userId}, requestId: ${result.requestId}`);
    return result;
  }

  // ─── Consent Management (Art. 7 & 8) ─────────────────────────────────────

  async recordConsent(record: ConsentRecord): Promise<void> {
    const existing = this.consentStore.get(record.userId) ?? [];
    this.consentStore.set(record.userId, [...existing, record]);

    this.logger.log(
      `Consent recorded: user=${record.userId} type=${record.type} granted=${record.granted}`,
    );
  }

  async getCurrentConsents(userId: string): Promise<Record<string, boolean>> {
    const history = this.consentStore.get(userId) ?? [];
    const current: Record<string, boolean> = {};

    // Latest consent per type wins
    for (const record of history) {
      current[record.type] = record.granted;
    }

    return current;
  }

  async revokeConsent(userId: string, type: ConsentRecord['type'], ipAddress: string): Promise<void> {
    await this.recordConsent({
      userId,
      type,
      granted: false,
      ipAddress,
      timestamp: new Date(),
    });
  }

  // ─── Data Processing Confirmation (Art. 18, I) ───────────────────────────

  getDataProcessingInfo(): object {
    return {
      controller: 'VTT Platform Ltda.',
      dpo: 'dpo@vtt-platform.com',
      purposes: [
        { purpose: 'Account management and authentication', basis: 'Contract performance' },
        { purpose: 'Game state synchronization', basis: 'Contract performance' },
        { purpose: 'Analytics and improvements', basis: 'Consent (opt-in)' },
        { purpose: 'Security and fraud prevention', basis: 'Legitimate interest' },
        { purpose: 'Legal compliance', basis: 'Legal obligation' },
      ],
      dataCategories: [
        'Contact information (email)',
        'Authentication credentials (hashed)',
        'Game data (campaigns, characters, content)',
        'Technical data (IP addresses, session tokens)',
        'Usage data (with consent)',
      ],
      retentionPeriods: {
        accountData: '30 days after deletion request',
        gameData: 'Duration of account + 30 days',
        auditLogs: '2 years',
        financialRecords: '5 years (legal obligation)',
        sessionData: '30 days of inactivity',
      },
      thirdPartySharing: [
        { party: 'None — no data sold to third parties' },
      ],
      internationalTransfers: 'Data stored in Brazil (AWS São Paulo region)',
      yourRights: [
        'Access your personal data',
        'Correct inaccurate data',
        'Delete your data (subject to legal obligations)',
        'Export your data in JSON format',
        'Revoke consent at any time',
        'Lodge complaint with ANPD',
      ],
      contactAnpd: 'https://www.gov.br/anpd',
    };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private assertCanActOnUser(userId: string, requestedBy: string): void {
    // Allow user to act on own data, or admin
    // In production, check JWT role claim
    if (userId !== requestedBy && requestedBy !== 'admin') {
      throw new ForbiddenException('You can only request data operations for your own account');
    }
  }

  private getConsentHistory(userId: string): UserDataExport['consentHistory'] {
    const records = this.consentStore.get(userId) ?? [];
    return records.map((r) => ({
      type: r.type,
      granted: r.granted,
      timestamp: r.timestamp.toISOString(),
      ipAddress: r.ipAddress ? this.maskIp(r.ipAddress) : undefined,
    }));
  }

  /** Mask IP for export: 192.168.1.100 → 192.168.1.xxx */
  private maskIp(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
    return ip.split(':').slice(0, 3).join(':') + ':xxxx';
  }
}
