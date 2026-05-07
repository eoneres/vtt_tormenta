import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import { vttEnv } from './config/vtt.env';
import { MapDocument, MapSchema } from './infrastructure/persistence/mongoose/schemas/map.schema';
import { TokenDocument, TokenSchema } from './infrastructure/persistence/mongoose/schemas/token.schema';
import { MongooseMapRepository } from './infrastructure/persistence/mongoose/repositories/map.mongoose-repository';
import { MongooseTokenRepository } from './infrastructure/persistence/mongoose/repositories/token.mongoose-repository';
import { MAP_REPOSITORY } from './domain/map/repositories/map.repository';
import { TOKEN_REPOSITORY } from './domain/token/repositories/token.repository';
import { TableStateCache } from './infrastructure/cache/table-state.cache';
import {
  CreateMapUseCase, GetMapUseCase, AddWallUseCase,
  PlaceTokenUseCase, MoveTokenUseCase, GetTableStateUseCase,
} from './application/use-cases/vtt.use-cases';
import { MapsController, TokensController, TableStateController } from './infrastructure/http/controllers/vtt.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [vttEnv] }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        uri: cfg.get<string>('MONGODB_URI') ?? 'mongodb://localhost:27017/vtt_engine',
      }),
    }),
    MongooseModule.forFeature([
      { name: MapDocument.name, schema: MapSchema },
      { name: TokenDocument.name, schema: TokenSchema },
    ]),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'single',
        url: `redis://${cfg.get('REDIS_HOST') ?? 'localhost'}:${cfg.get('REDIS_PORT') ?? 6379}`,
        options: cfg.get('REDIS_PASSWORD') ? { password: cfg.get('REDIS_PASSWORD') } : {},
      }),
    }),
  ],
  controllers: [MapsController, TokensController, TableStateController],
  providers: [
    { provide: MAP_REPOSITORY, useClass: MongooseMapRepository },
    { provide: TOKEN_REPOSITORY, useClass: MongooseTokenRepository },
    TableStateCache,
    CreateMapUseCase, GetMapUseCase, AddWallUseCase,
    PlaceTokenUseCase, MoveTokenUseCase, GetTableStateUseCase,
  ],
})
export class VttEngineModule {}
