import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ListEntriesUseCase } from '../../../application/use-cases/list-entries.use-case';
import { EntryService } from '../../../application/services/entry.service';
import { CreateEntryDto } from '../dto/create-entry.dto';
import { ListEntriesQuery } from '../dto/list-entries.dto';
import { EntryId } from '../../../domain/entry/value-objects/entry-id.vo';
import { Entry } from '../../../domain/entry/entities/entry.entity';

@Controller('entries')
export class EntriesController {
  constructor(
    private readonly listEntriesUseCase: ListEntriesUseCase,
    private readonly entryService: EntryService,
  ) {}

  @Get()
  async list(@Query() query: ListEntriesQuery): Promise<Entry[]> {
    return this.listEntriesUseCase.execute({
      system: query.system,
      type: query.type,
      tags: query.tags,
      query: query.query,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateEntryDto): Promise<Entry> {
    const entry = Entry.create({
      id: EntryId.create(),
      system: dto.system,
      type: dto.type,
      name: dto.name,
      description: dto.description,
      tags: dto.tags,
      content: dto.content,
    } as any);

    return this.entryService.create(entry);
  }
}
