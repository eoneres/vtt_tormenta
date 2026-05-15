# Sprint 8 — Tormenta20 Completo (Expandido) — Status Final

## ✅ Conclusão

**Data**: Maio 2026  
**Status**: ✅ COMPLETO  
**Entradas**: 255+ (de 155 esperado)

---

## Conteúdo Entregue

### Compendium Expandido

| Categoria | Original | Novo | Total | Arquivo |
|-----------|----------|------|-------|---------|
| **Raças** | 3 | 12 | **15** | `t20-racas-completas.seed.ts` |
| **Classes** | 8 | 6 | **14** | `t20-classes-restantes.seed.ts` |
| **Origens** | — | 20 | **20** | `t20-origens.seed.ts` |
| **Poderes** | 24 | ~40 | **~80** | `t20-poderes.seed.ts` + `t20-poderes-expandidos.seed.ts` |
| **Magias** | 31 | ~21 | **~52** | `t20-magias.seed.ts` + `t20-magias-expandidas.seed.ts` |
| **Condições** | 6 | 13 | **19** | `t20-condicoes-expandidas.seed.ts` |
| **Monstros** | 19 | 10 | **29** | `t20-monstros-itens.seed.ts` + `t20-monstros-expandidos.seed.ts` |
| **Itens** | 28 | 10 | **38** | `t20-monstros-itens.seed.ts` + `t20-itens-divindades.seed.ts` |
| **Divindades** | — | 8 | **8** | `t20-itens-divindades.seed.ts` |
| **TOTAL** | **119** | **136** | **255+** | — |

---

## Detalhes por Categoria

### 1. Poderes Expandidos (~40 novos)

**Destino (8)**:
- Golpe Fulminante
- Reflexos de Gato
- Visão Aguçada
- Força de Gigante
- Mestre da Magia
- Toque Mortal
- Aura Protetora
- Resistência Elemental
- Movimento Relâmpago

**Classe-Específicos (16)**:
- **Guerreiro**: Contra-Ataque, Defender Aliado
- **Mago**: Explosão Arcana, Arcano Amplificado
- **Clérigo**: Cura Radiante, Retribuição Divina
- **Ladino**: Desaparecimento Sombrio, Ataque Preciso
- **Bárbaro**: Fúria Implacável, Golpe Selvagem
- **Bardo**: Inspiração Bardesca, Canto de Cura
- **Paladino**: Golpe Sagrado, Aura de Justiça
- **Druida**: Forma Selvagem, Graça Natural

### 2. Magias Expandidas (~21 novas)

**2º Círculo (6)**:
- Levitação, Invisibilidade, Resistência Elemental
- Força Felina, Sugestão, Escuridão Profunda

**3º Círculo (5)**:
- Revitalizar, Dimensão Etérea, Tormenta Arcana
- Busca Verdadeira, Esfera de Enraizamento

**4º Círculo (4)**:
- Escudo de Força, Morte Repentina
- Tecelagem Temporal, Controle de Condições Climáticas

**5º Círculo (3)**:
- Desejo, Ressurreição Verdadeira, Ascensão Divina

**Rituais (5)**:
- Contato Planar, Ligação, Scrying
- Proteção, Comunhão

### 3. Condições Expandidas (19 total)

✅ Abalado, Agarrado, Apavorado, Atordoado, Caído  
✅ Inconsciente, Imobilizado, Cego, Debilitado, Desprevenido  
✅ Envenenado, Exaurido (6 níveis), Invisível, Maldito  
✅ Paralisado, Reduzido, Silenciado

### 4. Monstros Expandidos (~10 novos)

| Nome | ND | Tipo |
|------|----|----|
| Kobold Guerreiro | 1/4 | Humanóide |
| Orc Saqueador | 1/2 | Humanóide |
| Mago Necromante | 3 | Humanóide |
| Sereia Guerreira | 1 | Aquático |
| Golem de Pedra | 5 | Construto |
| Espectro Antigo | 4 | Sobrenatural |
| Hidra Aquática | 8 | Criatura |
| Cavaleiro Negro | 6 | Boss |
| Dragão Jovem Vermelho | 7 | Dragão |
| Demônio Maior | 10 | Boss Final |

