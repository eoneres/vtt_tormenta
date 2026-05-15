import { Injectable } from '@nestjs/common';
import type { T20CharacterSheet } from '../../domain/character/t20-character-sheet';
import { ICompendiumRepository } from '../../domain/entry/entry.repository';
import { ICharacterRepository } from '../../domain/character/character.repository';

/**
 * Integration Service para Compêndio ↔ Ficha
 *
 * Permite adicionar poderes, magias e itens da compêndio diretamente à ficha de personagem.
 * Gerencia validação de pré-requisitos, efeitos automáticos e recálculo de stats.
 */

export interface CompendiumToCharacterPayload {
  characterId: string;
  compendiumEntryId: string;
  type: 'power' | 'spell' | 'item' | 'condition';
}

export interface CharacterSheetUpdate {
  powers?: string[];
  spells?: { circle: number; name: string }[];
  equipment?: { slot: string; itemName: string }[];
  conditions?: string[];
  derived?: {
    defenseRecalc?: boolean;
    pmRecalc?: boolean;
  };
}

@Injectable()
export class CompendiumCharacterIntegrationService {
  constructor(
    private readonly compendiumRepo: ICompendiumRepository,
    private readonly characterRepo: ICharacterRepository,
  ) {}

  /**
   * Adicionar poder à ficha
   */
  async addPowerToCharacter(
    characterId: string,
    compendiumEntryId: string,
  ): Promise<T20CharacterSheet> {
    const [character, power] = await Promise.all([
      this.characterRepo.findById(characterId),
      this.compendiumRepo.findById(compendiumEntryId),
    ]);

    if (!character) throw new Error(`Character ${characterId} not found`);
    if (!power) throw new Error(`Compendium entry ${compendiumEntryId} not found`);

    // Validar tipo
    if (power.type !== 'PODER' && power.type !== 'power') {
      throw new Error(`Entry is not a power: ${power.type}`);
    }

    // Validar pré-requisitos (simplificado)
    // TODO: Implementar engine de validação de pré-requisitos
    const prerequisites = power.attributes.find((a) => a.key === 'prerequisite');
    if (prerequisites) {
      this.logger.log(`Pré-requisito: ${prerequisites.value}`);
      // Validação mais complexa seria feita aqui
    }

    // Adicionar poder à ficha
    const sheetData = character.sheetData as any;
    if (!sheetData.powers) sheetData.powers = [];
    sheetData.powers.push(power.name);

    // Recalcular stats se necessário (BAB, Defesa, etc)
    // TODO: Recalcular based on power effects

    await this.characterRepo.update(characterId, character);
    return character.sheetData;
  }

  /**
   * Adicionar magia à ficha
   */
  async addSpellToCharacter(characterId: string, compendiumEntryId: string): Promise<T20CharacterSheet> {
    const [character, spell] = await Promise.all([
      this.characterRepo.findById(characterId),
      this.compendiumRepo.findById(compendiumEntryId),
    ]);

    if (!character) throw new Error(`Character ${characterId} not found`);
    if (!spell) throw new Error(`Compendium entry ${compendiumEntryId} not found`);

    if (spell.type !== 'MAGIA' && spell.type !== 'spell') {
      throw new Error(`Entry is not a spell: ${spell.type}`);
    }

    // Extrair círculo da magia
    const circleAttr = spell.attributes.find((a) => a.key === 'circle');
    const circle = circleAttr ? parseInt(circleAttr.value as string, 10) : 0;

    const sheetData = character.sheetData as any;
    if (!sheetData.spells) sheetData.spells = [];

    // Adicionar magia ao círculo apropriado
    sheetData.spells.push({
      circle,
      name: spell.name,
      prepared: false, // Depende da classe
    });

    // Recalcular PM se necessário
    // TODO: Recalcular based on circle and class

    await this.characterRepo.update(characterId, character);
    return character.sheetData;
  }

  /**
   * Adicionar item à ficha
   */
  async addItemToCharacter(characterId: string, compendiumEntryId: string, slot?: string): Promise<T20CharacterSheet> {
    const [character, item] = await Promise.all([
      this.characterRepo.findById(characterId),
      this.compendiumRepo.findById(compendiumEntryId),
    ]);

    if (!character) throw new Error(`Character ${characterId} not found`);
    if (!item) throw new Error(`Compendium entry ${compendiumEntryId} not found`);

    if (item.type !== 'ITEM' && item.type !== 'item') {
      throw new Error(`Entry is not an item: ${item.type}`);
    }

    const sheetData = character.sheetData as any;
    if (!sheetData.equipment) sheetData.equipment = [];

    // Determinar slot (headgear, chest, hands, legs, feet, etc)
    const itemSlot = slot || this.inferItemSlot(item);

    // Adicionar item
    sheetData.equipment.push({
      slot: itemSlot,
      name: item.name,
      equipped: true,
    });

    // Recalcular Defesa se for armadura
    // Recalcular dano se for arma
    // TODO: Apply item effects

    await this.characterRepo.update(characterId, character);
    return character.sheetData;
  }

