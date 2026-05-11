import { generateId } from '@vtt/shared-utils';

// ─── Value Objects ─────────────────────────────────────────────────────────────

export enum EntryType {
  // Tormenta20
  RACE = 'race',
  CLASS = 'class',
  ORIGIN = 'origin',
  POWER = 'power',
  SPELL = 'spell',
  RITUAL = 'ritual',
  MONSTER = 'monster',
  ITEM = 'item',
  EQUIPMENT = 'equipment',
  CONDITION = 'condition',
  DIVINITY = 'divinity',
  TOTEM = 'totem',
  // D&D 5e
  BACKGROUND = 'background',
  FEAT = 'feat',
  SUBCLASS = 'subclass',
  // Shadowrun
  QUALITY = 'quality',
  CRITTER = 'critter',
  PROGRAM = 'program',
  AUGMENTATION = 'augmentation',
}

export type GameSystem = 'tormenta20' | 'dnd5e' | 'shadowrun' | 'custom';

export interface EntryAttribute {
  key: string;
  value: string | number | boolean | string[];
  label?: string;
}

export interface EntryRelation {
  type: 'requires' | 'enhances' | 'conflicts' | 'replaces';
  targetId: string;
  targetName: string;
}

export interface EntrySource {
  book: string;
  page?: number;
  url?: string;
}

// ─── Domain Entity ─────────────────────────────────────────────────────────────

export interface EntryProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  type: EntryType;
  system: GameSystem;
  tags: string[];
  attributes: EntryAttribute[];
  relations: EntryRelation[];
  source?: EntrySource;
  isOfficial: boolean;
  isHomebrew: boolean;
  isPublic: boolean;
  createdBy?: string;
  version: number;
  searchVector?: string; // Pre-computed for full-text search
  createdAt: Date;
  updatedAt: Date;
}

export type CreateEntryProps = Omit<
  EntryProps,
  'id' | 'version' | 'searchVector' | 'createdAt' | 'updatedAt'
>;

export type UpdateEntryProps = Partial<
  Pick<
    EntryProps,
    | 'name'
    | 'description'
    | 'shortDescription'
    | 'tags'
    | 'attributes'
    | 'relations'
    | 'isPublic'
  >
>;

/**
 * CompendiumEntry — the core Aggregate Root for the Compendium bounded context.
 *
 * Invariants:
 * - Official entries cannot be deleted (only deprecated)
 * - Homebrew entries belong to exactly one creator
 * - searchVector must be kept in sync when name/description changes
 */
export class CompendiumEntry {
  readonly id: string;
  readonly system: GameSystem;
  readonly type: EntryType;
  readonly isOfficial: boolean;
  readonly isHomebrew: boolean;
  readonly createdBy?: string;
  readonly createdAt: Date;

  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  tags: string[];
  attributes: EntryAttribute[];
  relations: EntryRelation[];
  source?: EntrySource;
  isPublic: boolean;
  version: number;
  searchVector: string;
  updatedAt: Date;

  private constructor(props: EntryProps) {
    this.id = props.id;
    this.name = props.name;
    this.slug = props.slug;
    this.description = props.description;
    this.shortDescription = props.shortDescription;
    this.type = props.type;
    this.system = props.system;
    this.tags = props.tags;
    this.attributes = props.attributes;
    this.relations = props.relations;
    this.source = props.source;
    this.isOfficial = props.isOfficial;
    this.isHomebrew = props.isHomebrew;
    this.isPublic = props.isPublic;
    this.createdBy = props.createdBy;
    this.version = props.version;
    this.searchVector = props.searchVector ?? this.buildSearchVector();
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  // ─── Factory ──────────────────────────────────────────────────────────────

  static create(props: CreateEntryProps): CompendiumEntry {
    const now = new Date();
    const entry = new CompendiumEntry({
      ...props,
      id: generateId(),
      slug: CompendiumEntry.slugify(props.name),
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
    entry.searchVector = entry.buildSearchVector();
    return entry;
  }

  static reconstitute(props: EntryProps): CompendiumEntry {
    return new CompendiumEntry(props);
  }

  // ─── Commands ─────────────────────────────────────────────────────────────

  update(props: UpdateEntryProps): void {
    if (props.name !== undefined) {
      this.name = props.name;
      this.slug = CompendiumEntry.slugify(props.name);
    }
    if (props.description !== undefined) this.description = props.description;
    if (props.shortDescription !== undefined) this.shortDescription = props.shortDescription;
    if (props.tags !== undefined) this.tags = props.tags;
    if (props.attributes !== undefined) this.attributes = props.attributes;
    if (props.relations !== undefined) this.relations = props.relations;
    if (props.isPublic !== undefined) this.isPublic = props.isPublic;

    this.version += 1;
    this.updatedAt = new Date();
    this.searchVector = this.buildSearchVector();
  }

  addTag(tag: string): void {
    const normalized = tag.toLowerCase().trim();
    if (!this.tags.includes(normalized)) {
      this.tags = [...this.tags, normalized];
      this.updatedAt = new Date();
    }
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter((t) => t !== tag.toLowerCase().trim());
    this.updatedAt = new Date();
  }

  setAttribute(key: string, value: EntryAttribute['value'], label?: string): void {
    const idx = this.attributes.findIndex((a) => a.key === key);
    if (idx >= 0) {
      this.attributes[idx] = { key, value, label };
    } else {
      this.attributes = [...this.attributes, { key, value, label }];
    }
    this.updatedAt = new Date();
  }

  // ─── Queries ──────────────────────────────────────────────────────────────

  getAttribute(key: string): EntryAttribute | undefined {
    return this.attributes.find((a) => a.key === key);
  }

  hasTag(tag: string): boolean {
    return this.tags.includes(tag.toLowerCase().trim());
  }

  canBeEditedBy(userId: string, isAdmin: boolean): boolean {
    if (isAdmin) return true;
    if (this.isOfficial) return false;
    return this.createdBy === userId;
  }

  toPlainObject(): EntryProps {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      shortDescription: this.shortDescription,
      type: this.type,
      system: this.system,
      tags: this.tags,
      attributes: this.attributes,
      relations: this.relations,
      source: this.source,
      isOfficial: this.isOfficial,
      isHomebrew: this.isHomebrew,
      isPublic: this.isPublic,
      createdBy: this.createdBy,
      version: this.version,
      searchVector: this.searchVector,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // ─── Private ─────────────────────────────────────────────────────────────

  private buildSearchVector(): string {
    const parts = [
      this.name,
      this.shortDescription ?? '',
      this.tags.join(' '),
      this.attributes.map((a) => `${a.label ?? a.key} ${a.value}`).join(' '),
    ];
    return parts.join(' ').toLowerCase().trim();
  }

  static slugify(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
