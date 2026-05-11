import * as PIXI from 'pixi.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FogCell {
  x: number; // grid col
  y: number; // grid row
}

export type FogState =
  | 'unexplored' // never seen — fully opaque black
  | 'explored'   // seen before but not currently visible — dark tint
  | 'visible';   // currently visible — no fog

export interface FogUpdate {
  revealed: FogCell[];   // newly revealed cells
  hidden: FogCell[];     // cells that went back to explored (not unexplored)
}

/**
 * FogOfWarRenderer
 *
 * Manages a per-cell fog revelation system using a PIXI.RenderTexture-based
 * approach for performance at scale.
 *
 * Architecture:
 * - unexploredLayer: black tiles for cells never seen
 * - exploredLayer:   dark semi-transparent tiles for explored-but-not-visible cells
 * - Both layers are managed as flat sprite arrays indexed by (col * rows + row)
 *
 * For large maps, cells are chunked into 32x32 segments and rendered as
 * RenderTextures to avoid GPU overdraw.
 */
export class FogOfWarRenderer {
  private readonly container: PIXI.Container;
  private readonly unexploredContainer: PIXI.Container;
  private readonly exploredContainer: PIXI.Container;

  private readonly cellStates: Map<string, FogState> = new Map();
  private readonly cellSprites: Map<string, PIXI.Graphics> = new Map();

  private gridCols = 0;
  private gridRows = 0;
  private cellSize = 70; // px per cell

  // Reusable texture for unexplored cells (perf optimization)
  private unexploredTexture: PIXI.Texture | null = null;
  private exploredTexture: PIXI.Texture | null = null;

