import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from '../../domain/character/entities/character.entity';
import {
  T20CharacterSheet,
  type T20ClassEntry,
  type T20Attributes,
  type T20Condition,
} from '../../domain/character/entities/t20-character-sheet';
import { CharacterOrmEntity } from '../../infrastructure/persistence/typeorm/entities/character.orm-entity';
import type { EventEmitter2 } from '@nestjs/event-emitter';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateCharacterDto {
  campaignId: string;
  name: string;
  race: string;
  origin: string;
  classes: T20ClassEntry[];
  attributes: T20Attributes;
  playerName?: string;
}

export interface UpdateSheetDto {
  attributes?: Partial<T20Attributes>;
  tempAttributes?: Partial<T20Attributes>;
  skills?: Array<{ name: string; ranks: number; isTrained: boolean; miscBonus?: number }>;
  personalityTraits?: string;
  backstory?: string;
  notes?: string;
  religion?: string;
  alignment?: string;
}

export interface DamageHealDto {
  amount: number;
  source?: string;
}

export interface GainXPDto {
  amount: number;
  reason?: string;
}

export interface EquipItemDto {
  slot: string;
  itemId?: string;
  itemName: string;
  bonuses: Record<string, number>;
}

export interface ApplyConditionDto {
  name: string;
  source: string;
  durationRounds?: number;
  isPermanent?: boolean;
}

// ─── Use Case Service ─────────────────────────────────────────────────────────

@Injectable()
export class CharacterSheetUseCases {
  private readonly logger = new Logger(CharacterSheetUseCases.name);

