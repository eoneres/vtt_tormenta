import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Entry } from '../../../domain/entry/entities/entry.entity';
import { EntryRepository } from '../../../domain/entry/repositories/entry.repository';
import { EntryDocument } from './schemas/entry.schema';
import { EntryId } from '../../../domain/entry/value-objects/entry-id.vo';

@Injectable()
export class MongoEntryRepository implements EntryRepository {
  constructor(@InjectModel(EntryDocument.name) private readonly entryModel: Model<EntryDocument>) {}

  private map(doc: EntryDocument): Entry {
    return new Entry(
      new EntryId(doc.entryId),
      doc.system as any,
      doc.type as any,
      doc.name,
      doc.description,
      doc.tags,
      {
        summary: doc.content.summary as string,
        details: doc.content.details as string,
        metadata: (doc.content.metadata as Record<string, unknown>) ?? undefined,
      },
      doc.createdAt,
      doc.updatedAt,
    );
  }

  async save(entry: Entry): Promise<Entry> {
    const created = await this.entryModel.findOneAndUpdate(
      { entryId: entry.id.value },
      {
        entryId: entry.id.value,
        system: entry.system,
        type: entry.type,
        name: entry.name,
        description: entry.description,
        tags: entry.tags,
        content: entry.content,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return this.map(created);
  }

  async findById(id: string): Promise<Entry | null> {
    const doc = await this.entryModel.findOne({ entryId: id }).exec();
    return doc ? this.map(doc) : null;
  }

  async list(params: { system?: string | undefined; type?: string | undefined; tags?: string[] | undefined; query?: string | undefined }): Promise<Entry[]> {
    const filter: Record<string, unknown> = {};
    if (params.system) filter.system = params.system;
    if (params.type) filter.type = params.type;
    if (params.tags?.length) filter.tags = { $all: params.tags };
    if (params.query) {
      filter.$text = { $search: params.query };
    }

    const docs = await this.entryModel.find(filter).lean().exec();
    return docs.map((doc) =>
      new Entry(
        new EntryId(doc.entryId),
        doc.system as any,
        doc.type as any,
        doc.name,
        doc.description,
        doc.tags,
        {
          summary: doc.content.summary as string,
          details: doc.content.details as string,
          metadata: (doc.content.metadata as Record<string, unknown>) ?? undefined,
        },
        doc.createdAt,
        doc.updatedAt,
      ),
    );
  }
}
