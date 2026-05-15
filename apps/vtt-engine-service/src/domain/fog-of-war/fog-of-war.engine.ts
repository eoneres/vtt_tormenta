/**
 * Fog of War Engine for VTT
 *
 * Implementa o sistema de Fog of War (FoW) para Tormenta20, D&D 5e e Shadowrun.
 * Sincroniza com o realtime-gateway para multiplayer em tempo real.
 */

export interface GridCoordinate {
  x: number;
  y: number;
}

export interface Vision {
  origin: GridCoordinate;
  distance: number; // em pés/metros
  blindsight?: boolean;
  darkvision?: boolean;
  truesight?: boolean;
}

export interface FogOfWarCell {
  coordinate: GridCoordinate;
  revealed: boolean; // Já foi visto?
  visible: boolean; // É visível agora?
  exploredByPlayers: Set<string>; // IDs dos jogadores que exploraram
}

export interface MapDimensions {
  width: number;
  height: number;
  gridSize: number; // pixels por célula
}

export interface Obstacle {
  coordinate: GridCoordinate;
  type: 'wall' | 'partial' | 'door' | 'terrain';
  blocksLight: boolean;
  blocksVision: boolean;
  blocksDiagonals?: boolean;
}

/**
 * Core Fog of War System
 */
export class FogOfWarEngine {
  private fowGrid: Map<string, FogOfWarCell> = new Map();
  private obstacles: Obstacle[] = [];
  private mapDimensions: MapDimensions;

  constructor(dimensions: MapDimensions) {
    this.mapDimensions = dimensions;
    this.initializeGrid();
  }

  /**
   * Inicializa grid com todas as células
   */
  private initializeGrid(): void {
    for (let y = 0; y < this.mapDimensions.height; y++) {
      for (let x = 0; x < this.mapDimensions.width; x++) {
        const key = this.getKey({ x, y });
        this.fowGrid.set(key, {
          coordinate: { x, y },
          revealed: false,
          visible: false,
          exploredByPlayers: new Set(),
        });
      }
    }
  }

  /**
   * Adicionar obstáculo ao mapa (parede, porta, etc)
   */
  addObstacle(obstacle: Obstacle): void {
    this.obstacles.push(obstacle);
  }

  /**
   * Atualizar visão para um token
   */
  updateVision(vision: Vision, playerId: string): void {
    // 1. Revelar todas as células visíveis de acordo com a visão
    const visibleCells = this.getVisibleCells(vision);

    // 2. Atualizar grid
    visibleCells.forEach((coord) => {
      const key = this.getKey(coord);
      const cell = this.fowGrid.get(key);
      if (cell) {
        cell.visible = true;
        cell.revealed = true;
        cell.exploredByPlayers.add(playerId);
      }
    });

    // 3. Esconder células fora de visão
    this.fowGrid.forEach((cell) => {
      if (!visibleCells.some((c) => c.x === cell.coordinate.x && c.y === cell.coordinate.y)) {
        cell.visible = false;
      }
    });
  }

  /**
   * Calcula células visíveis a partir de um ponto
   */
  private getVisibleCells(vision: Vision): GridCoordinate[] {
    const visibleCells: GridCoordinate[] = [];
    const { x, y } = vision.origin;
    const maxDistance = vision.distance;

    for (let dy = -maxDistance; dy <= maxDistance; dy++) {
      for (let dx = -maxDistance; dx <= maxDistance; dx++) {
        const targetX = x + dx;
        const targetY = y + dy;

        // Verificar limites do mapa
        if (targetX < 0 || targetX >= this.mapDimensions.width || targetY < 0 || targetY >= this.mapDimensions.height) {
          continue;
        }

        // Verificar distância (círculo)
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > maxDistance) continue;

        // Verificar linha de visão (raycasting simples)
        if (this.hasLineOfSight(vision.origin, { x: targetX, y: targetY })) {
          visibleCells.push({ x: targetX, y: targetY });
        }
      }
    }

