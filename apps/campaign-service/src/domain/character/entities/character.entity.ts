import { generateId } from '@vtt/shared-utils';

interface CharacterProps {
  id: string;
  userId: string;
  campaignId: string;
  systemId: string;
  name: string;
  sheetData: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export class Character {
  readonly id: string;
  readonly userId: string;
  readonly campaignId: string;
  readonly systemId: string;
  name: string;
  sheetData: Record<string, unknown>;
  readonly createdAt: Date;
  updatedAt: Date;

  private constructor(props: CharacterProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.campaignId = props.campaignId;
    this.systemId = props.systemId;
    this.name = props.name;
    this.sheetData = props.sheetData;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: {
    userId: string;
    campaignId: string;
    systemId: string;
    name: string;
    sheetData?: Record<string, unknown>;
  }): Character {
    const now = new Date();
    return new Character({
      id: generateId(),
      userId: props.userId,
      campaignId: props.campaignId,
      systemId: props.systemId,
      name: props.name.trim(),
      sheetData: props.sheetData ?? {},
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: CharacterProps): Character {
    return new Character(props);
  }

  updateSheet(data: Record<string, unknown>): void {
    this.sheetData = { ...this.sheetData, ...data };
    this.updatedAt = new Date();
  }

  rename(name: string): void {
    this.name = name.trim();
    this.updatedAt = new Date();
  }

  isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }
}
