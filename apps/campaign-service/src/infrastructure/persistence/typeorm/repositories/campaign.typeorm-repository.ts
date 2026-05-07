import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampaignOrmEntity } from '../entities/campaign.orm-entity';
import { Campaign } from '../../../../domain/campaign/entities/campaign.entity';
import type { ICampaignRepository, CampaignFilters } from '../../../../domain/campaign/repositories/campaign.repository';
import type { PaginationQuery, PaginatedResult } from '@vtt/shared-types';
import { buildPaginatedResult, getPaginationOffset } from '@vtt/shared-utils';

@Injectable()
export class TypeOrmCampaignRepository implements ICampaignRepository {
  constructor(
    @InjectRepository(CampaignOrmEntity)
    private readonly repo: Repository<CampaignOrmEntity>,
  ) {}

  async findById(id: string): Promise<Campaign | null> {
    const row = await this.repo.findOneBy({ id });
    return row ? this.toDomain(row) : null;
  }

  async findByOwner(ownerId: string, query: PaginationQuery): Promise<PaginatedResult<Campaign>> {
    const { skip, take } = getPaginationOffset(query);
    const [rows, total] = await this.repo.findAndCount({ where: { ownerId }, skip, take, order: { createdAt: 'DESC' } });
    return buildPaginatedResult(rows.map((r) => this.toDomain(r)), total, query);
  }

  async findPublic(query: PaginationQuery, filters?: CampaignFilters): Promise<PaginatedResult<Campaign>> {
    const { skip, take } = getPaginationOffset(query);
    const qb = this.repo.createQueryBuilder('c')
      .where("c.settings->>'isPublic' = 'true'")
      .skip(skip).take(take).orderBy('c.createdAt', 'DESC');
    if (filters?.systemId) qb.andWhere('c.systemId = :systemId', { systemId: filters.systemId });
    const [rows, total] = await qb.getManyAndCount();
    return buildPaginatedResult(rows.map((r) => this.toDomain(r)), total, query);
  }

  async save(campaign: Campaign): Promise<void> {
    await this.repo.save(this.toOrm(campaign));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(row: CampaignOrmEntity): Campaign {
    return Campaign.reconstitute({
      id: row.id,
      ownerId: row.ownerId,
      systemId: row.systemId,
      name: row.name,
      description: row.description,
      status: row.status,
      settings: row.settings,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private toOrm(c: Campaign): CampaignOrmEntity {
    const row = new CampaignOrmEntity();
    Object.assign(row, {
      id: c.id, ownerId: c.ownerId, systemId: c.systemId,
      name: c.name, description: c.description, status: c.status,
      settings: c.settings, createdAt: c.createdAt, updatedAt: c.updatedAt,
    });
    return row;
  }
}
