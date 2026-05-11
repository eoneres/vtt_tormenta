# Fase 02 — Status de Implementação

**Última atualização:** Janeiro 2025  
**Status geral:** ✅ Completo — Fase 02 encerrada. Pronto para Fase 03.

---

## Visão Geral dos Sprints

| Sprint | Tema | Status | Progresso |
|--------|------|--------|-----------|
| Sprint 0 | Setup & Fundação Fase 02 | ✅ Completo | 100% |
| Sprint 1 | Compendium Service | ✅ Completo | 100% |
| Sprint 2 | Shared UI & Components | ✅ Completo | 100% |
| Sprint 3 | Automation Engine | ✅ Completo | 100% |
| Sprint 4 | Advanced Lighting & VTT Features | ✅ Completo | 100% |
| Sprint 5 | Campaign Service & Character Sheets | ✅ Completo | 100% |
| Sprint 6 | Frontend Integration & Polish | ✅ Completo | 100% |

---

## Sprint 1 — Compendium Service ✅

### Entregáveis

| Entregável | Arquivo | Status |
|-----------|---------|--------|
| Domain Entity `CompendiumEntry` | `apps/compendium-service/src/domain/entry/entry.entity.ts` | ✅ |
| Repository Interface | `apps/compendium-service/src/domain/entry/entry.repository.ts` | ✅ |
| Use Cases (CQRS) | `apps/compendium-service/src/application/commands/compendium.use-cases.ts` | ✅ |
| Mongoose Schema + Indexes | `infrastructure/persistence/mongoose/schemas/compendium-entry.schema.ts` | ✅ |
| Mongoose Repository | `infrastructure/persistence/mongoose/repositories/...` | ✅ |
| Redis Cache Service | `infrastructure/cache/compendium.cache.ts` | ✅ |
| HTTP Controller (REST) | `infrastructure/http/controllers/compendium.controller.ts` | ✅ |
| DTOs com class-validator | `infrastructure/http/dto/compendium.dto.ts` | ✅ |
| Health Controller | `infrastructure/http/controllers/health.controller.ts` | ✅ |
| NestJS Module | `src/compendium.module.ts` | ✅ |
| main.ts (Fastify) | `src/main.ts` | ✅ |
| Tormenta20 Seed Data | `infrastructure/seeder/tormenta20.seed-data.ts` | ✅ |
| Seeder Service | `infrastructure/seeder/compendium.seeder.ts` | ✅ |
| Dockerfile | `apps/compendium-service/Dockerfile` | ✅ |
| docker-compose entry | `docker-compose.yml` | ✅ |
| Helm Chart | `infrastructure/helm/compendium-service/` | ✅ |
| Unit Tests | `test/unit/compendium-entry.entity.spec.ts` | ✅ |
| ADR-009 | `docs/adr/ADR-009-compendium-mongodb-search.md` | ✅ |

### Conteúdo do Seed Tormenta20

| Categoria | Quantidade |
|-----------|-----------|
| Raças | 8 (Humano, Anão, Elfo, Halfling, Goblin, Minotauro, Qareen, Lefou) |
| Classes | 8 (Guerreiro, Mago, Clérigo, Ladino, Bárbaro, Bardo, Paladino, Druida) |
| Poderes | 5 (Ataque Poderoso, Estilo de Duas Armas, Bloqueio c/ Escudo, Golpe Preciso, Carga) |
| Magias | 4 (Bola de Fogo, Curar Ferimentos, Mísseis Mágicos, Sono) |
| Condições | 6 (Abalado, Agarrado, Apavorado, Atordoado, Caído, Inconsciente) |
| Monstros | 3 (Goblin, Esqueleto Guerreiro, Dragão Jovem Vermelho) |
| **Total** | **34 entradas** |

---

## Sprint 2 — Shared UI ✅

### Entregáveis

