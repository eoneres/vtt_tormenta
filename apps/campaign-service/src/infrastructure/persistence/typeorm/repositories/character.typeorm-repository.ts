import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CharacterOrmEntity } from '../entities/character.orm-entity';
import { Character } from '../../../../domain/character/entities/character.entity';
import type { ICharacterRepository } from '../../../../domain/character/repositories/character.repository';
import type { PaginationQuery, PaginatedResult } from '@vtt/shared-types';
import { buildPaginatedResult, getPaginationOffset } from '@vtt/shared-utils';

@Injectable()
export class TypeOrmCharacterRepository implements ICharacterRepository {
  constructor(
    @InjectRepository(CharacterOrmEntity)
    private readonly repo: Repository<CharacterOrmEntity>,
  ) {}

  async findById(id: string): Promise<Character | null> {
    const row = await this.repo.findOneBy({ id });
    return row ? this.toDomain(row) : null;
  }

  async findByCampaign(campaignId: string, query: PaginationQuery): Promise<PaginatedResult<Character>> {
    const { skip, take } = getPaginationOffset(query);
    const [rows, total] = await this.repo.findAndCount({ where: { campaignId }, skip, take });
    return buildPaginatedResult(rows.map((r) => this.toDomain(r)), total, query);
  }

  async findByUser(userId: string, query: PaginationQuery): Promise<PaginatedResult<Character>> {
    const { skip, take } = getPaginationOffset(query);
    const [rows, total] = await this.repo.findAndCount({ where: { userId }, skip, take });
    return buildPaginatedResult(rows.map((r) => this.toDomain(r)), total, query);
  }

  async save(character: Character): Promise<void> {
    await this.repo.save(this.toOrm(character));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(row: CharacterOrmEntity): Character {
    return Character.reconstitute({
      id: row.id, userId: row.userId, campaignId: row.campaignId,
      systemId: row.systemId, name: row.name, sheetData: row.sheetData,
      createdAt: row.createdAt, updatedAt: row.updatedAt,
    });
  }

  private toOrm(c: Character): CharacterOrmEntity {
    const row = new CharacterOrmEntity();
    Object.assign(row, {
      id: c.id, userId: c.userId, campaignId: c.campaignId,
      systemId: c.systemId, name: c.name, sheetData: c.sheetData,
      createdAt: c.createdAt, updatedAt: c.updatedAt,
    });
    return row;
  }
}
