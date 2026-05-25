/**
 * PATCH — frontend/src/lib/systems.ts
 *
 * Constante centralizada de sistemas suportados.
 * Importar em qualquer lugar que precise de um <select> de sistema.
 *
 * Uso:
 *   import { SYSTEMS, SYSTEM_LABELS } from '@/lib/systems';
 */

export type SystemId =
  | 'tormenta20'
  | 'dnd5e'
  | 'pathfinder2e'
  | 'call-of-cthulhu'
  | 'vampire5e'
  | 'outros';

export interface SystemInfo {
  id: SystemId;
  label: string;
  shortLabel: string;
  hasSheet: boolean;   // true = ficha visual dedicada
  dicePrimary: string; // dado principal para o dice roller
  description: string;
}

export const SYSTEMS: SystemInfo[] = [
  {
    id: 'tormenta20',
    label: 'Tormenta20',
    shortLabel: 'T20',
    hasSheet: true,
    dicePrimary: 'd20',
    description: 'O RPG brasileiro. Arton, deuses, tormenta e muito d20.',
  },
  {
    id: 'dnd5e',
    label: 'D&D 5ª Edição',
    shortLabel: 'D&D 5e',
    hasSheet: true,
    dicePrimary: 'd20',
    description: 'Dungeons & Dragons 5ª edição.',
  },
  {
    id: 'pathfinder2e',
    label: 'Pathfinder 2e',
    shortLabel: 'PF2e',
    hasSheet: false,
    dicePrimary: 'd20',
    description: 'Sistema d20 avançado da Paizo.',
  },
  {
    id: 'call-of-cthulhu',
    label: 'Call of Cthulhu',
    shortLabel: 'CoC',
    hasSheet: false,
    dicePrimary: 'd100',
    description: 'Horror lovecraftiano. Sistema percentual.',
  },
  {
    id: 'vampire5e',
    label: 'Vampire: The Masquerade 5e',
    shortLabel: 'V5',
    hasSheet: false,
    dicePrimary: 'd10',
    description: 'Vampiros urbanos e política das trevas.',
  },
  {
    id: 'outros',
    label: 'Outro sistema',
    shortLabel: 'Outro',
    hasSheet: false,
    dicePrimary: 'd20',
    description: 'Sistema não listado — use a ficha JSON genérica.',
  },
];

export const SYSTEM_MAP = Object.fromEntries(
  SYSTEMS.map(s => [s.id, s]),
) as Record<SystemId, SystemInfo>;

/** Retorna o label de exibição para um systemId qualquer */
export function systemLabel(id: string): string {
  return SYSTEM_MAP[id as SystemId]?.label ?? id;
}
