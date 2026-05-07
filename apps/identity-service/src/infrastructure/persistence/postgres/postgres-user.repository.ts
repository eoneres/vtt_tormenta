import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@vtt/shared-types';
import { UserEntity, type UserProps } from '../../../domain/user/entities/user.entity';
import type { IUserRepository } from '../../../domain/user/repositories/user.repository.interface';
import { UserOrmEntity } from './user.orm-entity';

@Injectable()
export class PostgresUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    const row = await this.repo.findOne({ where: { id }, withDeleted: true });
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const row = await this.repo.findOne({
      where: { email: email.toLowerCase().trim() },
      withDeleted: true,
    });
    return row ? this.toDomain(row) : null;
  }

  async save(user: UserEntity): Promise<void> {
    await this.repo.insert(this.toOrm(user));
  }

  async update(user: UserEntity): Promise<void> {
    const snapshot = user.toSnapshot();
    await this.repo.update(snapshot.id, {
      displayName: snapshot.displayName,
      passwordHash: snapshot.passwordHash,
      roles: snapshot.roles,
      mfaEnabled: snapshot.mfaEnabled,
      mfaSecret: snapshot.mfaSecret,
      failedLoginAttempts: snapshot.failedLoginAttempts,
      lockedUntil: snapshot.lockedUntil,
      updatedAt: snapshot.updatedAt,
      deletedAt: snapshot.deletedAt,
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.repo.existsBy({ email: email.toLowerCase().trim() });
  }

  private toDomain(row: UserOrmEntity): UserEntity {
    const props: UserProps = {
      id: row.id,
      email: row.email,
      displayName: row.displayName,
      passwordHash: row.passwordHash,
      roles: row.roles as UserRole[],
      mfaEnabled: row.mfaEnabled,
      mfaSecret: row.mfaSecret,
      failedLoginAttempts: row.failedLoginAttempts,
      lockedUntil: row.lockedUntil,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
    return UserEntity.reconstitute(props);
  }

  private toOrm(user: UserEntity): UserOrmEntity {
    const s = user.toSnapshot();
    const orm = new UserOrmEntity();
    orm.id = s.id;
    orm.email = s.email;
    orm.displayName = s.displayName;
    orm.passwordHash = s.passwordHash;
    orm.roles = s.roles;
    orm.mfaEnabled = s.mfaEnabled;
    orm.mfaSecret = s.mfaSecret;
    orm.failedLoginAttempts = s.failedLoginAttempts;
    orm.lockedUntil = s.lockedUntil;
    orm.createdAt = s.createdAt;
    orm.updatedAt = s.updatedAt;
    orm.deletedAt = s.deletedAt;
    return orm;
  }
}