  /**
   * Aplicar condição à ficha
   */
  async addConditionToCharacter(characterId: string, compendiumEntryId: string): Promise<T20CharacterSheet> {
    const [character, condition] = await Promise.all([
      this.characterRepo.findById(characterId),
      this.compendiumRepo.findById(compendiumEntryId),
    ]);

    if (!character) throw new Error(`Character ${characterId} not found`);
    if (!condition) throw new Error(`Compendium entry ${compendiumEntryId} not found`);

    if (condition.type !== 'CONDICAO' && condition.type !== 'condition') {
      throw new Error(`Entry is not a condition: ${condition.type}`);
    }

    const sheetData = character.sheetData as any;
    if (!sheetData.conditions) sheetData.conditions = [];

    // Adicionar condição com duração
    sheetData.conditions.push({
      name: condition.name,
      appliedAt: new Date(),
      duration: condition.attributes.find((a) => a.key === 'duration')?.value || 'Indefinido',
    });

    // TODO: Aplicar efeitos (modificadores, immunidades, etc)

    await this.characterRepo.update(characterId, character);
    return character.sheetData;
  }

  /**
   * Remove uma adição da ficha
   */
  async removePowerFromCharacter(characterId: string, powerName: string): Promise<void> {
    const character = await this.characterRepo.findById(characterId);
    if (!character) throw new Error(`Character ${characterId} not found`);

    const sheetData = character.sheetData as any;
    if (sheetData.powers) {
      sheetData.powers = sheetData.powers.filter((p: string) => p !== powerName);
    }

    await this.characterRepo.update(characterId, character);
  }

  async removeSpellFromCharacter(characterId: string, spellName: string): Promise<void> {
    const character = await this.characterRepo.findById(characterId);
    if (!character) throw new Error(`Character ${characterId} not found`);

    const sheetData = character.sheetData as any;
    if (sheetData.spells) {
      sheetData.spells = sheetData.spells.filter((s: any) => s.name !== spellName);
    }

    await this.characterRepo.update(characterId, character);
  }

  async removeItemFromCharacter(characterId: string, itemName: string): Promise<void> {
    const character = await this.characterRepo.findById(characterId);
    if (!character) throw new Error(`Character ${characterId} not found`);

    const sheetData = character.sheetData as any;
    if (sheetData.equipment) {
      sheetData.equipment = sheetData.equipment.filter((i: any) => i.name !== itemName);
    }

    await this.characterRepo.update(characterId, character);
  }

  async removeConditionFromCharacter(characterId: string, conditionName: string): Promise<void> {
    const character = await this.characterRepo.findById(characterId);
    if (!character) throw new Error(`Character ${characterId} not found`);

    const sheetData = character.sheetData as any;
    if (sheetData.conditions) {
      sheetData.conditions = sheetData.conditions.filter((c: any) => c.name !== conditionName);
    }

    await this.characterRepo.update(characterId, character);
  }

  /**
   * Helpers privados
   */

  private inferItemSlot(item: any): string {
    const itemType = item.attributes.find((a: any) => a.key === 'type')?.value?.toLowerCase() || '';

    if (itemType.includes('armor') || itemType.includes('armadura')) return 'chest';
    if (itemType.includes('helmet') || itemType.includes('capacete')) return 'head';
    if (itemType.includes('boot') || itemType.includes('bota')) return 'feet';
    if (itemType.includes('glove') || itemType.includes('luva')) return 'hands';
    if (itemType.includes('ring') || itemType.includes('anel')) return 'ring';
    if (itemType.includes('cloak') || itemType.includes('manto')) return 'shoulders';
    if (itemType.includes('weapon') || itemType.includes('arma')) return 'weapon';
    if (itemType.includes('shield') || itemType.includes('escudo')) return 'offhand';

    return 'backpack';
  }

  private logger = {
    log: (msg: string) => console.log(`[CompendiumIntegration] ${msg}`),
    error: (msg: string, err: any) => console.error(`[CompendiumIntegration] ${msg}`, err),
  };
}
