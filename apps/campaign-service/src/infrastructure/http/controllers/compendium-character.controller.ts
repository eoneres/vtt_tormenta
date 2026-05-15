import { Controller, Post, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CompendiumCharacterIntegrationService } from '../integration/compendium-character.integration';

/**
 * API endpoints para integração Compêndio ↔ Ficha
 * Permite drag-and-drop de poderes, magias e itens da compêndio para a ficha
 */

@Controller('v1/characters')
export class CompendiumCharacterController {
  constructor(private readonly integrationService: CompendiumCharacterIntegrationService) {}

  /**
   * POST /v1/characters/:characterId/powers/:powerId
   * Adiciona um poder à ficha de personagem
   */
  @Post(':characterId/powers/:powerId')
  @HttpCode(HttpStatus.OK)
  async addPower(
    @Param('characterId') characterId: string,
    @Param('powerId') compendiumEntryId: string,
  ) {
    const result = await this.integrationService.addPowerToCharacter(characterId, compendiumEntryId);
    return {
      success: true,
      message: 'Poder adicionado à ficha',
      data: result,
    };
  }

  /**
   * DELETE /v1/characters/:characterId/powers/:powerName
   * Remove um poder da ficha
   */
  @Delete(':characterId/powers/:powerName')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removePower(@Param('characterId') characterId: string, @Param('powerName') powerName: string) {
    await this.integrationService.removePowerFromCharacter(characterId, powerName);
  }

  /**
   * POST /v1/characters/:characterId/spells/:spellId
   * Adiciona uma magia à ficha de personagem
   */
  @Post(':characterId/spells/:spellId')
  @HttpCode(HttpStatus.OK)
  async addSpell(
    @Param('characterId') characterId: string,
    @Param('spellId') compendiumEntryId: string,
  ) {
    const result = await this.integrationService.addSpellToCharacter(characterId, compendiumEntryId);
    return {
      success: true,
      message: 'Magia adicionada à ficha',
      data: result,
    };
  }

  /**
   * DELETE /v1/characters/:characterId/spells/:spellName
   * Remove uma magia da ficha
   */
  @Delete(':characterId/spells/:spellName')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeSpell(@Param('characterId') characterId: string, @Param('spellName') spellName: string) {
    await this.integrationService.removeSpellFromCharacter(characterId, spellName);
  }

  /**
   * POST /v1/characters/:characterId/items/:itemId
   * Adiciona um item à ficha de personagem
   */
  @Post(':characterId/items/:itemId')
  @HttpCode(HttpStatus.OK)
  async addItem(
    @Param('characterId') characterId: string,
    @Param('itemId') compendiumEntryId: string,
    @Body() body?: { slot?: string },
  ) {
    const result = await this.integrationService.addItemToCharacter(
      characterId,
      compendiumEntryId,
      body?.slot,
    );
    return {
      success: true,
      message: 'Item adicionado à ficha',
      data: result,
    };
  }

  /**
   * DELETE /v1/characters/:characterId/items/:itemName
   * Remove um item da ficha
   */
  @Delete(':characterId/items/:itemName')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(@Param('characterId') characterId: string, @Param('itemName') itemName: string) {
    await this.integrationService.removeItemFromCharacter(characterId, itemName);
  }

  /**
   * POST /v1/characters/:characterId/conditions/:conditionId
   * Aplica uma condição à ficha de personagem
   */
  @Post(':characterId/conditions/:conditionId')
  @HttpCode(HttpStatus.OK)
  async addCondition(
    @Param('characterId') characterId: string,
    @Param('conditionId') compendiumEntryId: string,
  ) {
    const result = await this.integrationService.addConditionToCharacter(characterId, compendiumEntryId);
    return {
      success: true,
      message: 'Condição aplicada à ficha',
      data: result,
    };
  }

  /**
   * DELETE /v1/characters/:characterId/conditions/:conditionName
   * Remove uma condição da ficha
   */
  @Delete(':characterId/conditions/:conditionName')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCondition(
    @Param('characterId') characterId: string,
    @Param('conditionName') conditionName: string,
  ) {
    await this.integrationService.removeConditionFromCharacter(characterId, conditionName);
  }
}
