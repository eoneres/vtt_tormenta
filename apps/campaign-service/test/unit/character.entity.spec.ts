import { Character } from '../../src/domain/character/entities/character.entity';

describe('Character entity', () => {
  it('creates with defaults', () => {
    const c = Character.create({ userId: 'u1', campaignId: 'c1', systemId: 'tormenta20', name: 'Aldric' });
    expect(c.id).toBeDefined();
    expect(c.sheetData).toEqual({});
    expect(c.name).toBe('Aldric');
  });

  it('trims name on create', () => {
    const c = Character.create({ userId: 'u1', campaignId: 'c1', systemId: 'tormenta20', name: '  Aldric  ' });
    expect(c.name).toBe('Aldric');
  });

  it('updates sheet data (merge)', () => {
    const c = Character.create({ userId: 'u1', campaignId: 'c1', systemId: 'tormenta20', name: 'A' });
    c.updateSheet({ forca: 16 });
    c.updateSheet({ destreza: 14 });
    expect(c.sheetData['forca']).toBe(16);
    expect(c.sheetData['destreza']).toBe(14);
  });

  it('renames character', () => {
    const c = Character.create({ userId: 'u1', campaignId: 'c1', systemId: 'tormenta20', name: 'Old' });
    c.rename('New Name');
    expect(c.name).toBe('New Name');
  });

  it('isOwnedBy returns correct result', () => {
    const c = Character.create({ userId: 'u1', campaignId: 'c1', systemId: 'tormenta20', name: 'A' });
    expect(c.isOwnedBy('u1')).toBe(true);
    expect(c.isOwnedBy('u2')).toBe(false);
  });
});