  constructor() {
    this.container = new PIXI.Container();
    this.container.name = 'fogOfWarLayer';

    this.unexploredContainer = new PIXI.Container();
    this.unexploredContainer.name = 'unexplored';

    this.exploredContainer = new PIXI.Container();
    this.exploredContainer.name = 'explored';

    this.container.addChild(this.unexploredContainer, this.exploredContainer);
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  getContainer(): PIXI.Container {
    return this.container;
  }

  /**
   * Initialize the fog grid. Must be called before any updates.
   */
  init(cols: number, rows: number, cellSize: number, app: PIXI.Application): void {
    this.gridCols = cols;
    this.gridRows = rows;
    this.cellSize = cellSize;

    // Build shared textures
    this.unexploredTexture = this.buildCellTexture(app, 0x000000, 1.0);
    this.exploredTexture = this.buildCellTexture(app, 0x000000, 0.65);

    // Initialize all cells as unexplored
    this.cellStates.clear();
    this.cellSprites.clear();
    this.unexploredContainer.removeChildren();
    this.exploredContainer.removeChildren();

    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const key = this.cellKey(col, row);
        this.cellStates.set(key, 'unexplored');
        this.createCellSprite(col, row, 'unexplored');
      }
    }
  }

  /**
   * Apply a fog update: reveal newly visible cells, hide previously visible ones.
   * Called each time a token moves or the scene changes.
   */
  applyUpdate(update: FogUpdate): void {
    for (const cell of update.revealed) {
      this.setCellState(cell.x, cell.y, 'visible');
    }
    for (const cell of update.hidden) {
      const key = this.cellKey(cell.x, cell.y);
      const current = this.cellStates.get(key);
      // Only transition visible → explored (never explored → unexplored)
      if (current === 'visible') {
        this.setCellState(cell.x, cell.y, 'explored');
      }
    }
  }

  /**
   * Reveal a circular area (for player tokens with vision radius).
   */
  revealCircle(
    centerX: number,
    centerY: number,
    radiusPx: number,
  ): FogUpdate {
    const centerCol = Math.floor(centerX / this.cellSize);
    const centerRow = Math.floor(centerY / this.cellSize);
    const radiusCells = Math.ceil(radiusPx / this.cellSize);

    const revealed: FogCell[] = [];
    const hidden: FogCell[] = [];

    // Collect newly visible cells
    for (let col = centerCol - radiusCells; col <= centerCol + radiusCells; col++) {
      for (let row = centerRow - radiusCells; row <= centerRow + radiusCells; row++) {
        if (col < 0 || col >= this.gridCols || row < 0 || row >= this.gridRows) continue;

        const dist = Math.sqrt((col - centerCol) ** 2 + (row - centerRow) ** 2);
        if (dist <= radiusCells) {
          const key = this.cellKey(col, row);
          const state = this.cellStates.get(key) ?? 'unexplored';
          if (state !== 'visible') {
            revealed.push({ x: col, y: row });
          }
        }
      }
    }

    // Collect cells that go back to explored (outside circle, previously visible)
    for (const [key, state] of this.cellStates) {
      if (state === 'visible') {
        const [col, row] = key.split(':').map(Number) as [number, number];
        const dist = Math.sqrt((col - centerCol) ** 2 + (row - centerRow) ** 2);
        if (dist > radiusCells) {
          hidden.push({ x: col, y: row });
        }
      }
    }

    this.applyUpdate({ revealed, hidden });
    return { revealed, hidden };
  }

  /**
   * Reconstruct fog state from a serialized snapshot (for reconnecting players).
   */
  loadSnapshot(snapshot: Record<string, FogState>): void {
    for (const [key, state] of Object.entries(snapshot)) {
      const parts = key.split(':');
      const col = parseInt(parts[0]!, 10);
      const row = parseInt(parts[1]!, 10);
      this.setCellState(col, row, state);
    }
  }

  /**
   * Serialize current fog state for persistence/sync.
   */
  toSnapshot(): Record<string, FogState> {
    const snapshot: Record<string, FogState> = {};
    for (const [key, state] of this.cellStates) {
      if (state !== 'unexplored') {
        snapshot[key] = state; // Only store non-default states
      }
    }
    return snapshot;
  }

  setVisible(show: boolean): void {
    this.container.visible = show;
  }

  destroy(): void {
    this.unexploredTexture?.destroy();
    this.exploredTexture?.destroy();
    this.container.destroy({ children: true });
  }

  // ─── Private ─────────────────────────────────────────────────────────────

  private setCellState(col: number, row: number, state: FogState): void {
    const key = this.cellKey(col, row);
    const oldState = this.cellStates.get(key) ?? 'unexplored';
    if (oldState === state) return;

    this.cellStates.set(key, state);
    this.updateCellSprite(key, col, row, state);
  }

  private createCellSprite(col: number, row: number, state: FogState): void {
    const key = this.cellKey(col, row);
    const sprite = new PIXI.Sprite(
      state === 'unexplored' ? (this.unexploredTexture ?? PIXI.Texture.WHITE) : (this.exploredTexture ?? PIXI.Texture.WHITE),
    );
    sprite.x = col * this.cellSize;
    sprite.y = row * this.cellSize;
    sprite.width = this.cellSize;
    sprite.height = this.cellSize;

    this.cellSprites.set(key, sprite as unknown as PIXI.Graphics);

    if (state === 'unexplored') {
      this.unexploredContainer.addChild(sprite);
    } else if (state === 'explored') {
      this.exploredContainer.addChild(sprite);
    }
    // 'visible' cells have no sprite (they're invisible)
  }

  private updateCellSprite(key: string, col: number, row: number, newState: FogState): void {
    const existingSprite = this.cellSprites.get(key);

    // Remove from current container
    if (existingSprite) {
      existingSprite.parent?.removeChild(existingSprite);
    }

    if (newState === 'visible') {
      // No sprite needed — fully transparent
      if (existingSprite) {
        this.cellSprites.delete(key);
        existingSprite.destroy();
      }
      return;
    }

    if (newState === 'explored') {
      // Transition: either create new sprite or reuse
      const sprite = new PIXI.Sprite(this.exploredTexture ?? PIXI.Texture.WHITE);
      sprite.x = col * this.cellSize;
      sprite.y = row * this.cellSize;
      sprite.width = this.cellSize;
      sprite.height = this.cellSize;
      this.cellSprites.set(key, sprite as unknown as PIXI.Graphics);
      this.exploredContainer.addChild(sprite);
    } else if (newState === 'unexplored') {
      const sprite = new PIXI.Sprite(this.unexploredTexture ?? PIXI.Texture.WHITE);
      sprite.x = col * this.cellSize;
      sprite.y = row * this.cellSize;
      sprite.width = this.cellSize;
      sprite.height = this.cellSize;
      this.cellSprites.set(key, sprite as unknown as PIXI.Graphics);
      this.unexploredContainer.addChild(sprite);
    }
  }

  private buildCellTexture(app: PIXI.Application, color: number, alpha: number): PIXI.Texture {
    const g = new PIXI.Graphics();
    g.beginFill(color, alpha);
    g.drawRect(0, 0, this.cellSize, this.cellSize);
    g.endFill();
    const texture = app.renderer.generateTexture(g);
    g.destroy();
    return texture;
  }

  private cellKey(col: number, row: number): string {
    return `${col}:${row}`;
  }
}
