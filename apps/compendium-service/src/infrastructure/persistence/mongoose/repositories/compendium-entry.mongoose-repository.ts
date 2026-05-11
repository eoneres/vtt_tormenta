import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CompendiumEntry,
  EntryAttribute,
  EntryRelation,
  EntrySource,
  EntryType,
  GameSystem,
} from '../../../domain/entry/entry.entity';
import {
  IEntryRepository,
  EntrySearchFilters,
  EntrySearchOptions,
  EntrySearchResult,
} from '../../../domain/entry/entry.repository';
import { CompendiumEntryDocument } from '../schemas/compendium-entry.schema';

@Injectable()
export class MongooseEntryRepository implements IEntryRepository {
  constructor(
    @InjectModel(CompendiumEntryDocument.name)
    private readonly model: Model<CompendiumEntryDocument>,
  ) {}

  async findById(id: string): Promise<CompendiumEntry | null> {
    const doc = await this.model.findOne({ id }).lean().exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findBySlug(slug: string, system: GameSystem): Promise<CompendiumEntry | null> {
    const doc = await this.model.findOne({ slug, system }).lean().exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByIds(ids: string[]): Promise<CompendiumEntry[]> {
    const docs = await this.model.find({ id: { $in: ids } }).lean().exec();
    return docs.map(this.toDomain.bind(this));
  }

  async search(
    filters: EntrySearchFilters,
    options: EntrySearchOptions,
  ): Promise<EntrySearchResult> {
    const query = this.buildQuery(filters);

    const [docs, total] = await Promise.all([
      this.model
        .find(query)
        .sort(this.buildSort(options))
        .skip(options.skip)
        .limit(options.limit + 1) // +1 to check hasMore
        .lean()
        .exec(),
      this.model.countDocuments(query).exec(),
    ]);

    const hasMore = docs.length > options.limit;
    const entries = docs.slice(0, options.limit).map(this.toDomain.bind(this));

    return { entries, total, hasMore };
  }

  async save(entry: CompendiumEntry): Promise<void> {
    const doc = this.toDocument(entry);
    await this.model.create(doc);
  }

  async update(entry: CompendiumEntry): Promise<void> {
    const doc = this.toDocument(entry);
    await this.model.updateOne({ id: entry.id }, { $set: doc }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }

  async countBySystem(system: GameSystem): Promise<Record<EntryType, number>> {
    const result = await this.model
      .aggregate([
        { $match: { system } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ])
      .exec();

    const counts: Partial<Record<EntryType, number>> = {};
    for (const r of result) {
      counts[r._id as EntryType] = r.count as number;
    }
    return counts as Record<EntryType, number>;
  }

  // ─── Mapping ─────────────────────────────────────────────────────────────

  private buildQuery(filters: EntrySearchFilters): Record<string, unknown> {
    const q: Record<string, unknown> = {};

    if (filters.system) q['system'] = filters.system;
    if (filters.isOfficial !== undefined) q['isOfficial'] = filters.isOfficial;
    if (filters.isHomebrew !== undefined) q['isHomebrew'] = filters.isHomebrew;
    if ((filters as any).isPublic !== undefined) q['isPublic'] = (filters as any).isPublic;
    if (filters.createdBy) q['createdBy'] = filters.createdBy;

    if (filters.type) {
      q['type'] = Array.isArray(filters.type)
        ? { $in: filters.type }
        : filters.type;
    }

    if (filters.tags && filters.tags.length > 0) {
      q['tags'] = { $all: filters.tags.map((t) => t.toLowerCase()) };
    }

    if (filters.query && filters.query.trim()) {
      // Use MongoDB full-text search
      q['$text'] = { $search: filters.query.trim() };
    }

    return q;
  }

  private buildSort(options: EntrySearchOptions): Record<string, 1 | -1> {
    const dir: 1 | -1 = options.sortOrder === 'desc' ? -1 : 1;
    const field = options.sortBy ?? 'name';
    return { [field]: dir };
  }

  private toDomain(doc: Record<string, unknown>): CompendiumEntry {
    return CompendiumEntry.reconstitute({
      id: doc['id'] as string,
      name: doc['name'] as string,
      slug: doc['slug'] as string,
      description: doc['description'] as string,
      shortDescription: doc['shortDescription'] as string | undefined,
      type: doc['type'] as EntryType,
      system: doc['system'] as GameSystem,
      tags: (doc['tags'] as string[]) ?? [],
      attributes: (doc['attributes'] as EntryAttribute[]) ?? [],
      relations: (doc['relations'] as EntryRelation[]) ?? [],
      source: doc['source'] as EntrySource | undefined,
      isOfficial: doc['isOfficial'] as boolean,
      isHomebrew: doc['isHomebrew'] as boolean,
      isPublic: doc['isPublic'] as boolean,
      createdBy: doc['createdBy'] as string | undefined,
      version: doc['version'] as number,
      searchVector: doc['searchVector'] as string,
      createdAt: doc['createdAt'] as Date,
      updatedAt: doc['updatedAt'] as Date,
    });
  }

  private toDocument(entry: CompendiumEntry): Record<string, unknown> {
    return {
      id: entry.id,
      name: entry.name,
      slug: entry.slug,
      description: entry.description,
      shortDescription: entry.shortDescription,
      type: entry.type,
      system: entry.system,
      tags: entry.tags,
      attributes: entry.attributes,
      relations: entry.relations,
      source: entry.source,
      isOfficial: entry.isOfficial,
      isHomebrew: entry.isHomebrew,
      isPublic: entry.isPublic,
      createdBy: entry.createdBy,
      version: entry.version,
      searchVector: entry.searchVector,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }
}
