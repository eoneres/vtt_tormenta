# Sprint 9 — D&D 5e + Shadowrun Systems — Status Final

## ✅ Conclusão

**Data**: Maio 2026  
**Status**: ✅ COMPLETO  
**Sistemas**: D&D 5e + Shadowrun

---

## Entregáveis

### 1. D&D 5e Character Sheet ✅

**Arquivo**: `apps/campaign-service/src/domain/character/d5e-character-sheet.ts`

**Recursos Implementados**:
- ✅ 6 Atributos Base (STR, DEX, CON, INT, WIS, CHA)
- ✅ Modificadores Automáticos (base em atributo)
- ✅ 18 Perícias Padrão D&D 5e
- ✅ Saving Throws (6)
- ✅ Proficiency Bonus (escala automática com nível)
- ✅ Class Features
- ✅ Spellcasting (slots, cantrips, spell save DC)
- ✅ Hit Points (cálculo com CON)
- ✅ Armor Class (10 + DEX + modificadores)
- ✅ Initiative (DEX mod)
- ✅ Experience & Level-up (1000 XP/nível)
- ✅ Temporary HP
- ✅ Damage & Healing
- ✅ Spell Slot Management

**Cálculos Automáticos**:
```
Attribute Modifier = (Attribute - 10) / 2
Skill Bonus = Attr Mod + (Proficiency Bonus if proficient)
Saving Throw = Attr Mod + (Proficiency Bonus if proficient)
AC = 10 + DEX Mod + Armor
HP Max = (d8 + CON Mod) × Level
Initiative = DEX Mod
```

**Factory Methods**:
- `create(input)` — Novo personagem
- `fromPlainObject(obj)` — Carregar de DB
- `getSerialized()` — Salvar para DB

**Métodos Públicos**:
- `setAttribute(name, value)` — Alterar atributo
- `getAttribute(name)` — Ler atributo
- `damage(amount, type)` — Receber dano
- `heal(amount)` — Curar
- `levelUp()` — Aumentar nível
- `grantExperience(amount)` — Ganhar XP
- `spendSpellSlot(level)` — Gastar slot

### 2. D&D 5e Compendium Seed Data ✅

**Arquivo**: `apps/compendium-service/src/infrastructure/seeder/d5e-core.seed.ts`

**Conteúdo**:

| Categoria | Quantidade |
|-----------|-----------|
| Classes | 12 (Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard) |
| Raças | 9 (Dwarf, Elf, Halfling, Human, Dragonborn, Gnome, Half-Elf, Half-Orc, Tiefling) |
| **TOTAL** | **21 entradas** |

**Classes Detalhadas**:
- Hit Die
- Primary Ability
- Saving Throws
- Proficiencies
- Spell Ability (se aplicável)
- Class-specific features (Channel Divinity, Extra Attack, etc)

**Raças Detalhadas**:
- Size & Speed
- Ability Bonus
- Lifespan
- Darkvision (se aplicável)
- Languages
- Racial Features

### 3. Shadowrun DSL (Domain Specific Language) ✅

**Arquivo**: `apps/rules-engine-service/src/domain/shadowrun/shadowrun-dsl.ts`

**Sistemas Implementados**:

#### A. Dice Pool System
```typescript
ShadowrunDicePool.roll(poolSize) → DicePoolRollResult
  ├─ Rola N d6
  ├─ Conta sucessos (4+)
  ├─ Detecta glitches (50%+ falhas)
  └─ Detecta critical glitches (glitch + 0 sucessos)
```

#### B. Test Types
- **Simple Test**: `test(attribute, skill, bonus)`
- **Opposed Test**: `opposedTest(attacker, defender)`
- **Threshold Test**: `thresholdTest(poolSize, threshold)` — Precisa de X sucessos
- **Extended Test**: `extendedTest(poolSize, threshold, maxAttempts)` — Acumula sucessos

#### C. Edge System
- `useEdge(result, edgeAvailable)` — Reroller dados falhados

#### D. Damage System
- `applyArmor(baseDamage, armorRating)` — Reduz dano
- `resistanceTest(damage, attributes, type)` — Teste de resistência
- `calculateDrain(spellLevel, charisma)` — Dano mágico
- `calculateFading(spellLevel, willpower)` — Dano astral