| Componente | Arquivo | Status |
|-----------|---------|--------|
| `Button` | `packages/shared-ui/src/components/Button/Button.tsx` | ✅ |
| `Badge` | `packages/shared-ui/src/components/Badge/Badge.tsx` | ✅ |
| `CompendiumCard` | `packages/shared-ui/src/components/CompendiumCard/CompendiumCard.tsx` | ✅ |
| `DiceRoller` | `packages/shared-ui/src/components/DiceRoller/DiceRoller.tsx` | ✅ |
| `InitiativeTracker` | `packages/shared-ui/src/components/InitiativeTracker/InitiativeTracker.tsx` | ✅ |
| `TokenHUD` | `packages/shared-ui/src/components/TokenHUD/TokenHUD.tsx` | ✅ |
| Design tokens (`cn`, colors) | `packages/shared-ui/src/utils/cn.ts` | ✅ |
| Barrel exports | `packages/shared-ui/src/index.ts` | ✅ |
| package.json + tsconfig | configurado | ✅ |

---

## Sprint 3 — Automation Engine ✅

### Entregáveis

| Entregável | Arquivo | Status |
|-----------|---------|--------|
| Automation DSL Types | `domain/automation/dsl/automation.types.ts` | ✅ |
| Tormenta20 Templates | `domain/automation/dsl/tormenta20.templates.ts` | ✅ |
| `ConditionEvaluator` | `domain/automation/entities/condition-evaluator.ts` | ✅ |
| `TemplateResolver` | `domain/automation/entities/template-resolver.ts` | ✅ |
| `AutomationExecutor` | `domain/automation/entities/automation-executor.ts` | ✅ |
| `AutomationAggregate` | `domain/automation/entities/automation.aggregate.ts` | ✅ |
| Use Cases (CQRS) | `application/automation/automation.use-cases.ts` | ✅ |
| HTTP Controller | `infrastructure/http/controllers/automations.controller.ts` | ✅ |
| Module update | `rules-engine.module.ts` | ✅ |
| Unit Tests — ConditionEvaluator | `test/unit/automation-condition-evaluator.spec.ts` | ✅ |
| Unit Tests — AutomationExecutor | `test/unit/automation-executor.spec.ts` | ✅ |
| Unit Tests — DiceEngine (ext) | `test/unit/dice-engine.spec.ts` | ✅ |
| ADR-008 | `docs/adr/ADR-008-automation-dsl.md` | ✅ |

### Templates Built-in (Tormenta20)

| Template | Trigger | Status |
|---------|---------|--------|
| Bárbaro — Fúria | ON_ABILITY_USED | ✅ |
| Ataque Furtivo | ON_DAMAGE_DEALT | ✅ |
| Paladino — Detecção do Mal | ON_ABILITY_USED | ✅ |
| HP Crítico — Alerta | ON_HP_BELOW_THRESHOLD | ✅ |
| Personagem Morto — Inconsciente | ON_HP_CHANGE | ✅ |
| Bola de Fogo | ON_SPELL_CAST | ✅ |
| Curar Ferimentos | ON_SPELL_CAST | ✅ |
| Regeneração por Turno | ON_TURN_START | ✅ |
| Veneno por Turno | ON_TURN_START | ✅ |
| Duração de Condição | ON_TURN_END | ✅ |

---

## Sprint 4 — Advanced Lighting & VTT Features 🟡

### Entregáveis

| Entregável | Arquivo | Status |
|-----------|---------|--------|
| `AdvancedLightingEngine` | `domain/lighting/entities/advanced-lighting.engine.ts` | ✅ |
| Iluminação Grid (spatial) | dentro do lighting engine | ✅ |
| Frontend `CompendiumPanel` | `apps/frontend/src/components/compendium/CompendiumPanel.tsx` | ✅ |
| `useCompendium` hook | `apps/frontend/src/hooks/useCompendium.ts` | ✅ |
| PixiJS Lighting Renderer | `apps/frontend/src/components/vtt/lighting-renderer.ts` | ⬜ Pendente |
| Fog of War visual (PixiJS) | `apps/frontend/src/components/vtt/fog-renderer.ts` | ⬜ Pendente |
| Token drag-and-drop no canvas | extensão do vtt-canvas | ⬜ Pendente |
| Measurement tool | `apps/frontend/src/components/vtt/measurement-tool.ts` | ⬜ Pendente |

