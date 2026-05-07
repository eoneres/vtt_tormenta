import { LineOfSightEngine } from '../../src/domain/fog/entities/line-of-sight.engine';
import type { Wall } from '@vtt/shared-types';

describe('LineOfSightEngine', () => {
  let engine: LineOfSightEngine;

  beforeEach(() => {
    engine = new LineOfSightEngine();
  });

  describe('hasLineOfSight', () => {
    it('returns true when no walls between observer and target', () => {
      const result = engine.hasLineOfSight({ x: 0, y: 0 }, { x: 100, y: 0 }, []);
      expect(result).toBe(true);
    });

    it('returns false when a blocking wall is between observer and target', () => {
      const wall: Wall = {
        id: 'w1',
        start: { x: 50, y: -50 },
        end: { x: 50, y: 50 },
        blocksLight: true,
        blocksMovement: true,
      };
      const result = engine.hasLineOfSight({ x: 0, y: 0 }, { x: 100, y: 0 }, [wall]);
      expect(result).toBe(false);
    });

    it('ignores walls that do not block light', () => {
      const wall: Wall = {
        id: 'w1',
        start: { x: 50, y: -50 },
        end: { x: 50, y: 50 },
        blocksLight: false,
        blocksMovement: true,
      };
      const result = engine.hasLineOfSight({ x: 0, y: 0 }, { x: 100, y: 0 }, [wall]);
      expect(result).toBe(true);
    });

    it('returns true when wall does not intersect the line of sight', () => {
      const wall: Wall = {
        id: 'w1',
        start: { x: 200, y: -50 },
        end: { x: 200, y: 50 },
        blocksLight: true,
        blocksMovement: true,
      };
      const result = engine.hasLineOfSight({ x: 0, y: 0 }, { x: 100, y: 0 }, [wall]);
      expect(result).toBe(true);
    });
  });

  describe('computeVisibilityPolygon', () => {
    it('returns a polygon with points when no walls', () => {
      const polygon = engine.computeVisibilityPolygon({ x: 0, y: 0 }, [], 100);
      expect(polygon.length).toBeGreaterThan(0);
    });

    it('returns a polygon with walls present', () => {
      const wall: Wall = {
        id: 'w1',
        start: { x: 50, y: -50 },
        end: { x: 50, y: 50 },
        blocksLight: true,
        blocksMovement: true,
      };
      const polygon = engine.computeVisibilityPolygon({ x: 0, y: 0 }, [wall], 200);
      expect(polygon.length).toBeGreaterThan(0);
    });
  });

  describe('distance', () => {
    it('calculates distance correctly', () => {
      expect(engine.distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    });

    it('returns 0 for same point', () => {
      expect(engine.distance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
    });
  });
});
