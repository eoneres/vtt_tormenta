import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsObject,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CreateAutomationUseCase,
  GetAutomationUseCase,
  ListTemplatesUseCase,
  ToggleAutomationUseCase,
  DeleteAutomationUseCase,
  FireAutomationsByTriggerUseCase,
  AutomationRepository,
} from '../../../application/automation/automation.use-cases';
import { AutomationExecutor } from '../../../domain/automation/entities/automation-executor';
import type { TriggerType, AutomationEventContext } from '../../../domain/automation/dsl/automation.types';
import { T20_AUTOMATION_TEMPLATES } from '../../../domain/automation/dsl/tormenta20.templates';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

class TriggerDefinitionDto {
  @IsString() type!: TriggerType;
  @IsString() @IsOptional() tokenId?: string;
  @IsInt() @IsOptional() hpThreshold?: number;
  @IsString() @IsOptional() conditionName?: string;
  @IsString() @IsOptional() abilityId?: string;
}

class CreateAutomationDto {
  @IsString() @MaxLength(100) name!: string;
  @IsString() @IsOptional() @MaxLength(500) description?: string;

  @IsIn(['tormenta20', 'dnd5e', 'shadowrun', 'custom'])
  system!: 'tormenta20' | 'dnd5e' | 'shadowrun' | 'custom';

  @IsIn(['global', 'campaign', 'character'])
  scope!: 'global' | 'campaign' | 'character';

  @IsBoolean() @IsOptional() isTemplate?: boolean;

  @ValidateNested() @Type(() => TriggerDefinitionDto)
  trigger!: TriggerDefinitionDto;

  @IsObject() @IsOptional() condition?: Record<string, unknown>;

  @IsArray()
  actions!: Record<string, unknown>[];

  @IsInt() @Min(1) @Max(10) @IsOptional()
  maxFiresPerRound?: number;

  @IsArray() @IsString({ each: true }) @IsOptional()
  tags?: string[];
}

class FireTriggerDto {
  @IsString() triggerType!: TriggerType;
  @IsIn(['tormenta20', 'dnd5e', 'shadowrun', 'custom']) system!: string;
  @IsObject() context!: Omit<AutomationEventContext, 'triggerType'>;
}

// ─── Controller ───────────────────────────────────────────────────────────────

@ApiTags('automations')
@ApiBearerAuth()
@Controller('v1/automations')
export class AutomationsController {
  constructor(
    private readonly createAutomation: CreateAutomationUseCase,
    private readonly getAutomation: GetAutomationUseCase,
    private readonly listTemplates: ListTemplatesUseCase,
    private readonly toggleAutomation: ToggleAutomationUseCase,
    private readonly deleteAutomation: DeleteAutomationUseCase,
    private readonly fireTrigger: FireAutomationsByTriggerUseCase,
    private readonly repo: AutomationRepository,
  ) {}

  // ─── Templates ─────────────────────────────────────────────────────────────

  @Get('templates')
  @ApiOperation({ summary: 'List built-in automation templates for a game system' })
  @ApiQuery({ name: 'system', enum: ['tormenta20', 'dnd5e', 'shadowrun', 'custom'] })
  async templates(
    @Query('system') system: string = 'tormenta20',
    @Headers('x-user-id') userId: string = 'anonymous',
  ) {
    return this.listTemplates.execute(system as any);
  }

  @Get('templates/builtin')
  @ApiOperation({ summary: 'Get the built-in Tormenta20 automation templates (not yet imported)' })
  builtinTemplates() {
    return T20_AUTOMATION_TEMPLATES.map((t, idx) => ({
      index: idx,
      name: t.name,
      description: t.description,
      system: t.system,
      triggerType: t.trigger.type,
      actionCount: t.actions.length,
      tags: t.tags,
    }));
  }

