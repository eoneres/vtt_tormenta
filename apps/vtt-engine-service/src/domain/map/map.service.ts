/**
 * VTT Map Management System
 *
 * Gerencia:
 * - Upload de mapas
 * - Camadas (background, grid, objetos, tokens, GM layer)
 * - Obstáculos (paredes, portas)
 * - Grid (quadrado, hexagonal, sem grid)
 */

export type GridType = 'square' | 'hex' | 'none';

export interface MapLayer {
  id: string;
  name: string;
  type: 'background' | 'objects' | 'tokens' | 'effects' | 'gm-only';
  zIndex: number;
  visible: boolean;
  opacity: number; // 0-1
  locked?: boolean;
}

export interface GridConfiguration {
  type: GridType;
  size: number; // pixels per cell
  color: string;
  opacity: number; // 0-1
  visible: boolean;
}

export interface MapDoor {
  id: string;
  coordinate: { x: number; y: number };
  isOpen: boolean;
  blocksVision: boolean;
  blocksMovement: boolean;
  label?: string;
}

export interface MapWall {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  blocksVision: boolean;
  blocksMovement: boolean;
  blocksSound?: boolean;
  height?: number; // para paredes com altura diferente
}

export interface MapEnvironment {
  id: string;
  coordinate: { x: number; y: number };
  type: 'difficult-terrain' | 'water' | 'lava' | 'gas' | 'custom';
  effect: string;
  blocked?: boolean;
}

export interface VTTMapMetadata {
  id: string;
  campaignId: string;
  name: string;
  description?: string;
  width: number;
  height: number;
  scale: number; // pixels per grid cell
  gridConfig: GridConfiguration;
  backgroundImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * VTT Map Service
 */
export class VTTMapService {
  private metadata: VTTMapMetadata;
  private layers: Map<string, MapLayer> = new Map();
  private walls: Map<string, MapWall> = new Map();
  private doors: Map<string, MapDoor> = new Map();
  private environments: Map<string, MapEnvironment> = new Map();
  private lightSources: Map<string, { x: number; y: number; intensity: number; color: string; radius: number }> =
    new Map();

  constructor(metadata: VTTMapMetadata) {
    this.metadata = metadata;
    this.initializeLayers();
  }

  /**
   * Inicializar camadas padrão
   */
  private initializeLayers(): void {
    const defaultLayers: MapLayer[] = [
      {
        id: 'background',
        name: 'Background',
        type: 'background',
        zIndex: 0,
        visible: true,
        opacity: 1,
        locked: false,
      },
      {
        id: 'objects',
        name: 'Objects',
        type: 'objects',
        zIndex: 1,
        visible: true,
        opacity: 1,
        locked: false,
      },
      {
        id: 'tokens',
        name: 'Tokens',
        type: 'tokens',
        zIndex: 2,
        visible: true,
        opacity: 1,
        locked: false,
      },
      {
        id: 'effects',
        name: 'Effects',
        type: 'effects',
        zIndex: 3,
        visible: true,
        opacity: 1,
        locked: false,
      },
      {
        id: 'gm-layer',
        name: 'GM Only',
        type: 'gm-only',
        zIndex: 4,
        visible: true,
        opacity: 1,
        locked: false,
      },
    ];

    defaultLayers.forEach((layer) => this.layers.set(layer.id, layer));
  }

  /**
   * Adicionar parede
   */
  addWall(wall: MapWall): void {
    this.walls.set(wall.id, wall);
  }

  /**
   * Remover parede
   */
  removeWall(wallId: string): void {
    this.walls.delete(wallId);
  }

  /**
   * Obter todas as paredes
   */
  getWalls(): MapWall[] {
    return Array.from(this.walls.values());
  }

  /**
   * Adicionar porta
   */
  addDoor(door: MapDoor): void {
    this.doors.set(door.id, door);
  }

  /**
   * Alternar porta (abrir/fechar)
   */
  toggleDoor(doorId: string): void {
    const door = this.doors.get(doorId);
    if (door) {
      door.isOpen = !door.isOpen;
      // Quando porta abre, permite visão/movimento
      // Quando fecha, bloqueia
    }
  }

  /**
   * Adicionar ambiente (terreno difícil, água, etc)
   */
  addEnvironment(env: MapEnvironment): void {
    this.environments.set(env.id, env);
  }

  /**
   * Obter ambiente na coordenada
   */
  getEnvironmentAt(x: number, y: number): MapEnvironment | undefined {
    return Array.from(this.environments.values()).find((env) => env.coordinate.x === x && env.coordinate.y === y);
  }

  /**
   * Adicionar fonte de luz (tocha, lanterna, magia)
   */
  addLightSource(sourceId: string, x: number, y: number, intensity: number, color: string, radius: number): void {
    this.lightSources.set(sourceId, { x, y, intensity, color, radius });
  }

