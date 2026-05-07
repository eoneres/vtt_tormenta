import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableOrmEntity } from '../entities/table.orm-entity';
import { Table } from '../../../../domain/table/entities/table.entity';
import type { ITableRepository } from '../../../../domain/table/repositories/table.repository';

@Injectable()
export class TypeOrmTableRepository implements ITableRepository {
  constructor(
    @InjectRepository(TableOrmEntity)
    private readonly repo: Repository<TableOrmEntity>,
  ) {}

  async findById(id: string): Promise<Table | null> {
    const row = await this.repo.findOneBy({ id });
    return row ? this.toDomain(row) : null;
  }

  async findByCampaign(campaignId: string): Promise<Table[]> {
    const rows = await this.repo.findBy({ campaignId });
    return rows.map((r) => this.toDomain(r));
  }

  async save(table: Table): Promise<void> {
    await this.repo.save(this.toOrm(table));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(row: TableOrmEntity): Table {
    return Table.reconstitute({
      id: row.id, campaignId: row.campaignId, name: row.name,
      activeMapId: row.activeMapId, state: row.state, createdAt: row.createdAt,
    });
  }

  private toOrm(t: Table): TableOrmEntity {
    const row = new TableOrmEntity();
    Object.assign(row, {
      id: t.id, campaignId: t.campaignId, name: t.name,
      activeMapId: t.activeMapId, state: t.state, createdAt: t.createdAt,
    });
    return row;
  }
}
