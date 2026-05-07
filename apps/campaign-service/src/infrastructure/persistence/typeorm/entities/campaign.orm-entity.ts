import {
  Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { CampaignStatus } from '@vtt/shared-types';
import type { CampaignSettings } from '@vtt/shared-types';

@Entity('campaigns')
export class CampaignOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column('uuid') ownerId!: string;
  @Column() systemId!: string;
  @Column() name!: string;
  @Column({ default: '' }) description!: string;
  @Column({ type: 'enum', enum: CampaignStatus, default: CampaignStatus.ACTIVE })
  status!: CampaignStatus;
  @Column({ type: 'jsonb' }) settings!: CampaignSettings;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}
