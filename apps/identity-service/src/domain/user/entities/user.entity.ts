import { generateId } from '@vtt/shared-utils';
import type { UserRole } from '@vtt/shared-types';

export interface UserProps {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  roles: UserRole[];
  mfaEnabled: boolean;
  mfaSecret: string | null;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class UserEntity {
  private readonly props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  static create(params: {
    email: string;
    displayName: string;
    passwordHash: string;
    roles?: UserRole[];
  }): UserEntity {
    const { UserRole: Role } = require('@vtt/shared-types') as typeof import('@vtt/shared-types');
    return new UserEntity({
      id: generateId(),
      email: params.email.toLowerCase().trim(),
      displayName: params.displayName.trim(),
      passwordHash: params.passwordHash,
      roles: params.roles ?? [Role.PLAYER],
      mfaEnabled: false,
      mfaSecret: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
  }

  static reconstitute(props: UserProps): UserEntity {
    return new UserEntity(props);
  }

  get id(): string { return this.props.id; }
  get email(): string { return this.props.email; }
  get displayName(): string { return this.props.displayName; }
  get passwordHash(): string { return this.props.passwordHash; }
  get roles(): UserRole[] { return [...this.props.roles]; }
  get mfaEnabled(): boolean { return this.props.mfaEnabled; }
  get mfaSecret(): string | null { return this.props.mfaSecret; }
  get failedLoginAttempts(): number { return this.props.failedLoginAttempts; }
  get lockedUntil(): Date | null { return this.props.lockedUntil; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
  get deletedAt(): Date | null { return this.props.deletedAt; }

  isLocked(): boolean {
    return this.props.lockedUntil !== null && this.props.lockedUntil > new Date();
  }

  isDeleted(): boolean {
    return this.props.deletedAt !== null;
  }

  recordFailedLogin(maxAttempts: number, lockDurationMinutes: number): void {
    this.props.failedLoginAttempts += 1;
    if (this.props.failedLoginAttempts >= maxAttempts) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + lockDurationMinutes);
      this.props.lockedUntil = lockUntil;
    }
    this.props.updatedAt = new Date();
  }

  resetFailedLogins(): void {
    this.props.failedLoginAttempts = 0;
    this.props.lockedUntil = null;
    this.props.updatedAt = new Date();
  }

  enableMfa(secret: string): void {
    this.props.mfaSecret = secret;
    this.props.mfaEnabled = true;
    this.props.updatedAt = new Date();
  }

  disableMfa(): void {
    this.props.mfaSecret = null;
    this.props.mfaEnabled = false;
    this.props.updatedAt = new Date();
  }

  softDelete(): void {
    this.props.deletedAt = new Date();
    this.props.updatedAt = new Date();
  }

  toSnapshot(): UserProps {
    return { ...this.props };
  }
}
