import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  HttpCode, HttpStatus, Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreateCampaignDto, UpdateCampaignDto } from '../dto/campaign.dto';
import {
  CreateCampaignUseCase,
  UpdateCampaignUseCase,
  ArchiveCampaignUseCase,
  GetCampaignUseCase,
  ListMyCampaignsUseCase,
} from '../../../application/commands/campaign.use-cases';
import type { PaginationQuery } from '@vtt/shared-types';

@ApiTags('campaigns')
@ApiBearerAuth()
@Controller('v1/campaigns')
export class CampaignController {
  constructor(
    private readonly createUC: CreateCampaignUseCase,
    private readonly updateUC: UpdateCampaignUseCase,
    private readonly archiveUC: ArchiveCampaignUseCase,
    private readonly getUC: GetCampaignUseCase,
    private readonly listUC: ListMyCampaignsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new campaign' })
  @ApiResponse({ status: 201 })
  create(@Body() dto: CreateCampaignDto, @Headers('x-user-id') userId: string) {
    return this.createUC.execute({ ...dto, ownerId: userId });
  }

  @Get()
  @ApiOperation({ summary: 'List my campaigns' })
  list(@Headers('x-user-id') userId: string, @Query() query: PaginationQuery) {
    return this.listUC.execute(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign by ID' })
  get(@Param('id') id: string) {
    return this.getUC.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update campaign' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.updateUC.execute({ campaignId: id, requesterId: userId, ...dto });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive campaign' })
  archive(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    return this.archiveUC.execute(id, userId);
  }
}
