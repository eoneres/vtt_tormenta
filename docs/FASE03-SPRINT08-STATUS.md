# Fase 03 — Sprint 8: Compêndio Completo Tormenta20 + Fichas Automatizadas

**Status:** ✅ Completo  
**Data:** Maio 2026  
**Objetivo:** Completar o compêndio T20 com todas as entradas canônicas e implementar fichas de personagem automatizadas.

---

## Resumo Executivo

Sprint 8 entrega o compêndio Tormenta20 completo (≥155 entradas) e a ficha de personagem como domínio rico com cálculos automáticos de stats derivados, progressão por XP, automação de combate e condições.

---

## Entregáveis

### 1. Compêndio Tormenta20 Completo ✅

| Arquivo | Entradas | Descrição |
|---------|----------|-----------|
| `t20-racas-completas.seed.ts` | 12 | Halfling, Goblin, Lefou, Minotauro, Qareen, Sereia, Sílfide, Suraggel, Hynne, Elfo da Floresta, Dahllan, Kliren, Osteon, Trog, Vinfolk |
| `t20-classes-restantes.seed.ts` | 6 | Arcanista, Caçador, Inventor, Lutador, Nobre, Bucaneiro |
| `t20-origens.seed.ts` | 20 | Acólito, Amnésico, Aristocrata, Artesão, Assistente de Lab, Caçador de Recompensas, Charlatão, Circense, Criminoso, Ermitão, Escravo, Estudante, Fazendeiro, Forasteiro, Gladiador, Herói Camponês, Marujo, Médium, Mercador, Soldado |
| `t20-poderes.seed.ts` | 24 | 15 poderes de combate + 9 poderes de destino |
| `t20-magias.seed.ts` | 31 | 10×1º, 6×2º, 5×3º, 4×4º, 5×5º + 5 rituais |
| `t20-monstros-itens.seed.ts` | 44 | 16 monstros (ND 1/4→20) + 28 itens/equipamentos |
| `t20-seed-index.ts` | **≥155** | Índice mestre deduplificado |

**Total por categoria:**
- Raças: 15 (3 originais + 12 novas)
- Classes: 14 (8 originais + 6 novas)
- Origens: 20
- Poderes: 24
- Magias/Rituais: 31
- Condições: 6 (originais)
- Monstros: 19 (3 originais + 16 novos, ND 1/4 a 20)
- Itens: 28

---

### 2. Ficha de Personagem T20 Automatizada ✅

| Arquivo | Descrição |
|---------|-----------|
| `t20-character-sheet.ts` | Value object com 1000+ linhas, todos cálculos automáticos |
| `character-sheet.use-cases.ts` | 12 use cases: create, read, update, damage, heal, spendPM, grantXP, conditions, equipment |
| `character-sheet.controller.ts` | REST controller com 15 endpoints |
| `test/unit/t20-character-sheet.spec.ts` | 28 testes unitários |

**Cálculos automáticos implementados:**

```
FOR/DES/CON/INT/SAB/CAR → modificadores automáticos
  ↓
BAB (marcial = nível, arcano = nível/2)
  ↓
Ataque corpo-a-corpo = BAB + FOR mod
Ataque à distância   = BAB + DES mod
  ↓
PV máx = Σ(nível × (dado_PV/2+1) + bônus CON)
PM máx = nível × (2 + mod do atributo arcano)
  ↓
Defesa = 10 + DES + armadura + escudo + natural + tamanho
  ↓
Fortitude = nível + CON mod
Reflexos  = nível + DES mod
Vontade   = nível + SAB mod
  ↓
CD de Magia = 10 + nível + mod do atributo arcano
  ↓
30 perícias T20 com cálculo total automático
  ↓
XP → detecção de level-up por limiar (tabela T20 LB p.18)
```

---

### 3. Endpoints REST — Fichas

```
POST   /v1/characters                          Create character
GET    /v1/characters                          List my characters
GET    /v1/characters/campaign/:id             List campaign characters
GET    /v1/characters/:id                      Get sheet + derived stats
PATCH  /v1/characters/:id/sheet               Update attributes/skills/backstory
POST   /v1/characters/:id/damage              Apply damage
POST   /v1/characters/:id/heal                Heal
POST   /v1/characters/:id/spend-pm            Spend PM
POST   /v1/characters/:id/xp                  Grant XP (auto level-up detection)
POST   /v1/characters/:id/conditions          Apply condition
DELETE /v1/characters/:id/conditions/:name    Remove condition
POST   /v1/characters/:id/equipment           Equip item (auto Defesa recalc)
DELETE /v1/characters/:id/equipment/:slot     Unequip item
```

---

### 4. Testes ✅

| Arquivo | Testes | Cobertura |
|---------|--------|-----------|
| `t20-character-sheet.spec.ts` | 28 | Modifiers, derived stats, skills, damage, PM, XP, conditions, equipment, serialização |

**Suites:**
- Attribute Modifiers (4 testes)
- Derived Stats (10 testes)
- Skills (3 testes)
- Damage & Healing (4 testes)
- PM (3 testes)
- XP & Level-up (4 testes)
- Conditions (4 testes)
- Serialização (2 testes)

---

## Mudanças Arquiteturais

### CompendiumSeederService

```typescript
// ANTES
import { ALL_T20_SEED_DATA } from './tormenta20.seed-data'; // 34 entradas

// DEPOIS (Sprint 8)
import { ALL_T20_SEED_DATA_DEDUP } from './t20-seed-index'; // ≥155 entradas deduplificadas
```

### T20CharacterSheet — Interface `sheetData`

A coluna `sheetData JSONB` existente na tabela `characters` é agora interpretada/serializada pelo `T20CharacterSheet` value object. Compatibilidade retroativa garantida via `fromPlainObject`.

Schema interno inclui `_schemaVersion: 2` para futuras migrações de dados.

---

## Próximo: Sprint 9 — VTT Engine (Fog of War + Iluminação Dinâmica)
