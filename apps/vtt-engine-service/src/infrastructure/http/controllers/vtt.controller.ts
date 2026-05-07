import {
  Controller, Get, Post, Delete, Body, Param, Headers,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateMapDto, PlaceTokenDto, MoveTokenDto, AddWallDto } from '../dto/vtt.dto';
import {
  CreateMapUseCase,
  GetMapUseCase,
  AddWallUseCase,
  PlaceTokenUseCase,
  MoveTokenUseCase,
  GetTableStateUseCase,
} from '../../../application/use-cases/vtt.use-cases';

@ApiTags('maps')
@ApiBearerAuth()
@Controller('v1/maps')
export class MapsController {
  constructor(
    private readonly createMap: CreateMapUseCase,
    private readonly getMap: GetMapUseCase,
    private readonly addWall: AddWallUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new map' })
  create(@Body() dto: CreateMapDto) {
    return this.createMap.execute(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get map by ID' })
  get(@Param('id') id: string) {
    return this.getMap.execute(id);
  }

  @Post(':id/walls')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a wall to the map' })
  wall(@Param('id') id: string, @Body() dto: AddWallDto) {
    return this.addWall.execute(id, {
      start: dto.start,
      end: dto.end,
      blocksLight: dto.blocksLight ?? true,
      blocksMovement: dto.blocksMovement ?? true,
    });
  }
}

@ApiTags('tokens')
@ApiBearerAuth()
@Controller('v1/maps/:mapId/tokens')
export class TokensController {
  constructor(
    private readonly placeToken: PlaceTokenUseCase,
    private readonly moveToken: MoveTokenUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Place a token on the map' })
  place(
    @Param('mapId') mapId: string,
    @Body() dto: PlaceTokenDto,
    @Headers('x-table-id') tableId: string,
  ) {
    return this.placeToken.execute({ ...dto, mapId, tableId });
  }

  @Post(':tokenId/move')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Move a token (authoritative server-side validation)' })
  move(
    @Param('tokenId') tokenId: string,
    @Body() dto: MoveTokenDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-table-id') tableId: string,
  ) {
    return this.moveToken.execute({
      tokenId,
      tableId,
      position: dto.position,
      requesterId: userId,
    });
  }
}

@ApiTags('table-state')
@ApiBearerAuth()
@Controller('v1/tables/:tableId/state')
export class TableStateController {
  constructor(private readonly getState: GetTableStateUseCase) {}

  @Get(':mapId')
  @ApiOperation({ summary: 'Get full table game state (map + tokens + fog + lights)' })
  get(@Param('tableId') tableId: string, @Param('mapId') mapId: string) {
    return this.getState.execute(tableId, mapId);
  }
}
