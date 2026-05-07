import { UserEntity } from '../../../src/domain/user/entities/user.entity';
import { UserRole } from '@vtt/shared-types';

describe('UserEntity', () => {
  const makeUser = () =>
    UserEntity.create({
      email: 'jogador@email.com',
      displayName: 'Aragorn',
      passwordHash: 'hashed_password',
    });

  describe('create', () => {
    it('normalizes email to lowercase', () => {
      const user = UserEntity.create({
        email: 'JOGADOR@EMAIL.COM',
        displayName: 'Test',
        passwordHash: 'hash',
      });
      expect(user.email).toBe('jogador@email.com');
    });

    it('assigns PLAYER role by default', () => {
      const user = makeUser();
      expect(user.roles).toEqual([UserRole.PLAYER]);
    });

    it('starts with mfa disabled', () => {
      const user = makeUser();
      expect(user.mfaEnabled).toBe(false);
      expect(user.mfaSecret).toBeNull();
    });

    it('starts with zero failed attempts', () => {
      const user = makeUser();
      expect(user.failedLoginAttempts).toBe(0);
      expect(user.isLocked()).toBe(false);
    });
  });

  describe('recordFailedLogin', () => {
    it('increments failed attempts', () => {
      const user = makeUser();
      user.recordFailedLogin(5, 30);
      expect(user.failedLoginAttempts).toBe(1);
      expect(user.isLocked()).toBe(false);
    });

    it('locks account after max attempts', () => {
      const user = makeUser();
      for (let i = 0; i < 5; i++) {
        user.recordFailedLogin(5, 30);
      }
      expect(user.isLocked()).toBe(true);
      expect(user.lockedUntil).not.toBeNull();
    });

    it('does not lock before reaching max attempts', () => {
      const user = makeUser();
      for (let i = 0; i < 4; i++) {
        user.recordFailedLogin(5, 30);
      }
      expect(user.isLocked()).toBe(false);
    });
  });

  describe('resetFailedLogins', () => {
    it('clears attempts and lock', () => {
      const user = makeUser();
      for (let i = 0; i < 5; i++) user.recordFailedLogin(5, 30);
      expect(user.isLocked()).toBe(true);

      user.resetFailedLogins();
      expect(user.failedLoginAttempts).toBe(0);
      expect(user.isLocked()).toBe(false);
      expect(user.lockedUntil).toBeNull();
    });
  });

  describe('enableMfa / disableMfa', () => {
    it('enables MFA with secret', () => {
      const user = makeUser();
      user.enableMfa('TOTP_SECRET_BASE32');
      expect(user.mfaEnabled).toBe(true);
      expect(user.mfaSecret).toBe('TOTP_SECRET_BASE32');
    });

    it('disables MFA and clears secret', () => {
      const user = makeUser();
      user.enableMfa('TOTP_SECRET_BASE32');
      user.disableMfa();
      expect(user.mfaEnabled).toBe(false);
      expect(user.mfaSecret).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('marks user as deleted', () => {
      const user = makeUser();
      expect(user.isDeleted()).toBe(false);
      user.softDelete();
      expect(user.isDeleted()).toBe(true);
      expect(user.deletedAt).not.toBeNull();
    });
  });

  describe('reconstitute', () => {
    it('restores entity from snapshot', () => {
      const original = makeUser();
      original.enableMfa('SECRET');
      const snapshot = original.toSnapshot();
      const restored = UserEntity.reconstitute(snapshot);

      expect(restored.id).toBe(original.id);
      expect(restored.email).toBe(original.email);
      expect(restored.mfaEnabled).toBe(true);
      expect(restored.mfaSecret).toBe('SECRET');
    });
  });
});
