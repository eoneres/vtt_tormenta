import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../../src/application/auth.service';
import { USER_REPOSITORY } from '../../../src/domain/user/repositories/user.repository.interface';
import { SESSION_STORE } from '../../../src/infrastructure/persistence/redis/session-store.interface';
import { AUDIT_LOGGER } from '../../../src/infrastructure/persistence/postgres/audit-logger.interface';
import { UserEntity } from '../../../src/domain/user/entities/user.entity';
import { UserRole } from '@vtt/shared-types';
import * as argon2 from 'argon2';

jest.mock('argon2');

const mockUserRepository = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  existsByEmail: jest.fn(),
};

const mockSessionStore = {
  save: jest.fn(),
  findByRefreshToken: jest.fn(),
  findFamilyByToken: jest.fn(),
  invalidate: jest.fn(),
  invalidateFamily: jest.fn(),
  invalidateAllForUser: jest.fn(),
  storePendingMfaSecret: jest.fn(),
  getPendingMfaSecret: jest.fn(),
  deletePendingMfaSecret: jest.fn(),
};

const mockAuditLogger = { log: jest.fn() };
const mockJwtService = { sign: jest.fn().mockReturnValue('signed.jwt.token') };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
        { provide: SESSION_STORE, useValue: mockSessionStore },
        { provide: AUDIT_LOGGER, useValue: mockAuditLogger },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('creates user and returns tokens', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockResolvedValue(undefined);
      mockSessionStore.save.mockResolvedValue(undefined);
      mockAuditLogger.log.mockResolvedValue(undefined);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed_password');

      const result = await service.register(
        { email: 'test@test.com', displayName: 'Test', password: 'Str0ng!Pass#1' },
        'ip_hash',
      );

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.refreshToken).toBeDefined();
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
      expect(mockAuditLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'user.registered' }),
      );
    });

    it('throws ConflictException if email already exists', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(true);

      await expect(
        service.register(
          { email: 'existing@test.com', displayName: 'Test', password: 'Str0ng!Pass#1' },
          'ip_hash',
        ),
      ).rejects.toThrow(ConflictException);

      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const makeActiveUser = () =>
      UserEntity.reconstitute({
        id: 'user-id-1',
        email: 'test@test.com',
        displayName: 'Test',
        passwordHash: 'hashed_password',
        roles: [UserRole.PLAYER],
        mfaEnabled: false,
        mfaSecret: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

    it('returns tokens on valid credentials', async () => {
      const user = makeActiveUser();
      mockUserRepository.findByEmail.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      mockUserRepository.update.mockResolvedValue(undefined);
      mockSessionStore.save.mockResolvedValue(undefined);
      mockAuditLogger.log.mockResolvedValue(undefined);

      const result = await service.login(
        { email: 'test@test.com', password: 'Str0ng!Pass#1' },
        'ip_hash',
      );

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(mockAuditLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'user.login_success' }),
      );
    });

    it('throws UnauthorizedException on wrong password', async () => {
      const user = makeActiveUser();
      mockUserRepository.findByEmail.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(false);
      mockUserRepository.update.mockResolvedValue(undefined);
      mockAuditLogger.log.mockResolvedValue(undefined);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }, 'ip_hash'),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockAuditLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'user.login_failed' }),
      );
    });

    it('throws UnauthorizedException when user not found (constant-time)', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('dummy');

      await expect(
        service.login({ email: 'ghost@test.com', password: 'any' }, 'ip_hash'),
      ).rejects.toThrow(UnauthorizedException);

      // Must still call argon2.hash to prevent timing attacks
      expect(argon2.hash).toHaveBeenCalled();
    });

    it('throws ForbiddenException when account is locked', async () => {
      const lockedUntil = new Date(Date.now() + 60_000);
      const user = UserEntity.reconstitute({
        id: 'user-id-1',
        email: 'test@test.com',
        displayName: 'Test',
        passwordHash: 'hash',
        roles: [UserRole.PLAYER],
        mfaEnabled: false,
        mfaSecret: null,
        failedLoginAttempts: 5,
        lockedUntil,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockAuditLogger.log.mockResolvedValue(undefined);

      await expect(
        service.login({ email: 'test@test.com', password: 'any' }, 'ip_hash'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws UnauthorizedException when MFA code missing', async () => {
      const user = UserEntity.reconstitute({
        id: 'user-id-1',
        email: 'test@test.com',
        displayName: 'Test',
        passwordHash: 'hash',
        roles: [UserRole.PLAYER],
        mfaEnabled: true,
        mfaSecret: 'SECRET',
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      mockUserRepository.findByEmail.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login({ email: 'test@test.com', password: 'Str0ng!Pass#1' }, 'ip_hash'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('throws UnauthorizedException on invalid refresh token', async () => {
      mockSessionStore.findByRefreshToken.mockResolvedValue(null);
      mockSessionStore.findFamilyByToken.mockResolvedValue(null);

      await expect(service.refresh('invalid_token', 'ip_hash')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('invalidates entire family on reuse of revoked token (token theft)', async () => {
      mockSessionStore.findByRefreshToken.mockResolvedValue(null);
      mockSessionStore.findFamilyByToken.mockResolvedValue('family-id-1');
      mockSessionStore.invalidateFamily.mockResolvedValue(undefined);

      await expect(service.refresh('stolen_token', 'ip_hash')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockSessionStore.invalidateFamily).toHaveBeenCalledWith('family-id-1');
    });
  });
});
