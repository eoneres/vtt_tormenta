import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700100000000 implements MigrationInterface {
  name = 'InitialSchema1700100000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE campaign_status_enum AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');
      CREATE TYPE table_state_enum AS ENUM ('IDLE', 'IN_SESSION', 'PAUSED');

      CREATE TABLE campaigns (
        id UUID PRIMARY KEY,
        "ownerId" UUID NOT NULL,
        "systemId" VARCHAR NOT NULL,
        name VARCHAR NOT NULL,
        description VARCHAR NOT NULL DEFAULT '',
        status campaign_status_enum NOT NULL DEFAULT 'ACTIVE',
        settings JSONB NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX idx_campaigns_owner ON campaigns ("ownerId");
      CREATE INDEX idx_campaigns_system ON campaigns ("systemId");

      CREATE TABLE characters (
        id UUID PRIMARY KEY,
        "userId" UUID NOT NULL,
        "campaignId" UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        "systemId" VARCHAR NOT NULL,
        name VARCHAR NOT NULL,
        "sheetData" JSONB NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX idx_characters_campaign ON characters ("campaignId");
      CREATE INDEX idx_characters_user ON characters ("userId");

      CREATE TABLE tables (
        id UUID PRIMARY KEY,
        "campaignId" UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        name VARCHAR NOT NULL,
        "activeMapId" UUID,
        state table_state_enum NOT NULL DEFAULT 'IDLE',
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX idx_tables_campaign ON tables ("campaignId");
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS tables;
      DROP TABLE IF EXISTS characters;
      DROP TABLE IF EXISTS campaigns;
      DROP TYPE IF EXISTS table_state_enum;
      DROP TYPE IF EXISTS campaign_status_enum;
    `);
  }
}