    return visibleCells;
  }

  /**
   * Raycasting simples para linha de visão
   */
  private hasLineOfSight(from: GridCoordinate, to: GridCoordinate): boolean {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    if (steps === 0) return true;

    for (let i = 1; i <= steps; i++) {
      const x = Math.round(from.x + (dx * i) / steps);
      const y = Math.round(from.y + (dy * i) / steps);

      // Verificar se há obstáculo bloqueando visão
      const obstacle = this.obstacles.find((o) => o.coordinate.x === x && o.coordinate.y === y && o.blocksVision);
      if (obstacle) return false;
    }

    return true;
  }

  /**
   * Revelar uma área (para magia de visão, etc)
   */
  revealArea(center: GridCoordinate, radius: number, playerId: string): void {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = center.x + dx;
        const y = center.y + dy;

        if (x >= 0 && x < this.mapDimensions.width && y >= 0 && y < this.mapDimensions.height) {
          const key = this.getKey({ x, y });
          const cell = this.fowGrid.get(key);
          if (cell) {
            cell.revealed = true;
            cell.exploredByPlayers.add(playerId);
          }
        }
      }
    }
  }

  /**
   * Esconder uma célula (por exemplo, quando uma ilusão acaba)
   */
  hideCell(coordinate: GridCoordinate): void {
    const key = this.getKey(coordinate);
    const cell = this.fowGrid.get(key);
    if (cell) {
      cell.visible = false;
    }
  }

  /**
   * Resetar para exploração inicial
   */
  reset(): void {
    this.fowGrid.forEach((cell) => {
      cell.visible = false;
      cell.revealed = false;
    });
  }

  /**
   * Obter estado de FoW para um jogador
   */
  getPlayerView(playerId: string): Map<string, boolean> {
    const view = new Map<string, boolean>();

    this.fowGrid.forEach((cell, key) => {
      // Mostrar se: visível agora OU foi explorado pelo jogador
      const isVisible = cell.visible || cell.exploredByPlayers.has(playerId);
      view.set(key, isVisible);
    });

    return view;
  }

  /**
   * Serializar estado para transmissão
   */
  serialize(): object {
    const data: any = {
      dimensions: this.mapDimensions,
      cells: [],
    };

    this.fowGrid.forEach((cell) => {
      data.cells.push({
        coordinate: cell.coordinate,
        revealed: cell.revealed,
        visible: cell.visible,
        exploredCount: cell.exploredByPlayers.size,
      });
    });

    return data;
  }

  private getKey(coord: GridCoordinate): string {
    return `${coord.x},${coord.y}`;
  }
}

/**
 * Token Vision Management
 */
export class TokenVisionManager {
  private tokenVisions: Map<string, Vision> = new Map(); // tokenId -> Vision
  private fowEngine: FogOfWarEngine;

  constructor(fowEngine: FogOfWarEngine) {
    this.fowEngine = fowEngine;
  }

  /**
   * Registrar token com visão
   */
  registerToken(tokenId: string, position: GridCoordinate, vision: Partial<Vision> = {}): void {
    const defaultVision: Vision = {
      origin: position,
      distance: 60, // 60 feet padrão
      blindsight: false,
      darkvision: false,
      truesight: false,
      ...vision,
    };

    this.tokenVisions.set(tokenId, defaultVision);
  }

  /**
   * Mover token e atualizar visão
   */
  moveToken(tokenId: string, newPosition: GridCoordinate, playerId: string): void {
    const vision = this.tokenVisions.get(tokenId);
    if (!vision) return;

    vision.origin = newPosition;
    this.fowEngine.updateVision(vision, playerId);
  }

  /**
   * Atualizar raça/classe do token (pode mudar visão)
   */
  updateTokenVision(
    tokenId: string,
    options: { distance?: number; darkvision?: boolean; blindsight?: boolean; truesight?: boolean },
  ): void {
    const vision = this.tokenVisions.get(tokenId);
    if (!vision) return;

    if (options.distance !== undefined) vision.distance = options.distance;
    if (options.darkvision !== undefined) vision.darkvision = options.darkvision;
    if (options.blindsight !== undefined) vision.blindsight = options.blindsight;
    if (options.truesight !== undefined) vision.truesight = options.truesight;
  }

  /**
   * Remover token
   */
  unregisterToken(tokenId: string): void {
    this.tokenVisions.delete(tokenId);
  }

  /**
   * Obter todas as visões (para atualização em batch)
   */
  getAllVisions(): Map<string, Vision> {
    return new Map(this.tokenVisions);
  }
}

/**
 * Factory para criar FoW por sistema
 */
export class FogOfWarFactory {
  /**
   * Padrões de visão por raça
   */
  static getRaceVision(system: 'tormenta20' | 'd5e' | 'shadowrun', race: string): Partial<Vision> {
    if (system === 'tormenta20') {
      const visions: Record<string, Partial<Vision>> = {
        dwarf: { distance: 60, darkvision: true },
        elf: { distance: 80, darkvision: true },
        goblin: { distance: 60, darkvision: true },
        human: { distance: 60 },
        halfling: { distance: 60 },
      };
      return visions[race.toLowerCase()] || { distance: 60 };
    }

    if (system === 'd5e') {
      const visions: Record<string, Partial<Vision>> = {
        dwarf: { distance: 60, darkvision: true },
        elf: { distance: 60, darkvision: true },
        halfling: { distance: 60 },
        human: { distance: 60 },
        dragonborn: { distance: 60 },
        gnome: { distance: 60, darkvision: true },
        'half-elf': { distance: 60, darkvision: true },
        'half-orc': { distance: 60, darkvision: true },
        tiefling: { distance: 60, darkvision: true },
      };
      return visions[race.toLowerCase()] || { distance: 60 };
    }

    if (system === 'shadowrun') {
      // Shadowrun: different mechanics based on augmentation
      return { distance: 30 }; // Padrão; pode ser modificado por ciberware
    }

    return { distance: 60 };
  }
}

export const VTTFogOfWar = {
  Engine: FogOfWarEngine,
  TokenManager: TokenVisionManager,
  Factory: FogOfWarFactory,
};
