import * as PIXI from 'pixi.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MeasureMode = 'line' | 'circle' | 'cone' | 'rect' | 'none';

export interface MeasurementConfig {
  gridSize: number;       // pixels per grid cell
  cellRealSize: number;   // real-world size per cell in meters (e.g. 1.5 for T20)
  lineColor?: number;
  fillColor?: number;
  lineAlpha?: number;
  fillAlpha?: number;
}

export interface MeasurementResult {
  distancePx: number;
  distanceM: number;
  distanceCells: number;
  area?: number;    // square meters (for circle/rect/cone)
  cells?: number;   // cells covered (for cone/circle/rect)
}

/**
 * MeasurementTool
 *
 * Interactive measurement overlay for the VTT canvas.
 *
 * Usage:
 *   const tool = new MeasurementTool(config);
 *   stage.addChild(tool.getContainer());
 *   tool.setMode('line');
 *
 *   // on mouse events:
 *   tool.startMeasure(startX, startY);
 *   tool.updateMeasure(currentX, currentY);
 *   tool.endMeasure();
 */
export class MeasurementTool {
  private readonly container: PIXI.Container;
  private readonly lineGraphics: PIXI.Graphics;
  private readonly areaGraphics: PIXI.Graphics;
  private readonly labelContainer: PIXI.Container;

  private mode: MeasureMode = 'none';
  private startX = 0;
  private startY = 0;
  private isActive = false;
  private currentLabel: PIXI.Text | null = null;

  private readonly config: Required<MeasurementConfig>;

  constructor(config: MeasurementConfig) {
    this.config = {
      lineColor: 0x7c3aed,
      fillColor: 0x7c3aed,
      lineAlpha: 0.9,
      fillAlpha: 0.15,
      ...config,
    };

    this.container = new PIXI.Container();
    this.container.name = 'measurementTool';
    this.container.zIndex = 1000;

    this.areaGraphics = new PIXI.Graphics();
    this.lineGraphics = new PIXI.Graphics();
    this.labelContainer = new PIXI.Container();

    this.container.addChild(this.areaGraphics, this.lineGraphics, this.labelContainer);
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  getContainer(): PIXI.Container {
    return this.container;
  }

  setMode(mode: MeasureMode): void {
    this.mode = mode;
    if (mode === 'none') {
      this.clear();
    }
  }

  getMode(): MeasureMode {
    return this.mode;
  }

  startMeasure(x: number, y: number): void {
    if (this.mode === 'none') return;
    this.startX = this.snapToGrid(x);
    this.startY = this.snapToGrid(y);
    this.isActive = true;
    this.clear();
  }

  updateMeasure(x: number, y: number): MeasurementResult | null {
    if (!this.isActive || this.mode === 'none') return null;
    const endX = this.snapToGrid(x);
    const endY = this.snapToGrid(y);
    return this.draw(endX, endY);
  }

  endMeasure(): void {
    this.isActive = false;
    // Keep the measurement visible until mode changes or new measure starts
  }

  clear(): void {
    this.lineGraphics.clear();
    this.areaGraphics.clear();
    this.labelContainer.removeChildren();
    this.currentLabel = null;
    this.isActive = false;
  }

  // ─── Drawing ─────────────────────────────────────────────────────────────

  private draw(endX: number, endY: number): MeasurementResult {
    this.lineGraphics.clear();
    this.areaGraphics.clear();
    this.labelContainer.removeChildren();

    const result = this.calculate(endX, endY);

    switch (this.mode) {
      case 'line':   this.drawLine(endX, endY, result); break;
      case 'circle': this.drawCircle(endX, endY, result); break;
      case 'cone':   this.drawCone(endX, endY, result); break;
      case 'rect':   this.drawRect(endX, endY, result); break;
    }

    this.drawLabel(endX, endY, result);
    return result;
  }

  private drawLine(endX: number, endY: number, result: MeasurementResult): void {
    // Dashed line
    this.lineGraphics.lineStyle(2, this.config.lineColor, this.config.lineAlpha);
    this.lineGraphics.moveTo(this.startX, this.startY);
    this.lineGraphics.lineTo(endX, endY);

    // Start dot
    this.lineGraphics.beginFill(this.config.lineColor, 1.0);
    this.lineGraphics.drawCircle(this.startX, this.startY, 5);
    this.lineGraphics.drawCircle(endX, endY, 5);
    this.lineGraphics.endFill();

    // Waypoint circles at each grid cell
    this.drawWaypoints(endX, endY);
  }

  private drawCircle(endX: number, endY: number, result: MeasurementResult): void {
    const radius = result.distancePx;

    // Area fill
    this.areaGraphics.beginFill(this.config.fillColor, this.config.fillAlpha);
    this.areaGraphics.drawCircle(this.startX, this.startY, radius);
    this.areaGraphics.endFill();

    // Border
    this.lineGraphics.lineStyle(2, this.config.lineColor, this.config.lineAlpha);
    this.lineGraphics.drawCircle(this.startX, this.startY, radius);

    // Center
    this.lineGraphics.beginFill(this.config.lineColor, 1.0);
    this.lineGraphics.drawCircle(this.startX, this.startY, 4);
    this.lineGraphics.endFill();
  }

  private drawCone(endX: number, endY: number, result: MeasurementResult): void {
    const angle = Math.atan2(endY - this.startY, endX - this.startX);
    const halfAngle = Math.PI / 6; // 60° cone
    const length = result.distancePx;

    const p1x = this.startX + Math.cos(angle - halfAngle) * length;
    const p1y = this.startY + Math.sin(angle - halfAngle) * length;
    const p2x = this.startX + Math.cos(angle + halfAngle) * length;
    const p2y = this.startY + Math.sin(angle + halfAngle) * length;

    // Fill
    this.areaGraphics.beginFill(this.config.fillColor, this.config.fillAlpha);
    this.areaGraphics.moveTo(this.startX, this.startY);
    this.areaGraphics.lineTo(p1x, p1y);
    this.areaGraphics.arc(this.startX, this.startY, length, angle - halfAngle, angle + halfAngle);
    this.areaGraphics.lineTo(this.startX, this.startY);
    this.areaGraphics.endFill();

    // Border
    this.lineGraphics.lineStyle(2, this.config.lineColor, this.config.lineAlpha);
    this.lineGraphics.moveTo(this.startX, this.startY);
    this.lineGraphics.lineTo(p1x, p1y);
    this.lineGraphics.arc(this.startX, this.startY, length, angle - halfAngle, angle + halfAngle);
    this.lineGraphics.lineTo(this.startX, this.startY);
  }

  private drawRect(endX: number, endY: number, result: MeasurementResult): void {
    const x = Math.min(this.startX, endX);
    const y = Math.min(this.startY, endY);
    const w = Math.abs(endX - this.startX);
    const h = Math.abs(endY - this.startY);

    // Fill
    this.areaGraphics.beginFill(this.config.fillColor, this.config.fillAlpha);
    this.areaGraphics.drawRect(x, y, w, h);
    this.areaGraphics.endFill();

    // Border
    this.lineGraphics.lineStyle(2, this.config.lineColor, this.config.lineAlpha);
    this.lineGraphics.drawRect(x, y, w, h);
  }

  private drawWaypoints(endX: number, endY: number): void {
    const dx = endX - this.startX;
    const dy = endY - this.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const stepPx = this.config.gridSize;
    const steps = Math.floor(dist / stepPx);

    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const wx = this.startX + dx * t;
      const wy = this.startY + dy * t;
      this.lineGraphics.beginFill(this.config.lineColor, 0.5);
      this.lineGraphics.drawCircle(wx, wy, 3);
      this.lineGraphics.endFill();
    }
  }

