import { CompendiumEntry, EntryType, GameSystem } from './entry.entity';

export interface EntrySearchFilters {
  system?: GameSystem;
  type?: EntryType | EntryType[];
  tags?: string[];
  isOfficial?: boolean;
  isHomebrew?: boolean;
  createdBy?: string;
  query?: string; // full-text search
}

export interface EntrySearchOptions {
  skip: number;
  limit: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface EntrySearchResult {
  entries: CompendiumEntry[];
  total: number;
  hasMore: boolean;
}

export abstract class IEntryRepository {
  abstract findById(id: string): Promise<CompendiumEntry | null>;
  abstract findBySlug(slug: string, system: GameSystem): Promise<CompendiumEntry | null>;
  abstract search(
    filters: EntrySearchFilters,
    options: EntrySearchOptions,
  ): Promise<EntrySearchResult>;
  abstract save(entry: CompendiumEntry): Promise<void>;
  abstract update(entry: CompendiumEntry): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract countBySystem(system: GameSystem): Promise<Record<EntryType, number>>;
  abstract findByIds(ids: string[]): Promise<CompendiumEntry[]>;
}
