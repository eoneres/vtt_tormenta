import { generateId } from '@vtt/shared-utils';
import type { CampaignSettings } from '@vtt/shared-types';
import { CampaignStatus } from '@vtt/shared-types';

interface CampaignProps {
  id: string;
  ownerId: string;
  systemId: string;
  name: string;
  description: string;
  status: CampaignStatus;
  settings: CampaignSettings;
  createdAt: Date;
  updatedAt: Date;
}

export class Campaign {
  readonly id: string;
  readonly ownerId: string;
  readonly systemId: string;
  name: string;
  description: string;
  status: CampaignStatus;
  settings: CampaignSettings;
  readonly createdAt: Date;
  updatedAt: Date;

  private constructor(props: CampaignProps) {
    this.id = props.id;
    this.ownerId = props.ownerId;
    this.systemId = props.systemId;
    this.name = props.name;
    this.description = props.description;
    this.status = props.status;
    this.settings = props.settings;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: {
    ownerId: string;
    systemId: string;
    name: string;
    description?: string;
    settings?: Partial<CampaignSettings>;
  }): Campaign {
    const now = new Date();
    return new Campaign({
      id: generateId(),
      ownerId: props.ownerId,
      systemId: props.systemId,
      name: props.name.trim(),
      description: props.description?.trim() ?? '',
      status: CampaignStatus.ACTIVE,
      settings: {
        maxPlayers: props.settings?.maxPlayers ?? 6,
        isPublic: props.settings?.isPublic ?? false,
        allowSpectators: props.settings?.allowSpectators ?? true,
        xpSystem: props.settings?.xpSystem ?? 'milestone',
      },
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: CampaignProps): Campaign {
    return new Campaign(props);
  }

  update(props: { name?: string; description?: string; settings?: Partial<CampaignSettings> }): void {
    if (props.name !== undefined) this.name = props.name.trim();
    if (props.description !== undefined) this.description = props.description.trim();
    if (props.settings !== undefined) this.settings = { ...this.settings, ...props.settings };
    this.updatedAt = new Date();
  }

  archive(): void {
    if (this.status === CampaignStatus.ARCHIVED) return;
    this.status = CampaignStatus.ARCHIVED;
    this.updatedAt = new Date();
  }

  isOwnedBy(userId: string): boolean {
    return this.ownerId === userId;
  }
}
