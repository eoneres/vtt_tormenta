import { generateId } from '@vtt/shared-utils';
import type { GridType, LayerConfig, LayerType, Position, Wall } from '@vtt/shared-types';

interface MapProps {
  id: string;
  campaignId: string;
  name: string;
  imageUrl: string;
  gridType: GridType;
  gridSize: number;
  width: number;
  height: number;
  layers: LayerConfig[];
  walls: Wall[];
  createdAt: Date;
  updatedAt: Date;
}

export class GameMap {
  readonly id: string;
  readonly campaignId: string;
  name: string;
  imageUrl: string;
  gridType: GridType;
  gridSize: number;
  width: number;
  height: number;
  layers: LayerConfig[];
  walls: Wall[];
  readonly createdAt: Date;
  updatedAt: Date;

  private constructor(props: MapProps) {
    this.id = props.id;
    this.campaignId = props.campaignId;
    this.name = props.name;
    this.imageUrl = props.imageUrl;
    this.gridType = props.gridType;
    this.gridSize = props.gridSize;
    this.width = props.width;
    this.height = props.height;
    this.layers = props.layers;
    this.walls = props.walls;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: {
    campaignId: string;
    name: string;
    imageUrl: string;
    gridType: GridType;
    gridSize?: number;
    width: number;
    height: number;
  }): GameMap {
    const now = new Date();
    return new GameMap({
      id: generateId(),
      campaignId: props.campaignId,
      name: props.name.trim(),
      imageUrl: props.imageUrl,
      gridType: props.gridType,
      gridSize: props.gridSize ?? 70,
      width: props.width,
      height: props.height,
      layers: GameMap.defaultLayers(),
      walls: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: MapProps): GameMap {
    return new GameMap(props);
  }

  addWall(wall: Omit<Wall, 'id'>): Wall {
    const newWall: Wall = { id: generateId(), ...wall };
    this.walls.push(newWall);
    this.updatedAt = new Date();
    return newWall;
  }

  removeWall(wallId: string): void {
    this.walls = this.walls.filter((w) => w.id !== wallId);
    this.updatedAt = new Date();
  }

  setLayerVisibility(layerId: string, visible: boolean): void {
    const layer = this.layers.find((l) => l.id === layerId);
    if (layer) {
      layer.visible = visible;
      this.updatedAt = new Date();
    }
  }

  snapToGrid(pos: Position): Position {
    return {
      x: Math.round(pos.x / this.gridSize) * this.gridSize,
      y: Math.round(pos.y / this.gridSize) * this.gridSize,
    };
  }

  isWithinBounds(pos: Position): boolean {
    return pos.x >= 0 && pos.y >= 0 && pos.x <= this.width && pos.y <= this.height;
  }

  private static defaultLayers(): LayerConfig[] {
    const types: Array<{ type: LayerType; zIndex: number }> = [
      { type: 'BACKGROUND' as LayerType, zIndex: 0 },
      { type: 'OBJECTS' as LayerType, zIndex: 1 },
      { type: 'TOKENS' as LayerType, zIndex: 2 },
      { type: 'LIGHTING' as LayerType, zIndex: 3 },
      { type: 'GM' as LayerType, zIndex: 4 },
    ];
    return types.map(({ type, zIndex }) => ({
      id: generateId(),
      type,
      visible: true,
      locked: false,
      zIndex,
    }));
  }
}
