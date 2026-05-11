import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { CompendiumEntry, CreateEntryProps, UpdateEntryProps, EntryType, GameSystem } from '../../domain/entry/entry.entity';
import { IEntryRepository, EntrySearchFilters, EntrySearchOptions, EntrySearchResult } from '../../domain/entry/entry.repository';
import { CompendiumCacheService } from '../../infrastructure/cache/compendium.cache';

// ─── Commands ─────────────────────────────────────────────────────────────────

export interface CreateEntryCommand {
  requesterId: string;
  requesterRoles: string[];
  entry: Omit<CreateEntryProps, 'isOfficial'>;
}

export interface UpdateEntryCommand {
  requesterId: string;
  requesterRoles: string[];
  entryId: string;
  changes: UpdateEntryProps;
}

export interface DeleteEntryCommand {
  requesterId: string;
  requesterRoles: string[];
  entryId: string;
}

export interface ImportBulkCommand {
  requesterId: string;
  requesterRoles: string[];
  entries: Omit<CreateEntryProps, 'isHomebrew' | 'createdBy'>[];
  overwrite?: boolean;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export interface GetEntryQuery {
  entryId: string;
  requesterId?: string;
}

export interface SearchEntriesQuery {
  filters: EntrySearchFilters;
  options: EntrySearchOptions;
  requesterId?: string;
}

export interface GetEntriesByIdsQuery {
  ids: string[];
  requesterId?: string;
}

// ─── Results ──────────────────────────────────────────────────────────────────

export interface EntryDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  type: EntryType;
  system: GameSystem;
  tags: string[];
  attributes: Array<{ key: string; value: unknown; label?: string }>;
  relations: Array<{ type: string; targetId: string; targetName: string }>;
  source?: { book: string; page?: number; url?: string };
  isOfficial: boolean;
  isHomebrew: boolean;
  createdBy?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Use Cases ────────────────────────────────────────────────────────────────

@Injectable()
export class CreateEntryUseCase {
  constructor(
    private readonly repo: IEntryRepository,
    private readonly cache: CompendiumCacheService,
  ) {}

  async execute(cmd: CreateEntryCommand): Promise<EntryDto> {
    const isAdmin = cmd.requesterRoles.includes('admin');
    const isOfficial = isAdmin && (cmd.entry as any).isOfficial === true;

    // Check slug uniqueness
    const existing = await this.repo.findBySlug(
      CompendiumEntry.slugify(cmd.entry.name),
      cmd.entry.system,
    );
    if (existing) {
      throw new ConflictException(`Entry with name "${cmd.entry.name}" already exists in system "${cmd.entry.system}"`);
    }

    const entry = CompendiumEntry.create({
      ...cmd.entry,
      isOfficial,
      isHomebrew: !isOfficial,
      createdBy: cmd.requesterId,
    });

    await this.repo.save(entry);
    await this.cache.invalidateSystem(entry.system);
    return this.toDto(entry);
  }

  private toDto(e: CompendiumEntry): EntryDto {
    return {
      id: e.id,
      name: e.name,
      slug: e.slug,
      description: e.description,
      shortDescription: e.shortDescription,
      type: e.type,
      system: e.system,
      tags: e.tags,
      attributes: e.attributes,
      relations: e.relations,
      source: e.source,
      isOfficial: e.isOfficial,
      isHomebrew: e.isHomebrew,
      createdBy: e.createdBy,
      version: e.version,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    };
  }
}

@Injectable()
export class GetEntryUseCase {
  constructor(
    private readonly repo: IEntryRepository,
    private readonly cache: CompendiumCacheService,
  ) {}

  async execute(query: GetEntryQuery): Promise<EntryDto> {
    // Try cache first
    const cached = await this.cache.getEntry(query.entryId);
    if (cached) return cached;

    const entry = await this.repo.findById(query.entryId);
    if (!entry) throw new NotFoundException(`Compendium entry "${query.entryId}" not found`);

    const dto = this.toDto(entry);
    await this.cache.setEntry(query.entryId, dto);
    return dto;
  }

  private toDto(e: CompendiumEntry): EntryDto {
    return {
      id: e.id,
      name: e.name,
      slug: e.slug,
      description: e.description,
      shortDescription: e.shortDescription,
      type: e.type,
      system: e.system,
      tags: e.tags,
      attributes: e.attributes,
      relations: e.relations,
      source: e.source,
      isOfficial: e.isOfficial,
      isHomebrew: e.isHomebrew,
      createdBy: e.createdBy,
      version: e.version,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    };
  }
}

@Injectable()
export class SearchEntriesUseCase {
  constructor(
    private readonly repo: IEntryRepository,
    private readonly cache: CompendiumCacheService,
  ) {}

  async execute(query: SearchEntriesQuery): Promise<{
    entries: EntryDto[];
    total: number;
    hasMore: boolean;
    page: number;
    pageSize: number;
  }> {
    // Apply visibility filters (public only for non-authenticated)
    const filters: EntrySearchFilters = {
      ...query.filters,
      isPublic: query.requesterId ? undefined : true,
    };

    const result = await this.repo.search(filters, query.options);
    return {
      entries: result.entries.map(this.toDto),
      total: result.total,
      hasMore: result.hasMore,
      page: Math.floor(query.options.skip / query.options.limit) + 1,
      pageSize: query.options.limit,
    };
  }

