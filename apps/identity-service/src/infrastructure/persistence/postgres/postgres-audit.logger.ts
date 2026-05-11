import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateId } from '@vtt/shared-utils';
import type { IAuditLogger, AuditLogEntry } from './audit-logger.interface';
import { AuditLogOrmEntity } from './audit-log.orm-entity';

@Injectable()
export class PostgresAuditLogger implements IAuditLogger {
  constructor(
    @InjectRepository(AuditLogOrmEntity)
    private readonly repo: Repository<AuditLogOrmEntity>,
  ) {}

  async log(entry: AuditLogEntry): Promise<void> {
    const record = new AuditLogOrmEntity();
    record.id = generateId();
    record.userId = entry.userId;
    record.action = entry.action;
    record.resource = entry.resource;
    record.resourceId = entry.resourceId;
    record.ipHash = entry.ipHash || null;
    record.metadata = entry.metadata;
    // insert only — never update or delete audit logs
    await this.repo.insert(record);
  }
}
