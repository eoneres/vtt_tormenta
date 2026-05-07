export declare enum UserRole {
    ADMIN = "ADMIN",
    GM = "GM",
    PLAYER = "PLAYER",
    SPECTATOR = "SPECTATOR",
    CREATOR = "CREATOR"
}
export interface User {
    id: string;
    email: string;
    displayName: string;
    roles: UserRole[];
    mfaEnabled: boolean;
    createdAt: Date;
    deletedAt: Date | null;
}
export interface UserSession {
    sessionId: string;
    userId: string;
    deviceInfo: string;
    ipHash: string;
    createdAt: Date;
    lastSeenAt: Date;
    expiresAt: Date;
}
export interface JwtPayload {
    sub: string;
    email: string;
    roles: UserRole[];
    sessionId: string;
    iat: number;
    exp: number;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface OAuthProvider {
    provider: 'google' | 'discord' | 'twitch';
    providerId: string;
    userId: string;
}
export interface MfaSetup {
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
}
//# sourceMappingURL=index.d.ts.map