import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateId } from '@vtt/shared-utils';
import { USER_REPOSITORY } from '../domain/user/repositories/user.repository.interface';
import type { IUserRepository } from '../domain/user/repositories/user.repository.interface';
import { AUDIT_LOGGER } from '../infrastructure/persistence/postgres/audit-logger.interface';
import type { IAuditLogger } from '../infrastructure/persistence/postgres/audit-logger.interface';
import { SESSION_STORE } from '../infrastructure/persistence/redis/session-store.interface';
import type { ISessionStore } from '../infrastructure/persistence/redis/session-store.interface';
import { AuditLogOrmEntity } from '../infrastructure/persistence/postgres/audit-log.orm-entity';

export interface UserProfileResponse {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  mfaEnabled: boolean;
  createdAt: Date;
}

export interface UserDataExportResponse {
  profile: UserProfileResponse;
  auditLogs: Array<{
    action: string;
    resource: string;
    createdAt: Date;
  }>;
  exportedAt: string;
}

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(AUDIT_LOGGER) private readonly auditLogger: IAuditLogger,
    @Inject(SESSION_STORE) private readonly sessionStore: ISessionStore,
    @InjectRepository(AuditLogOrmEntity)
    private readonly auditRepo: Repository<AuditLogOrmEntity>,
  ) {}

  async getProfile(userId: string): Promise<UserProfileResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user || user.isDeleted()) throw new NotFoundException('User not found');

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roles: user.roles,
      mfaEnabled: user.mfaEnabled,
      createdAt: user.createdAt,
    };
  }

  // LGPD Art. 18 — direito de acesso e portabilidade
  async exportData(userId: string): Promise<UserDataExportResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user || user.isDeleted()) throw new NotFoundException('User not found');

    const logs = await this.auditRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 500,
      select: ['action', 'resource', 'createdAt'],
    });

    await this.auditLogger.log({
      userId,
      action: 'user.data_exported',
      resource: 'user',
      resourceId: userId,
      ipHash: '',
      metadata: {},
    });

    return {
      profile: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        roles: user.roles,
        mfaEnabled: user.mfaEnabled,
        createdAt: user.createdAt,
      },
      auditLogs: logs.map((l) => ({
        action: l.action,
        resource: l.resource,
        createdAt: l.createdAt,
      })),
      exportedAt: new Date().toISOString(),
    };
  }

  // LGPD Art. 18 — direito ao esquecimento
  async deleteAccount(userId: string, ipHash: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user || user.isDeleted()) throw new NotFoundException('User not found');

    user.softDelete();
    await this.userRepository.update(user);
    await this.sessionStore.invalidateAllForUser(userId);

    await this.auditLogger.log({
      userId,
      action: 'user.account_deleted',
      resource: 'user',
      resourceId: userId,
      ipHash,
      metadata: { scheduledPurgeAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
    });
  }
}
