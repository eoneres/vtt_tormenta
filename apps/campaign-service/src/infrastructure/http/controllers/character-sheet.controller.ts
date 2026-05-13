import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CharacterSheetUseCases } from '../../application/character-sheet/character-sheet.use-cases';
import type {
  CreateCharacterDto,
  UpdateSheetDto,
  DamageHealDto,
  GainXPDto,
  EquipItemDto,
  ApplyConditionDto,
} from '../../application/character-sheet/character-sheet.use-cases';

interface AuthenticatedRequest {
  user: { id: string; email: string };
}

@ApiTags('Character Sheets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/characters')
export class CharacterSheetController {
  constructor(private readonly useCases: CharacterSheetUseCases) {}

  // ─── Create ───────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create a new T20 character with automated sheet' })
  @ApiResponse({ status: 201, description: 'Character created' })
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateCharacterDto,
  ) {
    return this.useCases.createCharacter(req.user.id, dto);
  }

  // ─── List ─────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List all characters for the current user' })
  async listMyCharacters(@Request() req: AuthenticatedRequest) {
    return this.useCases.listUserCharacters(req.user.id);
  }

  @Get('campaign/:campaignId')
  @ApiOperation({ summary: 'List all characters in a campaign' })
  async listCampaignCharacters(
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
  ) {
    return this.useCases.listCampaignCharacters(campaignId);
  }

  // ─── Get ──────────────────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get character sheet with live derived stats' })
  async getCharacter(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.useCases.getCharacter(req.user.id, id);
  }

  // ─── Update sheet ─────────────────────────────────────────────────────────

  @Patch(':id/sheet')
  @ApiOperation({ summary: 'Update character sheet (attributes, skills, backstory)' })
  async updateSheet(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSheetDto,
  ) {
    return this.useCases.updateSheet(req.user.id, id, dto);
  }

  // ─── Combat ───────────────────────────────────────────────────────────────

  @Post(':id/damage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply damage to a character (GM or automated)' })
  @ApiResponse({ status: 200, description: 'Damage applied, returns current PV' })
  async damage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DamageHealDto,
  ) {
    return this.useCases.applyDamage(id, dto);
  }

  @Post(':id/heal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Heal a character' })
  async heal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DamageHealDto,
  ) {
    return this.useCases.applyHealing(id, dto);
  }

  @Post(':id/spend-pm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Spend PM (for spell-casting automation)' })
  async spendPM(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { amount: number },
  ) {
    return this.useCases.spendPM(id, body.amount);
  }

  // ─── XP ───────────────────────────────────────────────────────────────────

  @Post(':id/xp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Grant XP to a character' })
  async grantXP(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: GainXPDto,
  ) {
    return this.useCases.grantXP(id, dto);
  }

  // ─── Conditions ───────────────────────────────────────────────────────────

  @Post(':id/conditions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply a condition to a character' })
  async applyCondition(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApplyConditionDto,
  ) {
    return this.useCases.applyCondition(id, dto);
  }

  @Delete(':id/conditions/:conditionName')
  @ApiOperation({ summary: 'Remove a condition from a character' })
  async removeCondition(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('conditionName') conditionName: string,
  ) {
    return this.useCases.removeCondition(id, conditionName);
  }

  // ─── Equipment ────────────────────────────────────────────────────────────

  @Post(':id/equipment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Equip an item in a slot' })
  async equipItem(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EquipItemDto,
  ) {
    return this.useCases.equipItem(req.user.id, id, dto);
  }

  @Delete(':id/equipment/:slot')
  @ApiOperation({ summary: 'Unequip an item from a slot' })
  async unequipItem(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('slot') slot: string,
  ) {
    return this.useCases.unequipItem(req.user.id, id, slot);
  }
}
