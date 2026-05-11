import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { marketplaceEnv } from './config/marketplace.env';
import { MarketplaceController } from './infrastructure/http/controllers/marketplace.controller';
import { MarketplaceListingOrmEntity } from './infrastructure/persistence/typeorm/entities/marketplace-listing.orm-entity';
import { TypeOrmMarketplaceListingRepository } from './infrastructure/persistence/typeorm/repositories/marketplace-listing.typeorm-repository';
import { MARKETPLACE_LISTING_REPOSITORY } from './domain/listing/repositories/marketplace-listing.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [marketplaceEnv] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get<string>('POSTGRES_HOST'),
        port: cfg.get<number>('POSTGRES_PORT'),
        username: cfg.get<string>('POSTGRES_USER'),
        password: cfg.get<string>('POSTGRES_PASSWORD'),
        database: cfg.get<string>('POSTGRES_DB'),
        ssl: cfg.get<boolean>('POSTGRES_SSL') ? { rejectUnauthorized: false } : false,
        entities: [MarketplaceListingOrmEntity],
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([MarketplaceListingOrmEntity]),
  ],
  controllers: [MarketplaceController],
  providers: [
    {
      provide: MARKETPLACE_LISTING_REPOSITORY,
      useClass: TypeOrmMarketplaceListingRepository,
    },
  ],
})
export class MarketplaceModule {}