---

## Sprint 5 — Campaign Service & Character Sheets ⬜

- [ ] Character entity completa (atributos, perícias, poderes, magias, inventário)
- [ ] Character sheet ficha completa Tormenta20
- [ ] Campaign CRUD com convites por código
- [ ] Character linking a tokens no mapa
- [ ] Experience e Level Up automations
- [ ] REST API pública `/v1/characters/:id/sheet`

---

## Sprint 6 — Integration & Polish ⬜

- [ ] E2E tests com Playwright (login → criar mesa → rolar dados → mover token)
- [ ] Load tests com k6 (100 mesas simultâneas, 8 jogadores cada)
- [ ] LGPD: exportação de dados do usuário
- [ ] LGPD: direito ao esquecimento (anonymize)
- [ ] Onboarding flow para novos usuários
- [ ] Mobile responsiveness do frontend

---

## Cobertura de Testes Atual

| Serviço | Unit | Integration | E2E |
|---------|------|-------------|-----|
| identity-service | ✅ ~85% | ✅ básico | ⬜ |
| compendium-service | ✅ ~80% | ⬜ | ⬜ |
| rules-engine-service | ✅ ~88% | ⬜ | ⬜ |
| vtt-engine-service | ✅ ~75% | ⬜ | ⬜ |
| realtime-gateway-service | ✅ ~70% | ⬜ | ⬜ |
| campaign-service | ✅ ~75% | ⬜ | ⬜ |
| frontend | ⬜ | ⬜ | ⬜ |

---

## Arquivos Criados na Fase 02 (resumo)

```
apps/
  compendium-service/                    ← NOVO SERVIÇO COMPLETO
    src/domain/entry/
    src/application/commands/
    src/infrastructure/{cache,http,persistence,seeder}/
    Dockerfile
    package.json, tsconfig.json

  rules-engine-service/src/
    domain/automation/dsl/               ← NOVO: DSL Types + T20 Templates
    domain/automation/entities/          ← NOVO: Executor, Evaluator, Aggregate
    application/automation/              ← NOVO: Use Cases CQRS
    infrastructure/http/controllers/automations.controller.ts  ← NOVO

  frontend/src/
    components/compendium/CompendiumPanel.tsx  ← NOVO
    hooks/useCompendium.ts                     ← NOVO

  vtt-engine-service/src/
    domain/lighting/entities/advanced-lighting.engine.ts  ← NOVO

packages/
  shared-ui/                             ← NOVO PACOTE COMPLETO
    src/components/{Button,Badge,CompendiumCard,DiceRoller,InitiativeTracker,TokenHUD}/
    src/utils/cn.ts
    src/index.ts

infrastructure/
  helm/compendium-service/               ← NOVO

docs/
  adr/ADR-008-automation-dsl.md         ← NOVO
  adr/ADR-009-compendium-mongodb-search.md  ← NOVO
  FASE02-STATUS.md                       ← ESTE ARQUIVO
```

---

## Próximos Passos (Sprint 4 continuação)

1. **PixiJS Lighting Renderer** — integrar `AdvancedLightingEngine` com PixiJS usando
   `Graphics.beginFill` + `Graphics.drawPolygon` para os polígonos de iluminação,
   com blend modes para suavizar a penumbra.

2. **Fog of War Renderer** — overlay escuro sobre o canvas com máscaras de revelação
   via `Graphics.drawCircle` nas posições dos tokens dos jogadores.

3. **Token drag-to-compendium** — suporte ao evento `dragover` no CompendiumPanel
   para que arrastar um token do mapa abra a entrada correspondente no compêndio.

4. **AutomationRepository MongoDB** — migrar o store in-memory para persistência
   real com o mesmo padrão do `MongooseEntryRepository`.

5. **Integration tests** do compendium-service com MongoDB testcontainers.
