import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  baseEnvSchema,
  authEnvSchema,
  databaseEnvSchema,
  observabilityEnvSchema,
  validateEnv,
} from '@vtt/shared-config';
import { z } from 'zod';

import { AuthController } from './infrastructure/http/controllers/auth.controller';
import { UserController } from './infrastructure/http/controllers/user.controller';
import { JwksController } from './infrastructure/http/controllers/jwks.controller';

import { AuthService } from './application/auth.service';
import { UserService } from './application/user.service';

import { UserOrmEntity } from './infrastructure/persistence/postgres/user.orm-entity';
import { AuditLogOrmEntity } from './infrastructure/persistence/postgres/audit-log.orm-entity';
import { PostgresUserRepository } from './infrastructure/persistence/postgres/postgres-user.repository';
import { PostgresAuditLogger } from './infrastructure/persistence/postgres/postgres-audit.logger';
import { USER_REPOSITORY } from './domain/user/repositories/user.repository.interface';
import { AUDIT_LOGGER } from './infrastructure/persistence/postgres/audit-logger.interface';

import { RedisSessionStore } from './infrastructure/persistence/redis/redis-session.store';
import { RedisProvider, REDIS_CLIENT } from './infrastructure/persistence/redis/redis.provider';
import { SESSION_STORE } from './infrastructure/persistence/redis/session-store.interface';

const identityEnvSchema = baseEnvSchema
  .merge(authEnvSchema)
  .merge(databaseEnvSchema)
  .merge(observabilityEnvSchema);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: () => validateEnv(identityEnvSchema),
    }),

    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 60 },
    ]),

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        privateKey: config.getOrThrow<string>('JWT_PRIVATE_KEY').replace(/\\n/g, '\n'),
        publicKey: config.getOrThrow<string>('JWT_PUBLIC_KEY').replace(/\\n/g, '\n'),
        signOptions: {
          algorithm: 'RS256',
          expiresIn: config.get<number>('JWT_ACCESS_TOKEN_TTL', 900),
          issuer: config.get<string>('JWT_ISSUER', 'vtt-platform'),
        },
      }),
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('POSTGRES_HOST'),
        port: config.get<number>('POSTGRES_PORT', 5432),
        username: config.getOrThrow<string>('POSTGRES_USER'),
        password: config.getOrThrow<string>('POSTGRES_PASSWORD'),
        database: config.getOrThrow<string>('POSTGRES_DB'),
        ssl: config.get<boolean>('POSTGRES_SSL', false),
        entities: [UserOrmEntity, AuditLogOrmEntity],
        migrations: ['dist/migrations/*.js'],
        migrationsTableName: 'typeorm_migrations',
        synchronize: false,
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),

    TypeOrmModule.forFeature([UserOrmEntity, AuditLogOrmEntity]),
  ],

  controllers: [AuthController, UserController, JwksController],

  providers: [
    AuthService,
    UserService,

    RedisProvider,

    { provide: USER_REPOSITORY, useClass: PostgresUserRepository },
    { provide: AUDIT_LOGGER, useClass: PostgresAuditLogger },
    { provide: SESSION_STORE, useClass: RedisSessionStore },
  ],
})
export class AppModule {}
