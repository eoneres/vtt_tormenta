import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@vtt/shared-auth';
import { CurrentUser, OptionalJwtAuthGuard } from '@vtt/shared-auth';
import type { JwtPayload } from '@vtt/shared-auth';
import {
  CreateEntryUseCase,
  GetEntryUseCase,
  SearchEntriesUseCase,
  UpdateEntryUseCase,
  DeleteEntryUseCase,
  ImportBulkEntriesUseCase,
  GetSystemStatsUseCase,
} from '../../application/commands/compendium.use-cases';
import {
  CreateEntryDto,
  UpdateEntryDto,
  BulkImportDto,
  SearchEntriesQueryDto,
} from './dto/compendium.dto';
import { EntryType, GameSystem } from '../../domain/entry/entry.entity';

@ApiTags('Compendium')
@Controller('v1/compendium')
export class CompendiumController {
  constructor(
    private readonly createEntry: CreateEntryUseCase,
    private readonly getEntry: GetEntryUseCase,
    private readonly searchEntries: SearchEntriesUseCase,
    private readonly updateEntry: UpdateEntryUseCase,
    private readonly deleteEntry: DeleteEntryUseCase,
    private readonly importBulk: ImportBulkEntriesUseCase,
    private readonly getStats: GetSystemStatsUseCase,
  ) {}

  // ─── Search & List ────────────────────────────────────────────────────────

  @Get('entries')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Search compendium entries with filtering and full-text search' })
  @ApiResponse({ status: 200, description: 'Paginated list of entries' })
  @ApiQuery({ name: 'system', enum: ['tormenta20', 'dnd5e', 'shadowrun', 'custom'], required: false })
  @ApiQuery({ name: 'type', enum: Object.values(EntryType), required: false })
  @ApiQuery({ name: 'tags', type: String, isArray: true, required: false })
  @ApiQuery({ name: 'q', type: String, required: false, description: 'Full-text search query' })
  @ApiQuery({ name: 'isOfficial', type: Boolean, required: false })
  @ApiQuery({ name: 'isHomebrew', type: Boolean, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 20 })
  @ApiQuery({ name: 'sortBy', enum: ['name', 'createdAt', 'updatedAt'], required: false })
  @ApiQuery({ name: 'sortOrder', enum: ['asc', 'desc'], required: false })
  async search(
    @Query() queryDto: SearchEntriesQueryDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    const page = Math.max(1, queryDto.page ?? 1);
    const limit = Math.min(50, Math.max(1, queryDto.limit ?? 20));
    const skip = (page - 1) * limit;

    return this.searchEntries.execute({
      filters: {
        system: queryDto.system as GameSystem | undefined,
        type: queryDto.type as EntryType | undefined,
        tags: queryDto.tags,
        query: queryDto.q,
        isOfficial: queryDto.isOfficial,
        isHomebrew: queryDto.isHomebrew,
      },
      options: {
        skip,
        limit,
        sortBy: queryDto.sortBy as 'name' | 'createdAt' | 'updatedAt' | undefined,
        sortOrder: queryDto.sortOrder as 'asc' | 'desc' | undefined,
      },
      requesterId: user?.sub,
    });
  }

  // ─── Stats ────────────────────────────────────────────────────────────────

  @Get('stats/:system')
  @ApiOperation({ summary: 'Get entry counts by type for a game system' })
  @ApiParam({ name: 'system', enum: ['tormenta20', 'dnd5e', 'shadowrun', 'custom'] })
  async stats(@Param('system') system: string) {
    return this.getStats.execute(system as GameSystem);
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  @Get('entries/:id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get a compendium entry by ID' })
  @ApiResponse({ status: 200, description: 'Entry found' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.getEntry.execute({ entryId: id, requesterId: user?.sub });
  }

  @Post('entries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new compendium entry' })
  @ApiResponse({ status: 201, description: 'Entry created' })
  @ApiResponse({ status: 409, description: 'Entry with same name already exists in system' })
  async create(
    @Body() dto: CreateEntryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.createEntry.execute({
      requesterId: user.sub,
      requesterRoles: user.roles ?? [],
      entry: {
        name: dto.name,
        description: dto.description,
        shortDescription: dto.shortDescription,
        type: dto.type as EntryType,
        system: dto.system as GameSystem,
        tags: dto.tags ?? [],
        attributes: dto.attributes ?? [],
        relations: dto.relations ?? [],
        source: dto.source,
        isHomebrew: true,
        isPublic: dto.isPublic ?? true,
      },
    });
  }

  @Put('entries/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a compendium entry' })
  @ApiResponse({ status: 200, description: 'Entry updated' })
  @ApiResponse({ status: 403, description: 'Not authorized to edit this entry' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEntryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.updateEntry.execute({
      requesterId: user.sub,
      requesterRoles: user.roles ?? [],
      entryId: id,
      changes: {
        name: dto.name,
        description: dto.description,
        shortDescription: dto.shortDescription,
        tags: dto.tags,
        attributes: dto.attributes,
        isPublic: dto.isPublic,
      },
    });
  }

  @Delete('entries/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a compendium entry' })
  @ApiResponse({ status: 204, description: 'Entry deleted' })
  @ApiResponse({ status: 403, description: 'Not authorized to delete this entry' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.deleteEntry.execute({
      requesterId: user.sub,
      requesterRoles: user.roles ?? [],
      entryId: id,
    });
  }

  // ─── Bulk Import (Admin only) ─────────────────────────────────────────────

  @Post('entries/bulk-import')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk import official compendium entries (admin only)' })
  @ApiResponse({ status: 200, description: 'Import results with counts' })
  async bulkImport(
    @Body() dto: BulkImportDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.importBulk.execute({
      requesterId: user.sub,
      requesterRoles: user.roles ?? [],
      entries: dto.entries as any,
      overwrite: dto.overwrite,
    });
  }
}
