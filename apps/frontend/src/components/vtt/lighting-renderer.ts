import * as PIXI from 'pixi.js';
import type {
  ShadowCastResult,
  LightingSceneResult,
  RGBAColor,
} from '../../../../../apps/vtt-engine-service/src/domain/lighting/entities/advanced-lighting.engine';

// Re-export types for convenience
export type { ShadowCastResult, LightingSceneResult };

/**
 * LightingRenderer
 *
 * Converts AdvancedLightingEngine polygon results into PixiJS Graphics draw calls.
 * Uses a PIXI.Container with multiple layers:
 *
 *   darknessMask  — full-black overlay covering entire map
 *   dimLayer      — semi-transparent bleed around bright areas
 *   brightLayer   — fully lit areas punched out of darkness
 *   lightTints    — colored light overlays (torchlight, magical glow)
 *
 * Rendering technique: "Punch-out" using PixiJS blend modes
 *   - darkness layer filled with black at full alpha
 *   - bright/dim polygons drawn with ERASE blend mode to reveal the map below
 *   - color tints drawn on top with MULTIPLY blend for atmospheric color
 */
export class LightingRenderer {
  private readonly container: PIXI.Container;
  private readonly darknessMask: PIXI.Graphics;
  private readonly dimReveal: PIXI.Graphics;
  private readonly brightReveal: PIXI.Graphics;
  private readonly colorTints: PIXI.Container;
  private readonly penumbraReveal: PIXI.Graphics;

  private mapWidth = 2000;
  private mapHeight = 2000;

  constructor() {
    this.container = new PIXI.Container();
    this.container.name = 'lightingLayer';

    // Layer 0: full darkness
    this.darknessMask = new PIXI.Graphics();
    this.darknessMask.name = 'darknessMask';

    // Layer 1: penumbra (soft shadow edge)
    this.penumbraReveal = new PIXI.Graphics();
    this.penumbraReveal.name = 'penumbraReveal';

    // Layer 2: dim light reveal
    this.dimReveal = new PIXI.Graphics();
    this.dimReveal.name = 'dimReveal';

    // Layer 3: bright light reveal
    this.brightReveal = new PIXI.Graphics();
    this.brightReveal.name = 'brightReveal';

    // Layer 4: colored tints on top
    this.colorTints = new PIXI.Container();
    this.colorTints.name = 'colorTints';
    this.colorTints.blendMode = PIXI.BLEND_MODES.MULTIPLY;

    this.container.addChild(
      this.darknessMask,
      this.penumbraReveal,
      this.dimReveal,
      this.brightReveal,
      this.colorTints,
    );
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  getContainer(): PIXI.Container {
    return this.container;
  }

  setMapSize(width: number, height: number): void {
    this.mapWidth = width;
    this.mapHeight = height;
  }

  /**
   * Full re-render from a LightingSceneResult.
   * Call this when light sources or walls change.
   */
  render(scene: LightingSceneResult, ambientAlpha: number = 0.92): void {
    this.clear();

    // Draw the darkness base
    this.darknessMask.beginFill(0x000000, ambientAlpha);
    this.darknessMask.drawRect(0, 0, this.mapWidth, this.mapHeight);
    this.darknessMask.endFill();

    // Process each light source
    for (const lightResult of scene.lightResults) {
      this.renderLight(lightResult);
    }
  }

  /**
   * Partial update: re-render a single light source.
   * More efficient when only one light moved (e.g. player moved with a torch).
   */
  renderSingleLight(lightResult: ShadowCastResult): void {
    // For partial updates, we redraw everything for that light
    // A full optimization would use RenderTextures per light source
    this.renderLight(lightResult);
  }

  // ─── Private ─────────────────────────────────────────────────────────────

  private renderLight(lightResult: ShadowCastResult): void {
    if (lightResult.dimPolygon.length < 3) return;

    // ─── Dim reveal (erases darkness at 60% opacity) ──────────────────
    if (lightResult.dimPolygon.length >= 3) {
      const dimAlpha = lightResult.dimColor.a * 0.6;
      this.dimReveal.beginFill(0xffffff, dimAlpha);
      this.dimReveal.blendMode = PIXI.BLEND_MODES.ERASE;
      this.drawPolygon(this.dimReveal, lightResult.dimPolygon);
      this.dimReveal.endFill();
    }

    // ─── Penumbra (soft edge between bright and dim) ──────────────────
    if (lightResult.penumbraPolygon.length >= 3) {
      const penAlpha = lightResult.penumbraColor.a * 0.8;
      this.penumbraReveal.beginFill(0xffffff, penAlpha);
      this.penumbraReveal.blendMode = PIXI.BLEND_MODES.ERASE;
      this.drawPolygon(this.penumbraReveal, lightResult.penumbraPolygon);
      this.penumbraReveal.endFill();
    }

    // ─── Bright reveal (fully erases darkness) ────────────────────────
    if (lightResult.brightPolygon.length >= 3) {
      this.brightReveal.beginFill(0xffffff, 1.0);
      this.brightReveal.blendMode = PIXI.BLEND_MODES.ERASE;
      this.drawPolygon(this.brightReveal, lightResult.brightPolygon);
      this.brightReveal.endFill();
    }

    // ─── Color tint overlay ───────────────────────────────────────────
    if (lightResult.color !== '#ffffff' && lightResult.intensity > 0) {
      const tintGraphic = new PIXI.Graphics();
      const hexColor = this.rgbaToHex(lightResult.brightColor);
      const tintAlpha = lightResult.brightColor.a * 0.25; // subtle color wash
      tintGraphic.beginFill(hexColor, tintAlpha);
      tintGraphic.blendMode = PIXI.BLEND_MODES.MULTIPLY;
      if (lightResult.dimPolygon.length >= 3) {
        this.drawPolygon(tintGraphic, lightResult.dimPolygon);
      }
      tintGraphic.endFill();
      this.colorTints.addChild(tintGraphic);
    }
  }

  private drawPolygon(
    graphics: PIXI.Graphics,
    points: Array<{ x: number; y: number }>,
  ): void {
    if (points.length < 3) return;
    const flat: number[] = [];
    for (const p of points) {
      flat.push(p.x, p.y);
    }
    graphics.drawPolygon(flat);
  }

  private clear(): void {
    this.darknessMask.clear();
    this.dimReveal.clear();
    this.penumbraReveal.clear();
    this.brightReveal.clear();
    // Remove old tint children
    this.colorTints.removeChildren();
  }

  private rgbaToHex(color: RGBAColor): number {
    return (color.r << 16) | (color.g << 8) | color.b;
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
