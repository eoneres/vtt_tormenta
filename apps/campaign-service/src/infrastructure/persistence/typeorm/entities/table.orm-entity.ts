import {
  Entity, PrimaryColumn, Column, CreateDateColumn,
} from 'typeorm';
import { TableState } from '@vtt/shared-types';

@Entity('tables')
export class TableOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column('uuid') campaignId!: string;
  @Column() name!: string;
  @Column({ type: 'uuid', nullable: true }) activeMapId!: string | null;
  @Column({ type: 'enum', enum: TableState, default: TableState.IDLE }) state!: TableState;
  @CreateDateColumn() createdAt!: Date;
}