  private toDto(e: CompendiumEntry): EntryDto {
    return {
      id: e.id,
      name: e.name,
      slug: e.slug,
      description: e.description,
      shortDescription: e.shortDescription,
      type: e.type,
      system: e.system,
      tags: e.tags,
      attributes: e.attributes,
      relations: e.relations,
      source: e.source,
      isOfficial: e.isOfficial,
      isHomebrew: e.isHomebrew,
      createdBy: e.createdBy,
      version: e.version,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    };
  }
}

@Injectable()
export class UpdateEntryUseCase {
  constructor(
    private readonly repo: IEntryRepository,
    private readonly cache: CompendiumCacheService,
  ) {}

  async execute(cmd: UpdateEntryCommand): Promise<EntryDto> {
    const entry = await this.repo.findById(cmd.entryId);
    if (!entry) throw new NotFoundException(`Entry "${cmd.entryId}" not found`);

    const isAdmin = cmd.requesterRoles.includes('admin');
    if (!entry.canBeEditedBy(cmd.requesterId, isAdmin)) {
      throw new ForbiddenException('You do not have permission to edit this entry');
    }

    entry.update(cmd.changes);
    await this.repo.update(entry);
    await this.cache.invalidateEntry(entry.id);
    await this.cache.invalidateSystem(entry.system);

    return this.toDto(entry);
  }

  private toDto(e: CompendiumEntry): EntryDto {
    return {
      id: e.id,
      name: e.name,
      slug: e.slug,
      description: e.description,
      shortDescription: e.shortDescription,
      type: e.type,
      system: e.system,
      tags: e.tags,
      attributes: e.attributes,
      relations: e.relations,
      source: e.source,
      isOfficial: e.isOfficial,
      isHomebrew: e.isHomebrew,
      createdBy: e.createdBy,
      version: e.version,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    };
  }
}

@Injectable()
export class DeleteEntryUseCase {
  constructor(
    private readonly repo: IEntryRepository,
    private readonly cache: CompendiumCacheService,
  ) {}

  async execute(cmd: DeleteEntryCommand): Promise<void> {
    const entry = await this.repo.findById(cmd.entryId);
    if (!entry) throw new NotFoundException(`Entry "${cmd.entryId}" not found`);

    const isAdmin = cmd.requesterRoles.includes('admin');
    if (!entry.canBeEditedBy(cmd.requesterId, isAdmin)) {
      throw new ForbiddenException('You do not have permission to delete this entry');
    }

    if (entry.isOfficial && !isAdmin) {
      throw new ForbiddenException('Official entries can only be deleted by admins');
    }

    await this.repo.delete(entry.id);
    await this.cache.invalidateEntry(entry.id);
    await this.cache.invalidateSystem(entry.system);
  }
}

@Injectable()
export class ImportBulkEntriesUseCase {
  constructor(
    private readonly repo: IEntryRepository,
    private readonly cache: CompendiumCacheService,
  ) {}

  async execute(cmd: ImportBulkCommand): Promise<{ imported: number; skipped: number; errors: string[] }> {
    const isAdmin = cmd.requesterRoles.includes('admin');
    if (!isAdmin) throw new ForbiddenException('Bulk import requires admin role');

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    const systems = new Set<GameSystem>();

    for (const entryData of cmd.entries) {
      try {
        const slug = CompendiumEntry.slugify(entryData.name);
        const existing = await this.repo.findBySlug(slug, entryData.system);

        if (existing && !cmd.overwrite) {
          skipped++;
          continue;
        }

        if (existing && cmd.overwrite) {
          existing.update({
            name: entryData.name,
            description: entryData.description,
            shortDescription: entryData.shortDescription,
            tags: entryData.tags,
            attributes: entryData.attributes,
          });
          await this.repo.update(existing);
          systems.add(entryData.system);
          imported++;
          continue;
        }

        const entry = CompendiumEntry.create({
          ...entryData,
          isOfficial: true,
          isHomebrew: false,
          createdBy: cmd.requesterId,
        });

        await this.repo.save(entry);
        systems.add(entryData.system);
        imported++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${entryData.name}: ${msg}`);
      }
    }

    // Invalidate all affected systems
    for (const system of systems) {
      await this.cache.invalidateSystem(system);
    }

    return { imported, skipped, errors };
  }
}

@Injectable()
export class GetSystemStatsUseCase {
  constructor(
    private readonly repo: IEntryRepository,
    private readonly cache: CompendiumCacheService,
  ) {}

  async execute(system: GameSystem): Promise<{
    system: GameSystem;
    total: number;
    byType: Record<string, number>;
  }> {
    const cacheKey = `stats:${system}`;
    const cached = await this.cache.get<{ system: GameSystem; total: number; byType: Record<string, number> }>(cacheKey);
    if (cached) return cached;

    const byType = await this.repo.countBySystem(system);
    const total = Object.values(byType).reduce((sum, count) => sum + count, 0);
    const result = { system, total, byType: byType as Record<string, number> };

    await this.cache.set(cacheKey, result, 600); // 10 min TTL
    return result;
  }
}
