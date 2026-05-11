import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { campaignEnv } from './config/campaign.env';
import { CampaignOrmEntity } from './infrastructure/persistence/typeorm/entities/campaign.orm-entity';
import { CharacterOrmEntity } from './infrastructure/persistence/typeorm/entities/character.orm-entity';
import { TableOrmEntity } from './infrastructure/persistence/typeorm/entities/table.orm-entity';
import { TypeOrmCampaignRepository } from './infrastructure/persistence/typeorm/repositories/campaign.typeorm-repository';
import { TypeOrmCharacterRepository } from './infrastructure/persistence/typeorm/repositories/character.typeorm-repository';
import { TypeOrmTableRepository } from './infrastructure/persistence/typeorm/repositories/table.typeorm-repository';
import { CAMPAIGN_REPOSITORY } from './domain/campaign/repositories/campaign.repository';
import { CHARACTER_REPOSITORY } from './domain/character/repositories/character.repository';
import { TABLE_REPOSITORY } from './domain/table/repositories/table.repository';
import { CampaignEventPublisher } from './infrastructure/messaging/campaign-event.publisher';
import { CampaignController } from './infrastructure/http/controllers/campaign.controller';
import { CharacterController } from './infrastructure/http/controllers/character.controller';
import {
  CreateCampaignUseCase, UpdateCampaignUseCase,
  ArchiveCampaignUseCase, GetCampaignUseCase, ListMyCampaignsUseCase,
} from './application/commands/campaign.use-cases';
import {
  CreateCharacterUseCase, UpdateCharacterSheetUseCase,
  GetCharacterUseCase, ListCampaignCharactersUseCase,
} from './application/commands/character.use-cases';
import { EXCHANGES } from '@vtt/shared-events';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [campaignEnv] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('POSTGRES_HOST'),
        port: cfg.get<number>('POSTGRES_PORT'),
        username: cfg.get('POSTGRES_USER'),
        password: cfg.get('POSTGRES_PASSWORD'),
        database: cfg.get('POSTGRES_DB'),
        ssl: cfg.get<boolean>('POSTGRES_SSL') ? { rejectUnauthorized: false } : false,
        entities: [CampaignOrmEntity, CharacterOrmEntity, TableOrmEntity],
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([CampaignOrmEntity, CharacterOrmEntity, TableOrmEntity]),
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        exchanges: [
          { name: EXCHANGES.CAMPAIGN, type: 'topic' },
          { name: EXCHANGES.GAME, type: 'topic' },
        ],
        uri: cfg.get<string>('RABBITMQ_URI') ?? 'amqp://localhost:5672',
        connectionInitOptions: { wait: false },
      }),
    }),
  ],
  controllers: [CampaignController, CharacterController],
  providers: [
    { provide: CAMPAIGN_REPOSITORY, useClass: TypeOrmCampaignRepository },
    { provide: CHARACTER_REPOSITORY, useClass: TypeOrmCharacterRepository },
    { provide: TABLE_REPOSITORY, useClass: TypeOrmTableRepository },
    CampaignEventPublisher,
    CreateCampaignUseCase, UpdateCampaignUseCase,
    ArchiveCampaignUseCase, GetCampaignUseCase, ListMyCampaignsUseCase,
    CreateCharacterUseCase, UpdateCharacterSheetUseCase,
    GetCharacterUseCase, ListCampaignCharactersUseCase,
  ],
})
export class CampaignModule {}
