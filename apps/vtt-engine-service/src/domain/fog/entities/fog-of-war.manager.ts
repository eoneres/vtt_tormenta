import type { FogOfWarState, Position, Wall } from '@vtt/shared-types';
import { LineOfSightEngine } from './line-of-sight.engine';

export class FogOfWarManager {
  private readonly los = new LineOfSightEngine();

  /**
   * Reveal area around a token position given its sight radius.
   * Returns updated FogOfWarState with the new revealed polygon merged in.
   */
  revealAroundToken(
    state: FogOfWarState,
    tokenId: string,
    position: Position,
    sightRadius: number,
    walls: Wall[],
  ): FogOfWarState {
    const polygon = this.los.computeVisibilityPolygon(position, walls, sightRadius);

    const existing = state.revealedAreas.filter((a) => a.tokenId !== tokenId);

    return {
      ...state,
      revealedAreas: [...existing, { tokenId, polygon }],
    };
  }

  /**
   * Check if a position is within any revealed area (point-in-polygon test).
   */
  isRevealed(state: FogOfWarState, position: Position): boolean {
    return state.revealedAreas.some((area) =>
      this.pointInPolygon(position, area.polygon),
    );
  }

  /**
   * Reset fog — remove all revealed areas.
   */
  reset(state: FogOfWarState): FogOfWarState {
    return { ...state, revealedAreas: [] };
  }

  /**
   * Ray casting algorithm for point-in-polygon.
   */
  private pointInPolygon(point: Position, polygon: Position[]): boolean {
    if (polygon.length < 3) return false;
    let inside = false;
    const { x, y } = point;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i]!.x, yi = polygon[i]!.y;
      const xj = polygon[j]!.x, yj = polygon[j]!.y;

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  }
}
