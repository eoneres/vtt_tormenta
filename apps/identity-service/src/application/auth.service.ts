import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { generateId, generateTraceId, addDays } from '@vtt/shared-utils';
import type { AuthTokens, JwtPayload } from '@vtt/shared-types';
import { UserEntity } from '../../domain/user/entities/user.entity';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/user/repositories/user.repository.interface';
import type { RegisterDto, LoginDto } from '../http/dtos/auth.dto';
import type { ISessionStore } from '../persistence/redis/session-store.interface';
import { SESSION_STORE } from '../persistence/redis/session-store.interface';
import type { IAuditLogger } from '../persistence/postgres/audit-logger.interface';
import { AUDIT_LOGGER } from '../persistence/postgres/audit-logger.interface';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 30;
const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536, // 64MB
  timeCost: 3,
  parallelism: 1,
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(SESSION_STORE) private readonly sessionStore: ISessionStore,
    @Inject(AUDIT_LOGGER) private readonly auditLogger: IAuditLogger,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto, ipHash: string): Promise<AuthTokens> {
    const exists = await this.userRepository.existsByEmail(dto.email);
    if (exists) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await argon2.hash(dto.password, ARGON2_OPTIONS);
    const user = UserEntity.create({
      email: dto.email,
      displayName: dto.displayName,
      passwordHash,
    });

    await this.userRepository.save(user);
    await this.auditLogger.log({
      userId: user.id,
      action: 'user.registered',
      resource: 'user',
      resourceId: user.id,
      ipHash,
      metadata: { email: dto.email },
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto, ipHash: string): Promise<AuthTokens> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      // Constant-time response to prevent user enumeration
      await argon2.hash('dummy_password_to_prevent_timing_attack', ARGON2_OPTIONS);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isDeleted()) {
      throw new UnauthorizedException('Account not found');
    }

    if (user.isLocked()) {
      await this.auditLogger.log({
        userId: user.id,
        action: 'user.login_blocked_locked',
        resource: 'user',
        resourceId: user.id,
        ipHash,
        metadata: { lockedUntil: user.lockedUntil?.toISOString() },
      });
      throw new ForbiddenException('Account temporarily locked. Try again later.');
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);

    if (!passwordValid) {
      user.recordFailedLogin(MAX_FAILED_ATTEMPTS, LOCK_DURATION_MINUTES);
      await this.userRepository.update(user);
      await this.auditLogger.log({
        userId: user.id,
        action: 'user.login_failed',
        resource: 'user',
        resourceId: user.id,
        ipHash,
        metadata: { attempts: user.failedLoginAttempts },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.mfaEnabled) {
      if (!dto.mfaCode) {
        throw new UnauthorizedException('MFA code required');
      }
      const mfaValid = authenticator.verify({
        token: dto.mfaCode,
        secret: user.mfaSecret!,
      });
      if (!mfaValid) {
        throw new UnauthorizedException('Invalid MFA code');
      }
    }

    user.resetFailedLogins();
    await this.userRepository.update(user);
    await this.auditLogger.log({
      userId: user.id,
      action: 'user.login_success',
      resource: 'user',
      resourceId: user.id,
      ipHash,
      metadata: {},
    });

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string, ipHash: string): Promise<AuthTokens> {
    const session = await this.sessionStore.findByRefreshToken(refreshToken);

    if (!session) {
      // Possible token theft — invalidate entire family
      const stolenFamily = await this.sessionStore.findFamilyByToken(refreshToken);
      if (stolenFamily) {
        await this.sessionStore.invalidateFamily(stolenFamily);
      }
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findById(session.userId);
    if (!user || user.isDeleted()) {
      await this.sessionStore.invalidate(session.sessionId);
      throw new UnauthorizedException('User not found');
    }

    // Rotate: invalidate old, issue new
    await this.sessionStore.invalidate(session.sessionId);
    await this.auditLogger.log({
      userId: user.id,
      action: 'user.token_refreshed',
      resource: 'session',
      resourceId: session.sessionId,
      ipHash,
      metadata: {},
    });

    return this.issueTokens(user, session.familyId);
  }

  async setupMfa(userId: string): Promise<{ qrCodeUrl: string; secret: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(user.email, 'VTT Platform', secret);
    const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl);

    // Store secret temporarily until confirmed
    await this.sessionStore.storePendingMfaSecret(userId, secret);

    return { qrCodeUrl, secret };
  }

  async confirmMfa(userId: string, code: string): Promise<void> {
    const secret = await this.sessionStore.getPendingMfaSecret(userId);
    if (!secret) throw new UnauthorizedException('MFA setup not initiated');

    const valid = authenticator.verify({ token: code, secret });
    if (!valid) throw new UnauthorizedException('Invalid MFA code');

    const user = await this.userRepository.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    user.enableMfa(secret);
    await this.userRepository.update(user);
    await this.sessionStore.deletePendingMfaSecret(userId);
  }

  async revokeSession(sessionId: string, userId: string): Promise<void> {
    await this.sessionStore.invalidate(sessionId);
    await this.auditLogger.log({
      userId,
      action: 'user.session_revoked',
      resource: 'session',
      resourceId: sessionId,
      ipHash: '',
      metadata: {},
    });
  }

  private async issueTokens(user: UserEntity, familyId?: string): Promise<AuthTokens> {
    const sessionId = generateId();
    const newFamilyId = familyId ?? generateId();
    const refreshToken = generateTraceId();
    const expiresAt = addDays(new Date(), 30);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      sessionId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 900, // 15min
    };

    const accessToken = this.jwtService.sign(payload);

    await this.sessionStore.save({
      sessionId,
      userId: user.id,
      refreshToken,
      familyId: newFamilyId,
      expiresAt,
    });

    return { accessToken, refreshToken, expiresIn: 900 };
  }
}
