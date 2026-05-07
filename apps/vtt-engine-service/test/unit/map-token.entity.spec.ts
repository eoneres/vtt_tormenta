import { MapToken } from '../../src/domain/token/entities/map-token.entity';

const baseProps = {
  mapId: 'map-1',
  name: 'Aldric',
  imageUrl: 'https://example.com/token.png',
  position: { x: 70, y: 70 },
};

describe('MapToken entity', () => {
  it('creates with defaults', () => {
    const token = MapToken.create(baseProps);
    expect(token.id).toBeDefined();
    expect(token.size).toBe(1);
    expect(token.conditions).toEqual([]);
    expect(token.isVisible).toBe(true);
    expect(token.characterId).toBeNull();
  });

  it('moves to new position', () => {
    const token = MapToken.create(baseProps);
    token.moveTo({ x: 140, y: 140 });
    expect(token.position).toEqual({ x: 140, y: 140 });
  });

  it('applies condition (no duplicates)', () => {
    const token = MapToken.create(baseProps);
    token.applyCondition('abalado');
    token.applyCondition('abalado');
    expect(token.conditions).toEqual(['abalado']);
  });

  it('removes condition', () => {
    const token = MapToken.create(baseProps);
    token.applyCondition('cego');
    token.removeCondition('cego');
    expect(token.conditions).toHaveLength(0);
  });

  it('clamps hp to maxHp', () => {
    const token = MapToken.create({ ...baseProps, hp: 10, maxHp: 20 });
    token.updateHp(30);
    expect(token.hp).toBe(20);
  });

  it('clamps hp to 0 minimum', () => {
    const token = MapToken.create({ ...baseProps, hp: 10, maxHp: 20 });
    token.updateHp(-5);
    expect(token.hp).toBe(0);
  });

  it('sets visibility', () => {
    const token = MapToken.create(baseProps);
    token.setVisibility(false);
    expect(token.isVisible).toBe(false);
  });

  it('isControlledBy returns correct result', () => {
    const token = MapToken.create({ ...baseProps, controlledBy: ['u1', 'u2'] });
    expect(token.isControlledBy('u1')).toBe(true);
    expect(token.isControlledBy('u3')).toBe(false);
  });
});
