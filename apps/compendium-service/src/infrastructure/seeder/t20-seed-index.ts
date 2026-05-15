/**
 * Sprint 8 — Tormenta20 Complete Compendium Seed Index (Expandido)
 *
 * Combines all seed files into ALL_T20_SEED_DATA_SPRINT8_EXPANDED.
 * The CompendiumSeederService uses this array for idempotent upserts.
 *
 * Entry counts (Final Sprint 8):
 *   Raças:       15 (3 + 12)
 *   Classes:     14 (8 + 6)
 *   Origens:     20
 *   Poderes:     ~80 (24 base + 40 expandidos + classe-específicos)
 *   Magias:      ~52 (31 base + 21 expandidas)
 *   Condições:   19 (novas, expandidas)
 *   Monstros:    ~29 (19 base + 10 novos)
 *   Itens:       ~38 (28 base + 10 mágicos expandidos)
 *   Divindades:  8 (novas)
 *   Total ≥ 255+ entradas
 */

import { ALL_T20_SEED_DATA } from './tormenta20.seed-data';
import { T20_RACAS_COMPLETAS } from './t20-racas-completas.seed';
import { T20_CLASSES_RESTANTES } from './t20-classes-restantes.seed';
import { T20_ORIGENS } from './t20-origens.seed';
import { T20_PODERES_COMBATE } from './t20-poderes.seed';
import { T20_TODAS_MAGIAS } from './t20-magias.seed';
import { ALL_T20_NOVOS_MONSTROS_ITENS } from './t20-monstros-itens.seed';
// ─── Nova expansão Sprint 8
import { T20_PODERES_EXPANDIDOS_ALL } from './t20-poderes-expandidos.seed';
import { T20_MAGIAS_EXPANDIDAS_ALL } from './t20-magias-expandidas.seed';
import { T20_CONDICOES_TOTAL } from './t20-condicoes-expandidas.seed';
import { T20_MONSTROS_TOTAL } from './t20-monstros-expandidos.seed';
import { T20_ITENS_TOTAL, T20_DIVINDADES_TOTAL } from './t20-itens-divindades.seed';

export const ALL_T20_SEED_DATA_SPRINT8_EXPANDED = [
  ...ALL_T20_SEED_DATA,            // 34 original entries
  ...T20_RACAS_COMPLETAS,          // 12 novas raças
  ...T20_CLASSES_RESTANTES,        // 6 novas classes
  ...T20_ORIGENS,                  // 20 origens
  ...T20_PODERES_COMBATE,          // 24 poderes base
  ...T20_PODERES_EXPANDIDOS_ALL,   // ~40 poderes novos (destino + classe)
  ...T20_TODAS_MAGIAS,             // 31 magias base
  ...T20_MAGIAS_EXPANDIDAS_ALL,    // ~21 magias novas (círculos 2-5 + rituais)
  ...T20_CONDICOES_TOTAL,          // 19 condições
  ...ALL_T20_NOVOS_MONSTROS_ITENS, // 19 monstros base + 28 itens base
  ...T20_MONSTROS_TOTAL,           // ~10 monstros novos
  ...T20_ITENS_TOTAL,              // ~10 itens mágicos novos
  ...T20_DIVINDADES_TOTAL,         // 8 divindades
];

// Deduplicate by name+system (safety net for re-runs)
export const ALL_T20_SEED_DATA_DEDUP = (() => {
  const seen = new Set<string>();
  return ALL_T20_SEED_DATA_SPRINT8_EXPANDED.filter((e) => {
    const key = `${e.system}:${e.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
})();

// Maintain backward compatibility
export const ALL_T20_SEED_DATA_SPRINT8 = ALL_T20_SEED_DATA_SPRINT8_EXPANDED;
