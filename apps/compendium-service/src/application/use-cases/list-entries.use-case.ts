import { Entry } from '../../domain/entry/entities/entry.entity';
import { EntryService } from '../services/entry.service';

export interface ListEntriesRequest {
  system?: string | undefined;
  type?: string | undefined;
  tags?: string[] | undefined;
  query?: string | undefined;
}

export class ListEntriesUseCase {
  constructor(private readonly entryService: EntryService) {}

  async execute(request: ListEntriesRequest): Promise<Entry[]> {
    return this.entryService.list({
      system: request.system,
      type: request.type,
      tags: request.tags,
      query: request.query,
    });
  }
}
