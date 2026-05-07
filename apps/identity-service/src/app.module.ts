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
import { AuthService } from './application/auth.service';
import { SESSION_STORE } from './infrastructure/persistence/redis/session-store.interface';
import { RedisSessionStore } from './infrastructure/persistence/redis/redis-session.store';
import { AUDIT_LOGGER } from './infrastructure/persistence/postgres/audit-logger.interface';
import { USER_REPOSITORY } from './domain/user/repositories/user.repository.interface';

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
        autoLoadEntities: true,
        synchronize: false, // Always use migrations in production
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: SESSION_STORE,
      useClass: RedisSessionStore,
    },
    {
      provide: USER_REPOSITORY,
      useClass: require('./infrastructure/persistence/postgres/postgres-user.repository').PostgresUserRepository,
    },
    {
      provide: AUDIT_LOGGER,
      useClass: require('./infrastructure/persistence/postgres/postgres-audit.logger').PostgresAuditLogger,
    },
  ],
})
export class AppModule {}
