import { Inject, Injectable } from '@nestjs/common';
import { Entry } from '../../domain/entry/entities/entry.entity';
import { EntryRepository } from '../../domain/entry/repositories/entry.repository';

@Injectable()
export class EntryService {
  constructor(
    @Inject('EntryRepository')
    private readonly entryRepository: EntryRepository,
  ) {}

  async create(entry: Entry): Promise<Entry> {
    return this.entryRepository.save(entry);
  }

  async list(params: { system?: string | undefined; type?: string | undefined; tags?: string[] | undefined; query?: string | undefined }): Promise<Entry[]> {
    return this.entryRepository.list(params);
  }
}