  private drawLabel(endX: number, endY: number, result: MeasurementResult): void {
    const label = new PIXI.Text(this.formatResult(result), {
      fontSize: 13,
      fontFamily: 'JetBrains Mono, monospace',
      fontWeight: 'bold',
      fill: 0xffffff,
      dropShadow: true,
      dropShadowColor: 0x000000,
      dropShadowDistance: 2,
      dropShadowAlpha: 0.8,
    });

    const bg = new PIXI.Graphics();
    bg.beginFill(0x1a1d2e, 0.85);
    bg.drawRoundedRect(-4, -2, label.width + 8, label.height + 4, 4);
    bg.endFill();

    const group = new PIXI.Container();
    group.addChild(bg, label);
    group.x = endX + 10;
    group.y = endY - 16;
    this.labelContainer.addChild(group);
    this.currentLabel = label;
  }

  // ─── Calculation ──────────────────────────────────────────────────────────

  private calculate(endX: number, endY: number): MeasurementResult {
    const dx = endX - this.startX;
    const dy = endY - this.startY;

    // Diagonal rule: T20 uses Euclidean; D&D 5e uses Chebyshev (5-5-5)
    const distancePx = Math.sqrt(dx * dx + dy * dy);
    const distanceCells = distancePx / this.config.gridSize;
    const distanceM = distanceCells * this.config.cellRealSize;

    let area: number | undefined;
    let cells: number | undefined;

    if (this.mode === 'circle') {
      area = Math.PI * distanceM * distanceM;
      cells = Math.floor(area / (this.config.cellRealSize ** 2));
    } else if (this.mode === 'rect') {
      const widthM = (Math.abs(dx) / this.config.gridSize) * this.config.cellRealSize;
      const heightM = (Math.abs(dy) / this.config.gridSize) * this.config.cellRealSize;
      area = widthM * heightM;
      cells = Math.floor(area / (this.config.cellRealSize ** 2));
    } else if (this.mode === 'cone') {
      area = (Math.PI * distanceM * distanceM) / 6; // 60° = 1/6 of circle
      cells = Math.floor(area / (this.config.cellRealSize ** 2));
    }

    return { distancePx, distanceM, distanceCells, area, cells };
  }

  private formatResult(result: MeasurementResult): string {
    const m = result.distanceM.toFixed(1);
    const cells = result.distanceCells.toFixed(1);

    if (result.area !== undefined) {
      return `${m}m (${cells} quadrados)\nÁrea: ~${result.area.toFixed(0)}m²`;
    }
    return `${m}m (${cells} quadrados)`;
  }

  private snapToGrid(value: number): number {
    return Math.round(value / this.config.gridSize) * this.config.gridSize;
  }
}
