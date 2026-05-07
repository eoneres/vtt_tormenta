import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"                     UUID        NOT NULL DEFAULT uuid_generate_v4(),
        "email"                  VARCHAR(255) NOT NULL,
        "display_name"           VARCHAR(100) NOT NULL,
        "password_hash"          TEXT         NOT NULL,
        "roles"                  TEXT[]       NOT NULL DEFAULT ARRAY['PLAYER'],
        "mfa_enabled"            BOOLEAN      NOT NULL DEFAULT FALSE,
        "mfa_secret"             TEXT,
        "failed_login_attempts"  INTEGER      NOT NULL DEFAULT 0,
        "locked_until"           TIMESTAMPTZ,
        "created_at"             TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        "updated_at"             TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        "deleted_at"             TIMESTAMPTZ,
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_users_email_active"
        ON "users" ("email")
        WHERE "deleted_at" IS NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_users_deleted_at" ON "users" ("deleted_at")
    `);

    await queryRunner.query(`
      CREATE TABLE "oauth_providers" (
        "id"          UUID        NOT NULL DEFAULT uuid_generate_v4(),
        "user_id"     UUID        NOT NULL,
        "provider"    VARCHAR(50) NOT NULL,
        "provider_id" VARCHAR(255) NOT NULL,
        "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_oauth_providers" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_oauth_provider_id" UNIQUE ("provider", "provider_id"),
        CONSTRAINT "FK_oauth_providers_user" FOREIGN KEY ("user_id")
          REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id"          UUID         NOT NULL DEFAULT uuid_generate_v4(),
        "user_id"     UUID,
        "action"      VARCHAR(100) NOT NULL,
        "resource"    VARCHAR(100) NOT NULL,
        "resource_id" UUID,
        "ip_hash"     VARCHAR(32),
        "metadata"    JSONB        NOT NULL DEFAULT '{}',
        "created_at"  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_audit_logs_user_id"   ON "audit_logs" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_audit_logs_action"    ON "audit_logs" ("action")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_audit_logs_created_at" ON "audit_logs" ("created_at")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "oauth_providers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
