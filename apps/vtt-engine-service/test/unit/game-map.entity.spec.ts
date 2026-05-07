import { GameMap } from '../../src/domain/map/entities/game-map.entity';
import { GridType } from '@vtt/shared-types';

const baseProps = {
  campaignId: 'c1',
  name: 'Dungeon',
  imageUrl: 'https://example.com/map.png',
  gridType: GridType.SQUARE,
  width: 1400,
  height: 1400,
};

describe('GameMap entity', () => {
  it('creates with default layers and empty walls', () => {
    const map = GameMap.create(baseProps);
    expect(map.id).toBeDefined();
    expect(map.layers).toHaveLength(5);
    expect(map.walls).toHaveLength(0);
    expect(map.gridSize).toBe(70);
  });

  it('trims name on create', () => {
    const map = GameMap.create({ ...baseProps, name: '  Dungeon  ' });
    expect(map.name).toBe('Dungeon');
  });

  it('adds a wall and returns it with generated id', () => {
    const map = GameMap.create(baseProps);
    const wall = map.addWall({ start: { x: 0, y: 0 }, end: { x: 70, y: 0 }, blocksLight: true, blocksMovement: true });
    expect(wall.id).toBeDefined();
    expect(map.walls).toHaveLength(1);
  });

  it('removes a wall by id', () => {
    const map = GameMap.create(baseProps);
    const wall = map.addWall({ start: { x: 0, y: 0 }, end: { x: 70, y: 0 }, blocksLight: true, blocksMovement: true });
    map.removeWall(wall.id);
    expect(map.walls).toHaveLength(0);
  });

  it('snaps position to grid', () => {
    const map = GameMap.create(baseProps);
    const snapped = map.snapToGrid({ x: 45, y: 55 });
    expect(snapped.x).toBe(70);
    expect(snapped.y).toBe(70);
  });

  it('snaps to nearest grid cell', () => {
    const map = GameMap.create(baseProps);
    const snapped = map.snapToGrid({ x: 30, y: 30 });
    expect(snapped.x).toBe(0);
    expect(snapped.y).toBe(0);
  });

  it('isWithinBounds returns true for valid position', () => {
    const map = GameMap.create(baseProps);
    expect(map.isWithinBounds({ x: 700, y: 700 })).toBe(true);
  });

  it('isWithinBounds returns false for out-of-bounds position', () => {
    const map = GameMap.create(baseProps);
    expect(map.isWithinBounds({ x: 2000, y: 700 })).toBe(false);
  });

  it('sets layer visibility', () => {
    const map = GameMap.create(baseProps);
    const layerId = map.layers[0]!.id;
    map.setLayerVisibility(layerId, false);
    expect(map.layers[0]!.visible).toBe(false);
  });

  it('reconstitutes from persistence', () => {
    const now = new Date();
    const map = GameMap.reconstitute({
      id: 'map-1', campaignId: 'c1', name: 'Test', imageUrl: 'url',
      gridType: GridType.SQUARE, gridSize: 70, width: 1400, height: 1400,
      layers: [], walls: [], createdAt: now, updatedAt: now,
    });
    expect(map.id).toBe('map-1');
  });
});
