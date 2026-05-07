import { generateId } from '@vtt/shared-utils';
import type { LightSource, Position } from '@vtt/shared-types';
import { LineOfSightEngine } from '../fog/entities/line-of-sight.engine';
import type { Wall } from '@vtt/shared-types';

export interface IlluminatedArea {
  lightId: string;
  brightPolygon: Position[];
  dimPolygon: Position[];
}

export class LightingEngine {
  private readonly los = new LineOfSightEngine();

  createLightSource(props: Omit<LightSource, 'id'>): LightSource {
    return { id: generateId(), ...props };
  }

  /**
   * Compute illuminated areas for all light sources on a map.
   * Returns bright and dim polygons per light source.
   */
  computeIllumination(lights: LightSource[], walls: Wall[]): IlluminatedArea[] {
    return lights.map((light) => ({
      lightId: light.id,
      brightPolygon: this.los.computeVisibilityPolygon(
        light.position,
        walls,
        light.brightRadius,
      ),
      dimPolygon: this.los.computeVisibilityPolygon(
        light.position,
        walls,
        light.radius,
      ),
    }));
  }

  /**
   * Determine if a position is illuminated (bright or dim) by any light source.
   */
  getIlluminationLevel(
    position: Position,
    lights: LightSource[],
    walls: Wall[],
  ): 'bright' | 'dim' | 'dark' {
    for (const light of lights) {
      const dist = this.los.distance(position, light.position);
      if (dist > light.radius) continue;
      if (!this.los.hasLineOfSight(light.position, position, walls)) continue;
      if (dist <= light.brightRadius) return 'bright';
      return 'dim';
    }
    return 'dark';
  }
}
