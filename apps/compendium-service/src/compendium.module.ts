import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TerminusModule } from '@nestjs/terminus';
import {
  CreateEntryUseCase,
  GetEntryUseCase,
  SearchEntriesUseCase,
  UpdateEntryUseCase,
  DeleteEntryUseCase,
  ImportBulkEntriesUseCase,
  GetSystemStatsUseCase,
} from './application/commands/compendium.use-cases';
import { IEntryRepository } from './domain/entry/entry.repository';
import { CompendiumController } from './infrastructure/http/controllers/compendium.controller';
import { HealthController } from './infrastructure/http/controllers/health.controller';
import { MongooseEntryRepository } from './infrastructure/persistence/mongoose/repositories/compendium-entry.mongoose-repository';
import {
  CompendiumEntryDocument,
  CompendiumEntrySchema,
} from './infrastructure/persistence/mongoose/schemas/compendium-entry.schema';
import { CompendiumCacheService } from './infrastructure/cache/compendium.cache';
import { CompendiumSeederService } from './infrastructure/seeder/compendium.seeder';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      }),
    }),
    MongooseModule.forFeature([
      { name: CompendiumEntryDocument.name, schema: CompendiumEntrySchema },
    ]),
    TerminusModule,
  ],
  controllers: [CompendiumController, HealthController],
  providers: [
    // Use Cases
    CreateEntryUseCase,
    GetEntryUseCase,
    SearchEntriesUseCase,
    UpdateEntryUseCase,
    DeleteEntryUseCase,
    ImportBulkEntriesUseCase,
    GetSystemStatsUseCase,

    // Infrastructure
    CompendiumCacheService,
    CompendiumSeederService,

    // Repository binding
    { provide: IEntryRepository, useClass: MongooseEntryRepository },
  ],
})
export class CompendiumModule {}
