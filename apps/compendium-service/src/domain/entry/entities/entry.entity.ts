import { EntryId } from '../value-objects/entry-id.vo';

export type EntrySystem = 'tormenta20' | 'dnd5e' | 'shadowrun';
export type EntryType = 'race' | 'class' | 'spell' | 'item' | 'monster' | 'power';

export interface EntryContent {
  summary: string;
  details: string;
  metadata?: Record<string, unknown>;
}

export class Entry {
  constructor(
    public readonly id: EntryId,
    public readonly system: EntrySystem,
    public readonly type: EntryType,
    public readonly name: string,
    public readonly description: string,
    public readonly tags: string[],
    public readonly content: EntryContent,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: {
    id: EntryId;
    system: EntrySystem;
    type: EntryType;
    name: string;
    description: string;
    tags?: string[] | undefined;
    content: EntryContent;
  }): Entry {
    const now = new Date();
    return new Entry(
      props.id,
      props.system,
      props.type,
      props.name.trim(),
      props.description.trim(),
      props.tags ?? [],
      props.content,
      now,
      now,
    );
  }

  update(props: {
    name?: string;
    description?: string;
    tags?: string[];
    content?: EntryContent;
  }): Entry {
    return new Entry(
      this.id,
      this.system,
      this.type,
      props.name ? props.name.trim() : this.name,
      props.description ? props.description.trim() : this.description,
      props.tags ?? this.tags,
      props.content ?? this.content,
      this.createdAt,
      new Date(),
    );
  }
}