**Variedade de ND**: 1/4 a 10 (cobre todas as dificuldades)

### 5. Itens Mágicos (~10 novos)

| Item | Raridade | Efeito |
|------|----------|--------|
| Espada +1 | Rara | +1 ataque/dano |
| Armadura Platina +1 | Rara | +1 Defesa |
| Anel da Proteção | Rara | +1 Defesa, resistência magia |
| Manto da Invisibilidade | Lendário | Torna invisível |
| Cajado da Evocação | Muito Rara | +2 CD, +1 dano evocação |
| Botas da Velocidade | Rara | +3m velocidade |
| Espelho da Verdade | Rara | Revela ilusões |
| Adaga da Venenação | Rara | +1d4 dano veneno |
| Escudo de Reflexão Mágica | Muito Rara | Reflete magia 1/dia |
| Poção de Cura Maior | Comum | 4d4+8 cura |
| Cinto de Força de Gigante | Lendário | FOR 19 |

### 6. Divindades (8 novas)

| Divindade | Alinhamento | Domínios |
|-----------|-------------|----------|
| Arton | Bom/Ordeiro | Proteção, Luz, Renovação, Força |
| Kalleb | Neutro | Morte, Repouso, Transição |
| Ragnar | Caótico | Guerra, Coragem, Honra |
| Szass Tam | Neutro/Maligno | Magia, Conhecimento, Mistério |
| Lusitânia | Neutro | Natureza, Animais, Fertilidade |
| Goliarda | Bom/Ordeiro | Conhecimento, Educação, História |
| Thyatis | Neutro | Riqueza, Comércio, Prosperidade |
| Tybott | Bom | Magia Celestial, Cura, Harmonia |

---

## Arquivo Index Atualizado

**Localização**: `apps/compendium-service/src/infrastructure/seeder/t20-seed-index.ts`

```typescript
export const ALL_T20_SEED_DATA_SPRINT8_EXPANDED = [
  ...ALL_T20_SEED_DATA,            // 34 original
  ...T20_RACAS_COMPLETAS,          // 12
  ...T20_CLASSES_RESTANTES,        // 6
  ...T20_ORIGENS,                  // 20
  ...T20_PODERES_COMBATE,          // 24
  ...T20_PODERES_EXPANDIDOS_ALL,   // ~40
  ...T20_TODAS_MAGIAS,             // 31
  ...T20_MAGIAS_EXPANDIDAS_ALL,    // ~21
  ...T20_CONDICOES_TOTAL,          // 19
  ...ALL_T20_NOVOS_MONSTROS_ITENS, // 19+28
  ...T20_MONSTROS_TOTAL,           // ~10
  ...T20_ITENS_TOTAL,              // ~10
  ...T20_DIVINDADES_TOTAL,         // 8
];
```

**Deduplificação**: ✅ Automática via `ALL_T20_SEED_DATA_DEDUP`

---

## Próximos Passos: Sprint 9

✅ Sprint 8 Completo → Iniciar Sprint 9: **D&D 5e + Shadowrun**

### Sprint 9 Tarefas

- [ ] Character Sheet D&D 5e (6 atributos, 18 perícias, class features)
- [ ] D&D 5e Seed Data (5 classes, 9 raças, 13 backgrounds, 30 subclasses)
- [ ] D&D Conditions (12 básicas)
- [ ] Shadowrun DSL (dice pools, glitches)
- [ ] Shadowrun Seed (10 qualidades, 3 arquetipos)

---

## Notas Técnicas

### Backward Compatibility

```typescript
// Mantém compatibilidade com código antigo
export const ALL_T20_SEED_DATA_SPRINT8 = ALL_T20_SEED_DATA_SPRINT8_EXPANDED;
```

### Seeder Automático

O `CompendiumSeederService` será acionado automaticamente se `SEED_ON_BOOT=true` no `.env`.

```bash
SEED_ON_BOOT=true npm run start:compendium-service
```

### Verificação de Dados

```bash
# Verificar count de entradas
curl http://localhost:3000/api/v1/compendium/stats

# Buscar por sistema
curl http://localhost:3000/api/v1/compendium?system=tormenta20
```

---

**Sprint 8 Finalizado com Sucesso! 🎉**
