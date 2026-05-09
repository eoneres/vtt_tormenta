import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EntryDocument, EntrySchema } from './persistence/mongo/schemas/entry.schema';
import { MongoEntryRepository } from './persistence/mongo/entry.repository';
import { EntryService } from '../application/services/entry.service';
import { ListEntriesUseCase } from '../application/use-cases/list-entries.use-case';
import { EntriesController } from './http/controllers/entries.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: EntryDocument.name, schema: EntrySchema }]),
  ],
  controllers: [EntriesController],
  providers: [
    {
      provide: 'EntryRepository',
      useClass: MongoEntryRepository,
    },
    EntryService,
    ListEntriesUseCase,
  ],
  exports: [EntryService],
})
export class InfrastructureEntryModule {}
