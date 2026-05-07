import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  CreateCampaignUseCase,
  UpdateCampaignUseCase,
  ArchiveCampaignUseCase,
  GetCampaignUseCase,
} from '../../src/application/commands/campaign.use-cases';
import { Campaign } from '../../src/domain/campaign/entities/campaign.entity';
import { CampaignStatus } from '@vtt/shared-types';

const mockRepo = () => ({
  findById: jest.fn(),
  findByOwner: jest.fn(),
  findPublic: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockPublisher = () => ({ publishCampaignCreated: jest.fn() });

describe('CreateCampaignUseCase', () => {
  it('creates and saves campaign, publishes event', async () => {
    const repo = mockRepo();
    const publisher = mockPublisher();
    const uc = new CreateCampaignUseCase(repo as never, publisher as never);

    const result = await uc.execute({ ownerId: 'u1', systemId: 'tormenta20', name: 'Test' });

    expect(repo.save).toHaveBeenCalledWith(expect.any(Campaign));
    expect(publisher.publishCampaignCreated).toHaveBeenCalledWith(result);
    expect(result.name).toBe('Test');
  });
});

describe('UpdateCampaignUseCase', () => {
  it('throws NotFoundException when campaign not found', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(null);
    const uc = new UpdateCampaignUseCase(repo as never);
    await expect(uc.execute({ campaignId: 'x', requesterId: 'u1', name: 'New' }))
      .rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when not owner', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(
      Campaign.create({ ownerId: 'u1', systemId: 'tormenta20', name: 'C' }),
    );
    const uc = new UpdateCampaignUseCase(repo as never);
    await expect(uc.execute({ campaignId: 'x', requesterId: 'u2', name: 'New' }))
      .rejects.toThrow(ForbiddenException);
  });

  it('updates and saves when owner', async () => {
    const repo = mockRepo();
    const campaign = Campaign.create({ ownerId: 'u1', systemId: 'tormenta20', name: 'Old' });
    repo.findById.mockResolvedValue(campaign);
    const uc = new UpdateCampaignUseCase(repo as never);
    const result = await uc.execute({ campaignId: campaign.id, requesterId: 'u1', name: 'New' });
    expect(result.name).toBe('New');
    expect(repo.save).toHaveBeenCalled();
  });
});

describe('ArchiveCampaignUseCase', () => {
  it('archives campaign', async () => {
    const repo = mockRepo();
    const campaign = Campaign.create({ ownerId: 'u1', systemId: 'tormenta20', name: 'C' });
    repo.findById.mockResolvedValue(campaign);
    const uc = new ArchiveCampaignUseCase(repo as never);
    await uc.execute(campaign.id, 'u1');
    expect(campaign.status).toBe(CampaignStatus.ARCHIVED);
    expect(repo.save).toHaveBeenCalled();
  });
});

describe('GetCampaignUseCase', () => {
  it('throws NotFoundException when not found', async () => {
    const repo = mockRepo();
    repo.findById.mockResolvedValue(null);
    const uc = new GetCampaignUseCase(repo as never);
    await expect(uc.execute('missing')).rejects.toThrow(NotFoundException);
  });

  it('returns campaign when found', async () => {
    const repo = mockRepo();
    const campaign = Campaign.create({ ownerId: 'u1', systemId: 'tormenta20', name: 'C' });
    repo.findById.mockResolvedValue(campaign);
    const uc = new GetCampaignUseCase(repo as never);
    const result = await uc.execute(campaign.id);
    expect(result).toBe(campaign);
  });
});
