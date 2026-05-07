import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  HttpCode, HttpStatus, Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateCharacterDto, UpdateSheetDto } from '../dto/campaign.dto';
import {
  CreateCharacterUseCase,
  UpdateCharacterSheetUseCase,
  GetCharacterUseCase,
  ListCampaignCharactersUseCase,
} from '../../../application/commands/character.use-cases';
import type { PaginationQuery } from '@vtt/shared-types';

@ApiTags('characters')
@ApiBearerAuth()
@Controller('v1/characters')
export class CharacterController {
  constructor(
    private readonly createUC: CreateCharacterUseCase,
    private readonly updateUC: UpdateCharacterSheetUseCase,
    private readonly getUC: GetCharacterUseCase,
    private readonly listUC: ListCampaignCharactersUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a character in a campaign' })
  create(@Body() dto: CreateCharacterDto, @Headers('x-user-id') userId: string) {
    return this.createUC.execute({ ...dto, userId });
  }

  @Get('campaign/:campaignId')
  @ApiOperation({ summary: 'List characters in a campaign' })
  listByCampaign(@Param('campaignId') campaignId: string, @Query() query: PaginationQuery) {
    return this.listUC.execute(campaignId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get character by ID' })
  get(@Param('id') id: string) {
    return this.getUC.execute(id);
  }

  @Patch(':id/sheet')
  @ApiOperation({ summary: 'Update character sheet data' })
  updateSheet(
    @Param('id') id: string,
    @Body() dto: UpdateSheetDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.updateUC.execute({ characterId: id, requesterId: userId, sheetData: dto.sheetData });
  }
}
