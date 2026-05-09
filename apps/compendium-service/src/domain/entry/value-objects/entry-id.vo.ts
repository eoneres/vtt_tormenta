import { randomUUID } from 'crypto';

export class EntryId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('EntryId must be a non-empty string');
    }
  }

  static create(): EntryId {
    return new EntryId(`entry_${randomUUID()}`);
  }

  toString(): string {
    return this.value;
  }
}