  constructor(
    @InjectRepository(CharacterOrmEntity)
    private readonly repo: Repository<CharacterOrmEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ── Create ────────────────────────────────────────────────────────────────

  async createCharacter(userId: string, dto: CreateCharacterDto): Promise<CharacterOrmEntity> {
    const sheet = T20CharacterSheet.createFresh({
      characterName: dto.name,
      playerName: dto.playerName ?? '',
      race: dto.race,
      origin: dto.origin,
      classes: dto.classes,
      attributes: dto.attributes,
    });

    const entity = this.repo.create({
      userId,
      campaignId: dto.campaignId,
      name: dto.name,
      systemId: 'tormenta20',
      sheetData: sheet.toPlainObject(),
    });

    const saved = await this.repo.save(entity);
    this.logger.log(`Character created: ${saved.id} — ${dto.name} (user: ${userId})`);

    await this.eventEmitter.emitAsync('character.created', {
      characterId: saved.id,
      userId,
      campaignId: dto.campaignId,
      name: dto.name,
    });

    return saved;
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  async getCharacter(userId: string, characterId: string): Promise<CharacterOrmEntity> {
    const entity = await this.findAndAuthorize(userId, characterId);
    // Attach live derived stats
    const sheet = T20CharacterSheet.fromPlainObject(entity.sheetData as Record<string, unknown>);
    entity.sheetData = sheet.toPlainObject();
    return entity;
  }

  async listUserCharacters(userId: string): Promise<CharacterOrmEntity[]> {
    return this.repo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async listCampaignCharacters(campaignId: string): Promise<CharacterOrmEntity[]> {
    return this.repo.find({
      where: { campaignId },
      order: { name: 'ASC' },
    });
  }

  // ── Sheet update ──────────────────────────────────────────────────────────

  async updateSheet(
    userId: string,
    characterId: string,
    dto: UpdateSheetDto,
  ): Promise<CharacterOrmEntity> {
    const entity = await this.findAndAuthorize(userId, characterId);
    const sheet = T20CharacterSheet.fromPlainObject(entity.sheetData as Record<string, unknown>);

    if (dto.attributes) {
      for (const [attr, value] of Object.entries(dto.attributes)) {
        if (value !== undefined) {
          sheet.updateAttribute(attr as keyof T20Attributes, value);
        }
      }
    }
    if (dto.tempAttributes) {
      for (const [attr, bonus] of Object.entries(dto.tempAttributes)) {
        if (bonus !== undefined) {
          sheet.setTempAttribute(attr as keyof T20Attributes, bonus);
        }
      }
    }
    if (dto.skills) {
      for (const skillUpdate of dto.skills) {
        const skill = sheet.skills.find((s) => s.name === skillUpdate.name);
        if (skill) {
          skill.ranks = skillUpdate.ranks;
          skill.isTrained = skillUpdate.isTrained;
          skill.miscBonus = skillUpdate.miscBonus ?? 0;
        }
      }
    }
    if (dto.personalityTraits !== undefined) sheet.personalityTraits = dto.personalityTraits;
    if (dto.backstory !== undefined)         sheet.backstory = dto.backstory;
    if (dto.notes !== undefined)             sheet.notes = dto.notes;
    if (dto.religion !== undefined)          sheet.religion = dto.religion;
    if (dto.alignment !== undefined)         sheet.alignment = dto.alignment;

    entity.sheetData = sheet.toPlainObject();
    entity.updatedAt = new Date();
    return this.repo.save(entity);
  }

  // ── Combat ────────────────────────────────────────────────────────────────

  async applyDamage(
    characterId: string,
    dto: DamageHealDto,
  ): Promise<{ currentPV: number; maxPV: number; isDying: boolean }> {
    const entity = await this.repo.findOneBy({ id: characterId });
    if (!entity) throw new NotFoundException('Character not found');

    const sheet = T20CharacterSheet.fromPlainObject(entity.sheetData as Record<string, unknown>);
    sheet.takeDamage(dto.amount);

    const isDying = sheet.currentPV === 0;
    if (isDying) {
      sheet.applyCondition({ name: 'Inconsciente', source: dto.source ?? 'dano', isPermanent: false });
    }

    entity.sheetData = sheet.toPlainObject();
    await this.repo.save(entity);

    await this.eventEmitter.emitAsync('character.damaged', {
      characterId,
      amount: dto.amount,
      currentPV: sheet.currentPV,
      isDying,
    });

    return { currentPV: sheet.currentPV, maxPV: sheet.derivedMaxPV, isDying };
  }

  async applyHealing(
    characterId: string,
    dto: DamageHealDto,
  ): Promise<{ currentPV: number; maxPV: number }> {
    const entity = await this.repo.findOneBy({ id: characterId });
    if (!entity) throw new NotFoundException('Character not found');

    const sheet = T20CharacterSheet.fromPlainObject(entity.sheetData as Record<string, unknown>);
    sheet.heal(dto.amount);
    // Healing removes Inconsciente if above 0 PV
    if (sheet.currentPV > 0) sheet.removeCondition('Inconsciente');

    entity.sheetData = sheet.toPlainObject();
    await this.repo.save(entity);

    return { currentPV: sheet.currentPV, maxPV: sheet.derivedMaxPV };
  }

  async spendPM(
    characterId: string,
    amount: number,
  ): Promise<{ success: boolean; currentPM: number; maxPM: number }> {
    const entity = await this.repo.findOneBy({ id: characterId });
    if (!entity) throw new NotFoundException('Character not found');

    const sheet = T20CharacterSheet.fromPlainObject(entity.sheetData as Record<string, unknown>);
    const success = sheet.spendPM(amount);

    entity.sheetData = sheet.toPlainObject();
    await this.repo.save(entity);

    return { success, currentPM: sheet.currentPM, maxPM: sheet.derivedMaxPM };
  }

  // ── XP & Level-up ─────────────────────────────────────────────────────────

  async grantXP(
    characterId: string,
    dto: GainXPDto,
  ): Promise<{ totalXP: number; level: number; leveledUp: boolean; xpForNext: number | null }> {
    const entity = await this.repo.findOneBy({ id: characterId });
    if (!entity) throw new NotFoundException('Character not found');

    const sheet = T20CharacterSheet.fromPlainObject(entity.sheetData as Record<string, unknown>);
    const { leveledUp } = sheet.gainXP(dto.amount);

    entity.sheetData = sheet.toPlainObject();
    await this.repo.save(entity);

    if (leveledUp) {
      this.logger.log(`Character ${characterId} leveled up to ${sheet.totalLevel}!`);
      await this.eventEmitter.emitAsync('character.levelup', {
        characterId,
        newLevel: sheet.totalLevel,
        characterName: sheet.characterName,
      });
    }

    return {
      totalXP: sheet.xp,
      level: sheet.totalLevel,
      leveledUp,
      xpForNext: sheet.xpForNextLevel,
    };
  }

  // ── Conditions ────────────────────────────────────────────────────────────

  async applyCondition(
    characterId: string,
    dto: ApplyConditionDto,
  ): Promise<CharacterOrmEntity> {
    const entity = await this.repo.findOneBy({ id: characterId });
    if (!entity) throw new NotFoundException('Character not found');

    const sheet = T20CharacterSheet.fromPlainObject(entity.sheetData as Record<string, unknown>);

    const expiresAt = dto.durationRounds
      ? new Date(Date.now() + dto.durationRounds * 6000) // 1 round ≈ 6s
      : undefined;

    sheet.applyCondition({
      name: dto.name,
      source: dto.source,
      expiresAt,
      isPermanent: dto.isPermanent ?? false,
    });

    entity.sheetData = sheet.toPlainObject();
    return this.repo.save(entity);
  }

  async removeCondition(
    characterId: string,
    conditionName: string,
    source?: string,
  ): Promise<CharacterOrmEntity> {
    const entity = await this.repo.findOneBy({ id: characterId });
    if (!entity) throw new NotFoundException('Character not found');

    const sheet = T20CharacterSheet.fromPlainObject(entity.sheetData as Record<string, unknown>);
    sheet.removeCondition(conditionName, source);

    entity.sheetData = sheet.toPlainObject();
    return this.repo.save(entity);
  }

  // ── Equipment ─────────────────────────────────────────────────────────────

  async equipItem(
    userId: string,
    characterId: string,
    dto: EquipItemDto,
  ): Promise<CharacterOrmEntity> {
    const entity = await this.findAndAuthorize(userId, characterId);
    const sheet = T20CharacterSheet.fromPlainObject(entity.sheetData as Record<string, unknown>);

    sheet.equip(dto.slot as any, dto.itemId ?? '', dto.itemName, dto.bonuses);
    entity.sheetData = sheet.toPlainObject();
    return this.repo.save(entity);
  }

  async unequipItem(
    userId: string,
    characterId: string,
    slot: string,
  ): Promise<CharacterOrmEntity> {
    const entity = await this.findAndAuthorize(userId, characterId);
    const sheet = T20CharacterSheet.fromPlainObject(entity.sheetData as Record<string, unknown>);

    sheet.unequip(slot as any);
    entity.sheetData = sheet.toPlainObject();
    return this.repo.save(entity);
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private async findAndAuthorize(userId: string, characterId: string): Promise<CharacterOrmEntity> {
    const entity = await this.repo.findOneBy({ id: characterId });
    if (!entity) throw new NotFoundException('Character not found');
    if (entity.userId !== userId) throw new ForbiddenException('Not your character');
    return entity;
  }
}