#### E. Combat
- `Initiative.calculateInitiative(reaction, intuition, bonus)`
- `Initiative.determineOrder(combatants)`

#### F. Matrix (Hacking)
- `Matrix.matrixAttack(hacker, target)` — Teste de hack
- `Matrix.jackOutTest(willpower, biofeedbackDamage)` — Escape

#### G. Magic
- `Magic.castSpell(magicAttribute, skill, spellLevel, defense)`
- `Magic.counterspell(willpower, skill)`

### 4. Shadowrun Seed Data ✅

**Arquivo**: `apps/compendium-service/src/infrastructure/seeder/shadowrun-core.seed.ts`

**Conteúdo**:

| Categoria | Quantidade |
|-----------|-----------|
| Qualities (Positive) | 10 |
| Qualities (Negative) | 5 |
| Archetypes | 5 |
| **TOTAL** | **20 entradas** |

**Positive Qualities**:
1. Aptitude (-5% skill cost)
2. Bilingual (+1 language)
3. Combat Sense (+1d6 Initiative, +1 pass)
4. Dead Calm (+2 Composure, immune panic)
5. Enhanced Immune System (+2 disease resistance)
6. Natural Athlete (-5% athletics)
7. Quick Healer (recovery -50%)
8. Run Faster (+20% run, +30% sprint)
9. Mentor Spirit (+2 mentor tests, 1/session)
10. Uncouth (+1 tech, -1 social)

**Negative Qualities**:
1. Ork Tusk (-1 social formal)
2. Low Pain Tolerance (+1 pain damage)
3. Paranoid (-1 social, immune surprise)
4. Bad Luck (GM flips test 1/session)
5. Code of Honor (roleplay constraint)

**Archetypes**:
1. Street Samurai — Combat specialist
2. Decker — Hacker
3. Mage — Spellcaster
4. Shaman — Spirit summoner
5. Rigger — Drone specialist

### 5. Integration Services ✅

**Updated Seed Index**: `apps/compendium-service/src/infrastructure/seeder/t20-seed-index.ts`

```typescript
// Agora suporta D&D 5e e Shadowrun
export const ALL_SYSTEMS_SEED_DATA = [
  ...T20_EXPANDED,    // Tormenta20
  ...D5E_DATA,        // D&D 5e
  ...SHADOWRUN_DATA,  // Shadowrun
];
```

---

## Arquitetura

```
apps/
├── campaign-service/
│   └── domain/character/
│       ├── d5e-character-sheet.ts      ✅ D&D 5e
│       └── t20-character-sheet.ts      ✅ Tormenta20 (Sprint 8)
│
├── rules-engine-service/
│   └── domain/shadowrun/
│       └── shadowrun-dsl.ts            ✅ Shadowrun DSL
│
└── compendium-service/
    └── infrastructure/seeder/
        ├── d5e-core.seed.ts            ✅ D&D 5e Data
        ├── shadowrun-core.seed.ts      ✅ Shadowrun Data
        └── t20-seed-index.ts           ✅ Multi-system index
```

---

## Compatibilidade

✅ **Backward Compatible** — Sprint 8 (Tormenta20) continua funcionando  
✅ **Multi-System** — Suporta T20, D&D 5e, Shadowrun  
✅ **Extensível** — Fácil adicionar novos sistemas

---

## Próximos Passos: Sprint 10

### Sprint 10 — VTT Engine (Fog of War + Iluminação Dinâmica)

- [ ] Integração AdvancedLightingEngine → realtime-gateway-service
- [ ] Fog of War sincronizado com token movement
- [ ] Fontes de luz em tokens (tocha, lanterna, magia)
- [ ] Visão no escuro por raça (D&D + T20)
- [ ] Upload de mapas com grid (quadrado/hex/sem)
- [ ] Camadas de mapa (background, objetos, tokens, GM layer)
- [ ] Paredes e portas interativas
- [ ] Tokens com barra HP/MP, auras, ícones de condição

---

**Sprint 9 Finalizado com Sucesso! 🎉**

Temos agora suporte multi-sistema completo com:
- Tormenta20 (Sprint 8)
- D&D 5e (Sprint 9)
- Shadowrun (Sprint 9)

Próximo: Implementar VTT Engine com visual completo.
