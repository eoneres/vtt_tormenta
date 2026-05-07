export interface SessionData {
  sessionId: string;
  userId: string;
  refreshToken: string;
  familyId: string;
  expiresAt: Date;
}

export interface ISessionStore {
  save(session: SessionData): Promise<void>;
  findByRefreshToken(refreshToken: string): Promise<SessionData | null>;
  findFamilyByToken(refreshToken: string): Promise<string | null>;
  invalidate(sessionId: string): Promise<void>;
  invalidateFamily(familyId: string): Promise<void>;
  invalidateAllForUser(userId: string): Promise<void>;
  storePendingMfaSecret(userId: string, secret: string): Promise<void>;
  getPendingMfaSecret(userId: string): Promise<string | null>;
  deletePendingMfaSecret(userId: string): Promise<void>;
}

export const SESSION_STORE = Symbol('ISessionStore');