  /**
   * Remover fonte de luz
   */
  removeLightSource(sourceId: string): void {
    this.lightSources.delete(sourceId);
  }

  /**
   * Obter todas as fontes de luz
   */
  getLightSources() {
    return Array.from(this.lightSources.values());
  }

  /**
   * Alternar visibilidade de camada
   */
  toggleLayerVisibility(layerId: string): void {
    const layer = this.layers.get(layerId);
    if (layer && !layer.locked) {
      layer.visible = !layer.visible;
    }
  }

  /**
   * Bloquear/desbloquear camada
   */
  setLayerLocked(layerId: string, locked: boolean): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.locked = locked;
    }
  }

  /**
   * Verificar se camada é visível para jogador
   */
  isLayerVisibleForPlayer(layerId: string, isGM: boolean): boolean {
    const layer = this.layers.get(layerId);
    if (!layer) return false;
    if (!layer.visible) return false;
    if (layer.type === 'gm-only') return isGM;
    return true;
  }

  /**
   * Verificar colisão de movimento
   */
  canMoveTo(x: number, y: number): boolean {
    // Verificar paredes
    const hasWall = this.walls.some((wall) => {
      return this.isPointOnLine({ x, y }, wall.from, wall.to) && wall.blocksMovement;
    });

    if (hasWall) return false;

    // Verificar portas fechadas
    const hasDoor = Array.from(this.doors.values()).some((door) => {
      return door.coordinate.x === x && door.coordinate.y === y && !door.isOpen && door.blocksMovement;
    });

    if (hasDoor) return false;

    // Verificar ambiente bloqueador
    const env = this.getEnvironmentAt(x, y);
    if (env && env.blocked) return false;

    return true;
  }

  /**
   * Verificar linha de visão (passando por paredes, portas, etc)
   */
  canSeeThrough(from: { x: number; y: number }, to: { x: number; y: number }): boolean {
    // Verificar paredes
    for (const wall of this.walls.values()) {
      if (wall.blocksVision && this.lineIntersectsLine(from, to, wall.from, wall.to)) {
        return false;
      }
    }

    // Verificar portas fechadas
    for (const door of this.doors.values()) {
      if (!door.isOpen && door.blocksVision) {
        if (this.isPointOnLine(door.coordinate, from, to)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Serializar mapa para transmissão
   */
  serialize(): object {
    return {
      metadata: this.metadata,
      layers: Array.from(this.layers.values()),
      walls: Array.from(this.walls.values()),
      doors: Array.from(this.doors.values()),
      environments: Array.from(this.environments.values()),
      lightSources: Array.from(this.lightSources.values()),
    };
  }

  /**
   * Helpers privados
   */

  private isPointOnLine(point: { x: number; y: number }, from: { x: number; y: number }, to: { x: number; y: number }): boolean {
    const { x, y } = point;
    const { x: x1, y: y1 } = from;
    const { x: x2, y: y2 } = to;

    // Verificar se ponto está no segmento de linha
    const crossProduct = (y - y1) * (x2 - x1) - (x - x1) * (y2 - y1);
    if (Math.abs(crossProduct) > 0.001) return false;

    const dotProduct = (x - x1) * (x2 - x1) + (y - y1) * (y2 - y1);
    const squaredLength = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);

    return dotProduct >= 0 && dotProduct <= squaredLength;
  }

  private lineIntersectsLine(
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    p4: { x: number; y: number },
  ): boolean {
    const ccw = (a: any, b: any, c: any) => (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
    return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
  }
}

/**
 * Map Upload Service
 */
export class MapUploadService {
  /**
   * Criar novo mapa a partir de upload
   */
  static createFromUpload(
    campaignId: string,
    mapName: string,
    imageBuffer: Buffer,
    gridConfig: GridConfiguration,
  ): VTTMapService {
    const metadata: VTTMapMetadata = {
      id: `map_${Date.now()}`,
      campaignId,
      name: mapName,
      width: 1024, // Derivar do tamanho da imagem
      height: 1024,
      scale: gridConfig.size,
      gridConfig,
      backgroundImage: `uploads/maps/${Date.now()}.png`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return new VTTMapService(metadata);
  }

  /**
   * Validar imagem antes de upload
   */
  static validateImage(imageBuffer: Buffer): { valid: boolean; error?: string } {
    // Verificar PNG/JPG
    const isPNG = imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50;
    const isJPG = imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8;

    if (!isPNG && !isJPG) {
      return { valid: false, error: 'Only PNG and JPG images are supported' };
    }

    // Verificar tamanho (max 50MB)
    if (imageBuffer.length > 50 * 1024 * 1024) {
      return { valid: false, error: 'Image too large (max 50MB)' };
    }

    return { valid: true };
  }
}

export const VTTMap = {
  Service: VTTMapService,
  Upload: MapUploadService,
};
