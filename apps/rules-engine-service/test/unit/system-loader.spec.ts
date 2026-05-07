import { SystemLoader } from '../../src/domain/system/entities/system-loader';
import { join } from 'path';

const SYSTEMS_DIR = join(__dirname, '../../systems');

describe('SystemLoader', () => {
  let loader: SystemLoader;

  beforeEach(() => {
    loader = new SystemLoader(SYSTEMS_DIR);
    loader.loadAll();
  });

  it('loads tormenta20 system', () => {
    expect(loader.has('tormenta20')).toBe(true);
  });

  it('returns system definition with required fields', () => {
    const def = loader.get('tormenta20');
    expect(def.system).toBe('tormenta20');
    expect(def.attributes.length).toBeGreaterThan(0);
    expect(def.skills.length).toBeGreaterThan(0);
  });

  it('lists all loaded systems', () => {
    const systems = loader.list();
    expect(systems.length).toBeGreaterThanOrEqual(1);
  });

  it('throws when system not found', () => {
    expect(() => loader.get('unknown-system')).toThrow('System not found: unknown-system');
  });

  it('has() returns true for d&d5e system', () => {
    expect(loader.has('dnd5e')).toBe(true);
  });

  it('has() returns false for unknown system', () => {
    expect(loader.has('shadowrun')).toBe(false);
  });
});
