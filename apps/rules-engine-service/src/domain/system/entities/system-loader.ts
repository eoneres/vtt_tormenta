import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import type { SystemDefinition } from '@vtt/shared-types';

export class SystemLoader {
  private readonly systems = new Map<string, SystemDefinition>();

  constructor(private readonly systemsDir: string) {}

  loadAll(): void {
    const files = readdirSync(this.systemsDir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const raw = readFileSync(join(this.systemsDir, file), 'utf-8');
      const def = JSON.parse(raw) as SystemDefinition;
      this.systems.set(def.system, def);
    }
  }

  get(systemId: string): SystemDefinition {
    const def = this.systems.get(systemId);
    if (!def) throw new Error(`System not found: ${systemId}`);
    return def;
  }

  list(): SystemDefinition[] {
    return Array.from(this.systems.values());
  }

  has(systemId: string): boolean {
    return this.systems.has(systemId);
  }
}
