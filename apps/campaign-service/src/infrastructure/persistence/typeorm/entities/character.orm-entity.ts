import {
  Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('characters')
export class CharacterOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column('uuid') userId!: string;
  @Column('uuid') campaignId!: string;
  @Column() systemId!: string;
  @Column() name!: string;
  @Column({ type: 'jsonb', default: '{}' }) sheetData!: Record<string, unknown>;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}
