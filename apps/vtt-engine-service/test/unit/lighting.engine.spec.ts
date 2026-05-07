import { LightingEngine } from '../../src/domain/lighting/entities/lighting.engine';
import type { LightSource, Wall } from '@vtt/shared-types';

describe('LightingEngine', () => {
  let engine: LightingEngine;

  const torch: LightSource = {
    id: 'light-1',
    tokenId: 'token-1',
    position: { x: 0, y: 0 },
    radius: 120,
    brightRadius: 60,
    color: '#ffaa00',
    intensity: 1,
  };

  beforeEach(() => {
    engine = new LightingEngine();
  });

  it('creates a light source with generated id', () => {
    const light = engine.createLightSource({
      tokenId: null,
      position: { x: 100, y: 100 },
      radius: 100,
      brightRadius: 50,
      color: '#ffffff',
      intensity: 1,
    });
    expect(light.id).toBeDefined();
    expect(light.radius).toBe(100);
  });

  it('computes illumination areas for each light', () => {
    const areas = engine.computeIllumination([torch], []);
    expect(areas).toHaveLength(1);
    expect(areas[0]!.lightId).toBe('light-1');
    expect(areas[0]!.brightPolygon.length).toBeGreaterThan(0);
    expect(areas[0]!.dimPolygon.length).toBeGreaterThan(0);
  });

  it('returns bright for position within bright radius with no walls', () => {
    const level = engine.getIlluminationLevel({ x: 30, y: 0 }, [torch], []);
    expect(level).toBe('bright');
  });

  it('returns dim for position between bright and full radius', () => {
    const level = engine.getIlluminationLevel({ x: 80, y: 0 }, [torch], []);
    expect(level).toBe('dim');
  });

  it('returns dark for position beyond light radius', () => {
    const level = engine.getIlluminationLevel({ x: 500, y: 0 }, [torch], []);
    expect(level).toBe('dark');
  });

  it('returns dark when wall blocks line of sight to light', () => {
    const wall: Wall = {
      id: 'w1',
      start: { x: 40, y: -50 },
      end: { x: 40, y: 50 },
      blocksLight: true,
      blocksMovement: true,
    };
    const level = engine.getIlluminationLevel({ x: 80, y: 0 }, [torch], [wall]);
    expect(level).toBe('dark');
  });

  it('returns dark when no lights', () => {
    const level = engine.getIlluminationLevel({ x: 0, y: 0 }, [], []);
    expect(level).toBe('dark');
  });
});
