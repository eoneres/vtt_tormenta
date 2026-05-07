import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { GameMap } from '../../domain/map/entities/game-map.entity';
import { MapToken } from '../../domain/token/entities/map-token.entity';
import { FogOfWarManager } from '../../domain/fog/entities/fog-of-war.manager';
import { LightingEngine } from '../../domain/lighting/entities/lighting.engine';
import { TableStateCache } from '../../infrastructure/cache/table-state.cache';
import { IMapRepository, MAP_REPOSITORY } from '../../domain/map/repositories/map.repository';
import { ITokenRepository, TOKEN_REPOSITORY } from '../../domain/token/repositories/token.repository';
import type { GridType, LightSource, Position, TableGameState, Wall } from '@vtt/shared-types';

// ─── Map Use Cases ────────────────────────────────────────────────────────────

@Injectable()
export class CreateMapUseCase {
  constructor(@Inject(MAP_REPOSITORY) private readonly repo: IMapRepository) {}

  async execute(props: {
    campaignId: string;
    name: string;
    imageUrl: string;
    gridType: GridType;
    gridSize?: number;
    width: number;
    height: number;
  }): Promise<GameMap> {
    const map = GameMap.create(props);
    await this.repo.save(map);
    return map;
  }
}

@Injectable()
export class GetMapUseCase {
  constructor(@Inject(MAP_REPOSITORY) private readonly repo: IMapRepository) {}

  async execute(mapId: string): Promise<GameMap> {
    const map = await this.repo.findById(mapId);
    if (!map) throw new NotFoundException('Map not found');
    return map;
  }
}

@Injectable()
export class AddWallUseCase {
  constructor(@Inject(MAP_REPOSITORY) private readonly repo: IMapRepository) {}

  async execute(mapId: string, wall: Omit<Wall, 'id'>): Promise<Wall> {
    const map = await this.repo.findById(mapId);
    if (!map) throw new NotFoundException('Map not found');
    const newWall = map.addWall(wall);
    await this.repo.save(map);
    return newWall;
  }
}

// ─── Token Use Cases ──────────────────────────────────────────────────────────

@Injectable()
export class PlaceTokenUseCase {
  constructor(
    @Inject(TOKEN_REPOSITORY) private readonly tokenRepo: ITokenRepository,
    @Inject(MAP_REPOSITORY) private readonly mapRepo: IMapRepository,
    private readonly stateCache: TableStateCache,
  ) {}

  async execute(props: {
    mapId: string;
    tableId: string;
    name: string;
    imageUrl: string;
    position: Position;
    characterId?: string;
    npcId?: string;
    size?: number;
    hp?: number;
    maxHp?: number;
    controlledBy?: string[];
  }): Promise<MapToken> {
    const map = await this.mapRepo.findById(props.mapId);
    if (!map) throw new NotFoundException('Map not found');

    const snapped = map.snapToGrid(props.position);
    if (!map.isWithinBounds(snapped)) {
      throw new ForbiddenException('Position is outside map bounds');
    }

    const token = MapToken.create({ ...props, position: snapped });
    await this.tokenRepo.save(token);
    await this.stateCache.invalidate(props.tableId);
    return token;
  }
}

@Injectable()
export class MoveTokenUseCase {
  constructor(
    @Inject(TOKEN_REPOSITORY) private readonly tokenRepo: ITokenRepository,
    @Inject(MAP_REPOSITORY) private readonly mapRepo: IMapRepository,
    private readonly stateCache: TableStateCache,
  ) {}

  async execute(props: {
    tokenId: string;
    tableId: string;
    position: Position;
    requesterId: string;
  }): Promise<MapToken> {
    const token = await this.tokenRepo.findById(props.tokenId);
    if (!token) throw new NotFoundException('Token not found');
    if (!token.isControlledBy(props.requesterId)) {
      throw new ForbiddenException('Not authorized to move this token');
    }

    const map = await this.mapRepo.findById(token.mapId);
    if (!map) throw new NotFoundException('Map not found');

    const snapped = map.snapToGrid(props.position);
    if (!map.isWithinBounds(snapped)) {
      throw new ForbiddenException('Position is outside map bounds');
    }

    token.moveTo(snapped);
    await this.tokenRepo.save(token);
    await this.stateCache.invalidate(props.tableId);
    return token;
  }
}

// ─── Table State Use Case ─────────────────────────────────────────────────────

@Injectable()
export class GetTableStateUseCase {
  private readonly fogManager = new FogOfWarManager();
  private readonly lightingEngine = new LightingEngine();

  constructor(
    @Inject(MAP_REPOSITORY) private readonly mapRepo: IMapRepository,
    @Inject(TOKEN_REPOSITORY) private readonly tokenRepo: ITokenRepository,
    private readonly stateCache: TableStateCache,
  ) {}

  async execute(tableId: string, mapId: string): Promise<TableGameState> {
    const cached = await this.stateCache.get(tableId);
    if (cached) return cached;

    const [map, tokens] = await Promise.all([
      this.mapRepo.findById(mapId),
      this.tokenRepo.findByMap(mapId),
    ]);

    if (!map) throw new NotFoundException('Map not found');

    const lights: LightSource[] = [];
    let fogState = { mode: 'global' as const, revealedAreas: [] };

    // Reveal fog around each visible token (default sight radius = 6 grid cells)
    for (const token of tokens) {
      if (token.isVisible) {
        const sightRadius = map.gridSize * 6;
        fogState = this.fogManager.revealAroundToken(
          fogState,
          token.id,
          token.position,
          sightRadius,
          map.walls,
        );
      }
    }

    const state: TableGameState = {
      tableId,
      map: {
        id: map.id,
        name: map.name,
        imageUrl: map.imageUrl,
        gridType: map.gridType,
        gridSize: map.gridSize,
        width: map.width,
        height: map.height,
        layers: map.layers,
      },
      tokens: tokens.map((t) => ({
        id: t.id,
        characterId: t.characterId,
        npcId: t.npcId,
        name: t.name,
        imageUrl: t.imageUrl,
        position: t.position,
        size: t.size,
        hp: t.hp,
        maxHp: t.maxHp,
        conditions: t.conditions,
        auras: t.auras,
        isVisible: t.isVisible,
        controlledBy: t.controlledBy,
      })),
      fogOfWar: fogState,
      lights,
      walls: map.walls,
      initiative: [],
      round: 0,
      turn: 0,
    };

    await this.stateCache.set(state);
    return state;
  }
}