  @Post('templates/import-builtin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Import built-in Tormenta20 templates as ready-to-use automations' })
  async importBuiltin(@Headers('x-user-id') userId: string = 'system') {
    const results = [];
    for (const template of T20_AUTOMATION_TEMPLATES) {
      try {
        const automation = await this.createAutomation.execute(
          {
            ...template,
            isTemplate: true,
            createdBy: userId,
          } as any,
          userId,
        );
        results.push({ name: template.name, id: automation.id, success: true });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        results.push({ name: template.name, success: false, error: msg });
      }
    }
    return { imported: results.filter((r) => r.success).length, results };
  }

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new automation rule' })
  @ApiResponse({ status: 201, description: 'Automation created' })
  async create(
    @Body() dto: CreateAutomationDto,
    @Headers('x-user-id') userId: string = 'anonymous',
  ) {
    return this.createAutomation.execute(
      {
        name: dto.name,
        description: dto.description,
        system: dto.system,
        scope: dto.scope,
        isTemplate: dto.isTemplate ?? false,
        trigger: dto.trigger as any,
        condition: dto.condition as any,
        actions: dto.actions as any,
        maxFiresPerRound: dto.maxFiresPerRound,
        tags: dto.tags ?? [],
        createdBy: userId,
      },
      userId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an automation by ID' })
  @ApiParam({ name: 'id', description: 'Automation ID' })
  async findOne(@Param('id') id: string) {
    return this.getAutomation.execute(id);
  }

  @Get()
  @ApiOperation({ summary: 'List automations created by the current user' })
  async listMine(@Headers('x-user-id') userId: string = 'anonymous') {
    const automations = await this.repo.findByCreator(userId);
    return automations.map((a) => a.toPlainObject());
  }

  @Put(':id/enable')
  @ApiOperation({ summary: 'Enable an automation' })
  async enable(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string = 'anonymous',
    @Headers('x-user-roles') rolesHeader: string = '',
  ) {
    const isAdmin = rolesHeader.split(',').includes('admin');
    return this.toggleAutomation.execute(id, true, userId, isAdmin);
  }

  @Put(':id/disable')
  @ApiOperation({ summary: 'Disable an automation' })
  async disable(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string = 'anonymous',
    @Headers('x-user-roles') rolesHeader: string = '',
  ) {
    const isAdmin = rolesHeader.split(',').includes('admin');
    return this.toggleAutomation.execute(id, false, userId, isAdmin);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an automation' })
  async remove(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string = 'anonymous',
    @Headers('x-user-roles') rolesHeader: string = '',
  ) {
    const isAdmin = rolesHeader.split(',').includes('admin');
    await this.deleteAutomation.execute(id, userId, isAdmin);
  }

  // ─── Execution ─────────────────────────────────────────────────────────────

  @Post('fire')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Fire all automations matching a trigger type',
    description: 'Called by the realtime-gateway when game events occur. Returns execution results for all matched automations.',
  })
  @ApiResponse({ status: 200, description: 'List of automation execution results' })
  async fire(@Body() dto: FireTriggerDto) {
    if (!dto.triggerType) throw new BadRequestException('triggerType is required');

    const context: AutomationEventContext = {
      ...dto.context,
      triggerType: dto.triggerType,
    };

    return this.fireTrigger.execute(dto.triggerType, dto.system as any, context);
  }

  // ─── Validate DSL ──────────────────────────────────────────────────────────

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate an automation definition without saving it' })
  async validate(@Body() dto: CreateAutomationDto) {
    const errors: string[] = [];

    if (!dto.name?.trim()) errors.push('name is required');
    if (!dto.trigger?.type) errors.push('trigger.type is required');
    if (!dto.actions || dto.actions.length === 0) errors.push('at least one action is required');
    if (dto.actions?.length > 20) errors.push('maximum 20 actions per automation');

    const validTriggers: TriggerType[] = [
      'ON_TURN_START', 'ON_TURN_END', 'ON_ATTACK_ROLL', 'ON_DAMAGE_DEALT',
      'ON_DAMAGE_RECEIVED', 'ON_HP_CHANGE', 'ON_HP_BELOW_THRESHOLD',
      'ON_CONDITION_APPLIED', 'ON_CONDITION_REMOVED', 'ON_SPELL_CAST',
      'ON_ABILITY_USED', 'ON_INITIATIVE_ROLLED', 'ON_ROUND_START',
      'ON_ROUND_END', 'ON_COMBAT_START', 'ON_COMBAT_END', 'ON_MOVE', 'MANUAL',
    ];
    if (dto.trigger?.type && !validTriggers.includes(dto.trigger.type)) {
      errors.push(`Invalid trigger type: ${dto.trigger.type}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
