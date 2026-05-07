import { DataSource } from 'typeorm';
import { CampaignOrmEntity } from './src/infrastructure/persistence/typeorm/entities/campaign.orm-entity';
import { CharacterOrmEntity } from './src/infrastructure/persistence/typeorm/entities/character.orm-entity';
import { TableOrmEntity } from './src/infrastructure/persistence/typeorm/entities/table.orm-entity';

export default new DataSource({
  type: 'postgres',
  host: process.env['POSTGRES_HOST'] ?? 'localhost',
  port: parseInt(process.env['POSTGRES_PORT'] ?? '5432', 10),
  username: process.env['POSTGRES_USER'] ?? 'vtt',
  password: process.env['POSTGRES_PASSWORD'] ?? 'vtt',
  database: process.env['POSTGRES_DB'] ?? 'campaign_db',
  entities: [CampaignOrmEntity, CharacterOrmEntity, TableOrmEntity],
  migrations: ['migrations/*.ts'],
});
