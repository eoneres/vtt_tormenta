import { Entry } from '../entities/entry.entity';

export interface EntryRepository {
  save(entry: Entry): Promise<Entry>;
  findById(id: string): Promise<Entry | null>;
  list(params: { system?: string | undefined; type?: string | undefined; tags?: string[] | undefined; query?: string | undefined }): Promise<Entry[]>;
}
