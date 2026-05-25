/**
 * PATCH — campaign-service/src/domain/entities/campaign.entities.ts
 *
 * Adicionar 'tormenta20' ao enum SystemId (se existir validação enum).
 * Se o campo systemId for string livre no TypeORM, nenhuma alteração de
 * banco é necessária — apenas garantir que o frontend envia o valor correto.
 *
 * Se houver um enum no banco PostgreSQL para system_id, rodar esta migration:
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTormenta20SystemId1716480000000 implements MigrationInterface {
  name = 'AddTormenta20SystemId1716480000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Só necessária se system_id for um tipo ENUM no PostgreSQL.
    // Se for VARCHAR, esta migration não precisa ser executada.
    const result = await queryRunner.query(`
      SELECT typname FROM pg_type WHERE typname = 'system_id_enum'
    `);

    if (result.length > 0) {
      // Adiciona tormenta20 ao enum existente
      await queryRunner.query(`
        ALTER TYPE "system_id_enum" ADD VALUE IF NOT EXISTS 'tormenta20'
      `);
      await queryRunner.query(`
        ALTER TYPE "system_id_enum" ADD VALUE IF NOT EXISTS 'dnd5e'
      `);
      await queryRunner.query(`
        ALTER TYPE "system_id_enum" ADD VALUE IF NOT EXISTS 'pathfinder2e'
      `);
      await queryRunner.query(`
        ALTER TYPE "system_id_enum" ADD VALUE IF NOT EXISTS 'call-of-cthulhu'
      `);
    }
    // Se system_id for VARCHAR, não faz nada — já funciona.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ALTER TYPE ... DROP VALUE não é suportado no PostgreSQL.
    // Down migration não aplicável para enum values.
  }
}
