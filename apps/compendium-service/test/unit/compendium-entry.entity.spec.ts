import { CompendiumEntry } from '../../src/domain/entry/entry.entity';
import { EntryType } from '../../src/domain/entry/entry.entity';

describe('CompendiumEntry', () => {
  const baseProps = {
    name: 'Humano',
    description: 'A raça mais versátil de Arton.',
    type: EntryType.RACE,
    system: 'tormenta20' as const,
    tags: ['raça', 'humano'],
    attributes: [{ key: 'displacement', value: '9m', label: 'Deslocamento' }],
    relations: [],
    isHomebrew: false,
    isPublic: true,
    createdBy: 'user-123',
  };

  describe('create()', () => {
    it('should create an entry with a generated id', () => {
      const entry = CompendiumEntry.create(baseProps);
      expect(entry.id).toBeDefined();
      expect(entry.id.length).toBeGreaterThan(0);
    });

    it('should generate a slug from name', () => {
      const entry = CompendiumEntry.create(baseProps);
      expect(entry.slug).toBe('humano');
    });

    it('should slugify names with accents', () => {
      const entry = CompendiumEntry.create({ ...baseProps, name: 'Anão Montanhês' });
      expect(entry.slug).toBe('anao-montanhes');
    });

    it('should set version to 1', () => {
      const entry = CompendiumEntry.create(baseProps);
      expect(entry.version).toBe(1);
    });

    it('should build search vector from name, tags and attributes', () => {
      const entry = CompendiumEntry.create(baseProps);
      expect(entry.searchVector).toContain('humano');
      expect(entry.searchVector).toContain('raça');
      expect(entry.searchVector).toContain('deslocamento');
    });

    it('should set createdAt and updatedAt to now', () => {
      const before = new Date();
      const entry = CompendiumEntry.create(baseProps);
      const after = new Date();
      expect(entry.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(entry.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('update()', () => {
    it('should increment version on update', () => {
      const entry = CompendiumEntry.create(baseProps);
      entry.update({ name: 'Humano Revisado' });
      expect(entry.version).toBe(2);
    });

    it('should update slug when name changes', () => {
      const entry = CompendiumEntry.create(baseProps);
      entry.update({ name: 'Nova Raça' });
      expect(entry.slug).toBe('nova-raca');
    });

    it('should update search vector after update', () => {
      const entry = CompendiumEntry.create(baseProps);
      const oldVector = entry.searchVector;
      entry.update({ description: 'Descrição completamente nova e diferente' });
      expect(entry.searchVector).not.toBe(oldVector);
    });

    it('should update updatedAt timestamp', async () => {
      const entry = CompendiumEntry.create(baseProps);
      const originalDate = entry.updatedAt;
      await new Promise((r) => setTimeout(r, 5));
      entry.update({ tags: ['raça', 'humano', 'novo'] });
      expect(entry.updatedAt.getTime()).toBeGreaterThan(originalDate.getTime());
    });
  });

  describe('addTag()', () => {
    it('should add a tag', () => {
      const entry = CompendiumEntry.create(baseProps);
      entry.addTag('versátil');
      expect(entry.tags).toContain('versátil');
    });

    it('should normalize tags to lowercase', () => {
      const entry = CompendiumEntry.create(baseProps);
      entry.addTag('GUERREIRO');
      expect(entry.tags).toContain('guerreiro');
    });

    it('should not add duplicate tags', () => {
      const entry = CompendiumEntry.create(baseProps);
      entry.addTag('humano');
      expect(entry.tags.filter((t) => t === 'humano')).toHaveLength(1);
    });
  });

  describe('removeTag()', () => {
    it('should remove an existing tag', () => {
      const entry = CompendiumEntry.create(baseProps);
      entry.removeTag('humano');
      expect(entry.tags).not.toContain('humano');
    });

    it('should not throw when removing non-existent tag', () => {
      const entry = CompendiumEntry.create(baseProps);
      expect(() => entry.removeTag('nao-existe')).not.toThrow();
    });
  });

  describe('setAttribute()', () => {
    it('should add a new attribute', () => {
      const entry = CompendiumEntry.create(baseProps);
      entry.setAttribute('speed', 9, 'Velocidade');
      expect(entry.getAttribute('speed')).toEqual({ key: 'speed', value: 9, label: 'Velocidade' });
    });

    it('should update an existing attribute', () => {
      const entry = CompendiumEntry.create(baseProps);
      entry.setAttribute('displacement', '12m');
      expect(entry.getAttribute('displacement')?.value).toBe('12m');
    });
  });

  describe('canBeEditedBy()', () => {
    it('should allow admin to edit any entry', () => {
      const entry = CompendiumEntry.create({ ...baseProps, isHomebrew: false, isPublic: true });
      expect(entry.canBeEditedBy('any-user', true)).toBe(true);
    });

    it('should allow creator to edit their own homebrew', () => {
      const entry = CompendiumEntry.create({ ...baseProps, isHomebrew: true, createdBy: 'user-123' });
      expect(entry.canBeEditedBy('user-123', false)).toBe(true);
    });

    it('should not allow other users to edit homebrew', () => {
      const entry = CompendiumEntry.create({ ...baseProps, isHomebrew: true, createdBy: 'user-123' });
      expect(entry.canBeEditedBy('user-456', false)).toBe(false);
    });

    it('should not allow non-admin to edit official entries', () => {
      const entry = CompendiumEntry.create({ ...baseProps, isHomebrew: false, isPublic: true });
      (entry as any).isOfficial = true;
      expect(entry.canBeEditedBy('user-123', false)).toBe(false);
    });
  });

  describe('slugify()', () => {
    it.each([
      ['Humano', 'humano'],
      ['Anão das Montanhas', 'anao-das-montanhas'],
      ['D&D Style', 'dd-style'],
      ['  Spaces  ', 'spaces'],
      ['Multiple---Dashes', 'multiple-dashes'],
    ])('slugifies "%s" to "%s"', (input, expected) => {
      expect(CompendiumEntry.slugify(input)).toBe(expected);
    });
  });
});
