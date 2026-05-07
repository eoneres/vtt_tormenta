import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Campaign } from '../../domain/campaign/entities/campaign.entity';
import { ICampaignRepository, CAMPAIGN_REPOSITORY } from '../../domain/campaign/repositories/campaign.repository';
import { CampaignEventPublisher } from '../../infrastructure/messaging/campaign-event.publisher';
import type { CampaignSettings, PaginationQuery } from '@vtt/shared-types';

// ─── Create ──────────────────────────────────────────────────────────────────

export interface CreateCampaignCommand {
  ownerId: string;
  systemId: string;
  name: string;
  description?: string;
  settings?: Partial<CampaignSettings>;
}

@Injectable()
export class CreateCampaignUseCase {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY) private readonly repo: ICampaignRepository,
    private readonly publisher: CampaignEventPublisher,
  ) {}

  async execute(cmd: CreateCampaignCommand): Promise<Campaign> {
    const campaign = Campaign.create(cmd);
    await this.repo.save(campaign);
    await this.publisher.publishCampaignCreated(campaign);
    return campaign;
  }
}

// ─── Update ──────────────────────────────────────────────────────────────────

export interface UpdateCampaignCommand {
  campaignId: string;
  requesterId: string;
  name?: string;
  description?: string;
  settings?: Partial<CampaignSettings>;
}

@Injectable()
export class UpdateCampaignUseCase {
  constructor(@Inject(CAMPAIGN_REPOSITORY) private readonly repo: ICampaignRepository) {}

  async execute(cmd: UpdateCampaignCommand): Promise<Campaign> {
    const campaign = await this.repo.findById(cmd.campaignId);
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (!campaign.isOwnedBy(cmd.requesterId)) throw new ForbiddenException('Not campaign owner');

    campaign.update({
      ...(cmd.name !== undefined && { name: cmd.name }),
      ...(cmd.description !== undefined && { description: cmd.description }),
      ...(cmd.settings !== undefined && { settings: cmd.settings }),
    });
    await this.repo.save(campaign);
    return campaign;
  }
}

// ─── Archive ─────────────────────────────────────────────────────────────────

@Injectable()
export class ArchiveCampaignUseCase {
  constructor(@Inject(CAMPAIGN_REPOSITORY) private readonly repo: ICampaignRepository) {}

  async execute(campaignId: string, requesterId: string): Promise<void> {
    const campaign = await this.repo.findById(campaignId);
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (!campaign.isOwnedBy(requesterId)) throw new ForbiddenException('Not campaign owner');
    campaign.archive();
    await this.repo.save(campaign);
  }
}

// ─── Queries ─────────────────────────────────────────────────────────────────

@Injectable()
export class GetCampaignUseCase {
  constructor(@Inject(CAMPAIGN_REPOSITORY) private readonly repo: ICampaignRepository) {}

  async execute(campaignId: string): Promise<Campaign> {
    const campaign = await this.repo.findById(campaignId);
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }
}

@Injectable()
export class ListMyCampaignsUseCase {
  constructor(@Inject(CAMPAIGN_REPOSITORY) private readonly repo: ICampaignRepository) {}

  execute(ownerId: string, query: PaginationQuery) {
    return this.repo.findByOwner(ownerId, query);
  }
}
