import type { Table } from '../entities/table.entity';

export interface ITableRepository {
  findById(id: string): Promise<Table | null>;
  findByCampaign(campaignId: string): Promise<Table[]>;
  save(table: Table): Promise<void>;
  delete(id: string): Promise<void>;
}

export const TABLE_REPOSITORY = Symbol('ITableRepository');
