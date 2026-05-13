/**
 * Sprint 8 — Tormenta20 Complete Compendium Seed Index
 *
 * Combines all seed files into ALL_T20_SEED_DATA_SPRINT8.
 * The CompendiumSeederService uses this array for idempotent upserts.
 *
 * Entry counts (approximate):
 *   Raças:       15 (3 existentes + 12 novas no sprint8)
 *   Classes:     14 (8 existentes + 6 novas)
 *   Origens:     20
 *   Poderes:     25+ (combate + destino)
 *   Magias:      31 (círculos 1-5 + rituais)
 *   Condições:   6 (existentes)
 *   Monstros:    16 (3 existentes + 13 novos)
 *   Itens:       28
 *   Total ≥ 155 entradas
 */

import { ALL_T20_SEED_DATA } from './tormenta20.seed-data';
import { T20_RACAS_COMPLETAS } from './t20-racas-completas.seed';
import { T20_CLASSES_RESTANTES } from './t20-classes-restantes.seed';
import { T20_ORIGENS } from './t20-origens.seed';
import { T20_PODERES_COMBATE } from './t20-poderes.seed';
import { T20_TODAS_MAGIAS } from './t20-magias.seed';
import { ALL_T20_NOVOS_MONSTROS_ITENS } from './t20-monstros-itens.seed';

export const ALL_T20_SEED_DATA_SPRINT8 = [
  ...ALL_T20_SEED_DATA,           // 34 original entries
  ...T20_RACAS_COMPLETAS,         // 12 novas raças
  ...T20_CLASSES_RESTANTES,       // 6 novas classes
  ...T20_ORIGENS,                 // 20 origens
  ...T20_PODERES_COMBATE,         // 24 poderes
  ...T20_TODAS_MAGIAS,            // 31 magias + rituais
  ...ALL_T20_NOVOS_MONSTROS_ITENS // 16 monstros + 28 itens
];

// Deduplicate by name+system (safety net for re-runs)
export const ALL_T20_SEED_DATA_DEDUP = (() => {
  const seen = new Set<string>();
  return ALL_T20_SEED_DATA_SPRINT8.filter((e) => {
    const key = `${e.system}:${e.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
})();
