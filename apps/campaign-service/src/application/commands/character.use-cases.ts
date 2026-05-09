import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Character } from '../../domain/character/entities/character.entity';
import { ICharacterRepository, CHARACTER_REPOSITORY } from '../../domain/character/repositories/character.repository';
import { ICampaignRepository, CAMPAIGN_REPOSITORY } from '../../domain/campaign/repositories/campaign.repository';
import type { PaginationQuery } from '@vtt/shared-types';

export interface CreateCharacterCommand {
  userId: string;
  campaignId: string;
  name: string;
  sheetData?: Record<string, unknown>;
}

@Injectable()
export class CreateCharacterUseCase {
  constructor(
    @Inject(CHARACTER_REPOSITORY) private readonly charRepo: ICharacterRepository,
    @Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepo: ICampaignRepository,
  ) {}

  async execute(cmd: CreateCharacterCommand): Promise<Character> {
    const campaign = await this.campaignRepo.findById(cmd.campaignId);
    if (!campaign) throw new NotFoundException('Campaign not found');

    const character = Character.create({
      userId: cmd.userId,
      campaignId: cmd.campaignId,
      systemId: campaign.systemId,
      name: cmd.name,
      sheetData: cmd.sheetData,
    } as any);

    await this.charRepo.save(character);
    return character;
  }
}

export interface UpdateSheetCommand {
  characterId: string;
  requesterId: string;
  sheetData: Record<string, unknown>;
}

@Injectable()
export class UpdateCharacterSheetUseCase {
  constructor(@Inject(CHARACTER_REPOSITORY) private readonly repo: ICharacterRepository) {}

  async execute(cmd: UpdateSheetCommand): Promise<Character> {
    const character = await this.repo.findById(cmd.characterId);
    if (!character) throw new NotFoundException('Character not found');
    if (!character.isOwnedBy(cmd.requesterId)) throw new ForbiddenException('Not character owner');
    character.updateSheet(cmd.sheetData);
    await this.repo.save(character);
    return character;
  }
}

@Injectable()
export class GetCharacterUseCase {
  constructor(@Inject(CHARACTER_REPOSITORY) private readonly repo: ICharacterRepository) {}

  async execute(characterId: string): Promise<Character> {
    const character = await this.repo.findById(characterId);
    if (!character) throw new NotFoundException('Character not found');
    return character;
  }
}

@Injectable()
export class ListCampaignCharactersUseCase {
  constructor(@Inject(CHARACTER_REPOSITORY) private readonly repo: ICharacterRepository) {}

  execute(campaignId: string, query: PaginationQuery) {
    return this.repo.findByCampaign(campaignId, query);
  }
}
