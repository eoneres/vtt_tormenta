# Fase 02 — Experiência & Polimento

> **Objetivo**: Melhorar experiência do usuário, adicionar compêndio completo, automações  
> **Duração**: 3 meses (Junho - Agosto 2026)  
> **Status**: 🟢 READY TO START  
> **Baseado em**: Fase 01 validada (109/109 testes ✅)

---

## 📋 Visão Geral da Fase 02

### Foco Principal

Transformar MVP em **produto polido e profissional** com:
- 🎨 Experiência visual aprimorada
- 📖 Compêndio completo (Tormenta20)
- 🤖 Sistema de automações avançadas
- 🎵 Áudio & trilhas sonoras
- ⚡ Otimizações de performance
- 🧩 Componentes reutilizáveis (shared-ui)

---

## 🎯 Épicos da Fase 02

### Épico 1: Iluminação Dinâmica & Atmosfera (Mês 1)

**Objetivo**: Implementar raycasting, sombras dinâmicas e atmosfera visual realista

#### Tarefas

**T1.1: Lighting Engine Avançado**
- [ ] Raycasting 2D com precisão
- [ ] Múltiplas fontes de luz simultâneas
- [ ] Sombras suaves (penumbra)
- [ ] Cálculo eficiente (spatial hashing)
- [ ] Cache de illumination updates
```typescript
// apps/vtt-engine-service/src/domain/lighting/
├── advanced-lighting.engine.ts
├── raycast.math.ts
├── shadow-calculator.ts
└── light-cache.ts
```

**T1.2: Line of Sight Avançado**
- [ ] LOS com múltiplas camadas
- [ ] Obstáculos parciais (translucent walls)
- [ ] Visão noturna (dim light)
- [ ] Escuridão absoluta (dark areas)

**T1.3: Áudio de Atmosfera**
- [ ] Música de fundo por mapa
- [ ] Sons ambientes (vento, água, etc)
- [ ] Efeitos de som por ação
- [ ] Volume dinâmico por distância
```
apps/frontend/public/audio/
├── ambient/
├── music/
├── effects/
└── manifest.json
```

**T1.4: UI Aprimorada**
- [ ] Controles de iluminação (GM tools)
- [ ] Presets de atmosfera (tavern, dungeon, outdoor)
- [ ] Player spotlight visual
- [ ] Indicadores de visibilidade

**T1.5: Performance Otimização**
- [ ] WebGL rendering (se necessário)
- [ ] Batch lighting updates
- [ ] LRU cache para cálculos
- [ ] Benchmark: <16ms per frame (60fps)

---

### Épico 2: Compendium Service Completo (Mês 1-2)

**Objetivo**: Compêndio oficial Tormenta20 com busca, filtros, e integração com fichas

#### Tarefas

**T2.1: Infrastructure**
```typescript
// apps/compendium-service/src/
├── application/
│   ├── list-entries.use-case.ts
│   ├── search-entries.use-case.ts
│   ├── get-entry.use-case.ts
│   └── sync-homebrew.use-case.ts
├── domain/
│   ├── entry/
│   ├── category/
│   └── tag/
├── infrastructure/
│   ├── mongodb/
│   └── http/
└── main.ts
```

**T2.2: Data Models**
- [ ] Raças (races): 12+ opções
- [ ] Classes (classes): 12+ opções
- [ ] Origens (origins): 24+ opções
- [ ] Poderes (powers): 100+
- [ ] Magias (spells): 200+
- [ ] Monstros (monsters): 150+
- [ ] Itens (items): 300+
- [ ] Condições (conditions): 20+

**T2.3: Search & Filtering**
- [ ] Full-text search (MongoDB text index)
- [ ] Faceted filtering (class, level, etc)
- [ ] Sorting (A-Z, newest, most used)
- [ ] Tagging system
- [ ] Favorites/bookmarks

**T2.4: Integration with Character Sheet**
- [ ] Drag-and-drop selections
- [ ] Auto-calculate derived stats
- [ ] Applied bonuses/modifiers
- [ ] Spell slot management

**T2.5: Homebrew Support**
- [ ] Create custom entries
- [ ] Versioning & history
- [ ] Collaboration (shared homebrew)
- [ ] Publishing to marketplace (Fase 03)

---

### Épico 3: Automation Engine (Mês 2-3)

**Objetivo**: Sistema de automações configuráveis para regras complexas

#### Tarefas

**T3.1: Automation DSL**
```
// apps/automation-service/src/
// Nova microservices para automações
├── domain/
│   ├── automation.entity.ts
│   ├── trigger.ts
│   ├── action.ts
│   └── condition.ts
├── application/
│   └── execute-automation.use-case.ts
└── infrastructure/
    └── persistence/
```

**T3.2: Trigger Types**
- [ ] On roll
- [ ] On damage
- [ ] On spell cast
- [ ] On turn start/end
- [ ] On condition applied
- [ ] On resource spent
- [ ] Custom/webhook

**T3.3: Action Types**
- [ ] Roll dice (with modifiers)
- [ ] Apply condition
- [ ] Modify stat
- [ ] Spend resource
- [ ] Send message
- [ ] Apply damage
- [ ] Heal

**T3.4: Condition System**
- [ ] If-then-else logic
- [ ] Mathematical comparisons
- [ ] Boolean operations
- [ ] Variable references

**T3.5: UI Builder**
- [ ] Visual automation editor
- [ ] Drag-and-drop triggers/actions
- [ ] Testing interface
- [ ] Template library (common automations)

---

### Épico 4: Advanced Initiative Tracker (Mês 2)

**Objetivo**: Iniciativa visual avançada com turnos, rodadas, delays

#### Tarefas

**T4.1: Visual Enhancements**
- [ ] Better turn highlighting
- [ ] Initiative value display
- [ ] Health bars in tracker
- [ ] Status effects icons
- [ ] Portrait thumbnails

**T4.2: Advanced Features**
- [ ] Delay turn (postpone action)
- [ ] Ready action (interrupt)
- [ ] Readied action trigger
- [ ] Round tracking (visual timer)
- [ ] Surprise round handling
- [ ] Combat log (detailed)

**T4.3: Accessibility**
- [ ] Keyboard shortcuts
- [ ] Screen reader support
- [ ] High contrast mode
- [ ] Text size adjustment

---

### Épico 5: Shared UI Components (Mês 1-3)

**Objetivo**: Biblioteca de componentes React para reutilização

#### Tarefas

**T5.1: Component Library Setup**
```typescript
// packages/shared-ui/src/
├── components/
│   ├── buttons/
│   ├── inputs/
│   ├── cards/
│   ├── modals/
│   ├── tables/
│   ├── forms/
│   └── layout/
├── hooks/
├── styles/
└── storybook/
```

**T5.2: Core Components**
- [ ] Button (all variants)
- [ ] TextInput, Select, Checkbox
- [ ] Card (with variants)
- [ ] Modal/Dialog
- [ ] Tabs, Collapse
- [ ] Table (sortable, filterable)
- [ ] Form (with validation)
- [ ] Toast notifications
- [ ] Loading states
- [ ] Status indicators

**T5.3: Storybook Documentation**
- [ ] Visual documentation
- [ ] Props documentation
- [ ] Usage examples
- [ ] Accessibility checklist

**T5.4: Theme System**
- [ ] CSS variables
- [ ] Dark mode support
- [ ] Custom theme builder
- [ ] Consistency across apps

---

### Épico 6: Performance & Optimization (Mês 3)

**Objetivo**: Otimizar toda a plataforma para escala

#### Tarefas

**T6.1: Frontend Optimization**
- [ ] Code splitting (route-based)
- [ ] Image optimization
- [ ] Lazy loading
- [ ] Lighthouse score > 90
- [ ] LCP < 2.5s, FID < 100ms, CLS < 0.1

**T6.2: Backend Optimization**
- [ ] Query optimization (MongoDB indexes)
- [ ] Caching strategy (Redis)
- [ ] Connection pooling
- [ ] Database tuning

**T6.3: Realtime Optimization**
- [ ] Reduce patch frequency (when low activity)
- [ ] Delta compression
- [ ] Selective state sync
- [ ] Bandwidth reduction

**T6.4: Benchmarking**
- [ ] Load test (100 concurrent games)
- [ ] Latency baseline (6-8 regions)
- [ ] Memory profiling
- [ ] Network profiling

---

## 📊 Cronograma Detalhado

### Mês 1 (Junho 2026)

| Semana | Task | Owner | Status |
|--------|------|-------|--------|
| 1-2 | T1.1: Lighting Engine Avançado | Backend | ⏳ |
| 1-2 | T2.1-T2.2: Compendium Infrastructure | Backend | ⏳ |
| 2-3 | T1.2: Advanced LOS | Backend | ⏳ |
| 2-3 | T5.1-T5.2: Component Library | Frontend | ⏳ |
| 3-4 | T1.3: Audio System | Frontend | ⏳ |
| 3-4 | T2.3: Search & Filtering | Backend | ⏳ |

### Mês 2 (Julho 2026)

| Semana | Task | Owner | Status |
|--------|------|-------|--------|
| 1-2 | T3.1-T3.4: Automation DSL | Backend | ⏳ |
| 1-2 | T2.4: Compendium Integration | Full-Stack | ⏳ |
| 2-3 | T4.1-T4.2: Advanced Initiative | Full-Stack | ⏳ |
| 3-4 | T3.5: Automation UI Builder | Frontend | ⏳ |

### Mês 3 (Agosto 2026)

| Semana | Task | Owner | Status |
|--------|------|-------|--------|
| 1-2 | T6.1-T6.4: Performance & Optimization | Full-Stack | ⏳ |
| 2-3 | Polish & Bug Fixes | Full-Stack | ⏳ |
| 3-4 | Integration Testing & QA | QA | ⏳ |
| 4 | Go-Live Preparation | DevOps | ⏳ |

---

## 🏗️ New Services Architecture

### apps/compendium-service

**Responsabilidade**: Gerenciar dados de jogo (raças, classes, magias, monstros)

```
compendium-service/
├── src/
│   ├── application/
│   │   ├── list-entries.use-case.ts
│   │   ├── search-entries.use-case.ts
│   │   ├── get-entry.use-case.ts
│   │   └── sync-homebrew.use-case.ts
│   ├── domain/
│   │   ├── entries/
│   │   │   ├── race.entity.ts
│   │   │   ├── class.entity.ts
│   │   │   ├── power.entity.ts
│   │   │   ├── spell.entity.ts
│   │   │   └── monster.entity.ts
│   │   ├── search/
│   │   │   └── search-filter.ts
│   │   └── ports/
│   │       └── entries.repository.ts
│   ├── infrastructure/
│   │   ├── mongodb/
│   │   │   └── entries.mongoose-repository.ts
│   │   ├── http/
│   │   │   └── compendium.controller.ts
│   │   └── cache/
│   │       └── entries.cache.ts
│   └── main.ts
├── test/
│   └── unit/
│       ├── race.entity.spec.ts
│       ├── search-filter.spec.ts
│       └── entries.repository.spec.ts
└── package.json
```

**Stack**: NestJS, MongoDB, Redis cache

---

### packages/shared-ui

**Responsabilidade**: Componentes React reutilizáveis

```
packages/shared-ui/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Modal/
│   │   ├── Table/
│   │   ├── Form/
│   │   └── ...
│   ├── hooks/
│   │   ├── useForm
│   │   ├── useModal
│   │   └── ...
│   ├── styles/
│   │   ├── theme.ts
│   │   └── globals.css
│   └── index.ts
├── storybook/
│   ├── stories/
│   └── .storybook/
└── package.json
```

**Stack**: React, TypeScript, Tailwind CSS, Storybook

---

## 📈 Success Criteria — Fase 02

### Functional

- [ ] Iluminação dinâmica funcionando (120+ fps)
- [ ] Compêndio Tormenta20 completo (400+ entries)
- [ ] Automações customizáveis (50+ templates)
- [ ] Componentes UI 80%+ das telas

### Performance

- [ ] Realtime <100ms p95 com iluminação ativa
- [ ] Search queries <200ms
- [ ] UI components <16ms render time
- [ ] Lighthouse score ≥90

### Quality

- [ ] >85% code coverage (new code)
- [ ] 0 critical/high security issues
- [ ] E2E tests 100% critical paths
- [ ] Performance benchmarks documented

### User Experience

- [ ] NPS score improvement (vs MVP)
- [ ] Accessibility WCAG AA compliance
- [ ] Mobile responsiveness (375px+)
- [ ] Offline support (service worker)

---

## 🚀 Launch Criteria — Fase 02

### Gate 1: Feature Complete (End of Week 8)

- [ ] All epics 90% complete
- [ ] Critical bugs <5
- [ ] Performance baseline met
- [ ] Documentation updated

### Gate 2: QA Ready (End of Week 9)

- [ ] All tests passing
- [ ] No known P0/P1 bugs
- [ ] E2E coverage 95%+
- [ ] Performance load test passed

### Gate 3: Release Ready (End of Week 12)

- [ ] Product owner approval
- [ ] Security audit passed
- [ ] Deployment runbook complete
- [ ] Rollback procedure tested

---

## 🎯 Key Dependencies

**Internal**:
- Fase 01 testes aprovados ✅ (já completo)
- shared-types & shared-utils (existing)
- realtime-gateway (existing)

**External**:
- MongoDB (Tormenta20 data dump)
- Audio library (howler.js ou similar)
- Lighting library (pixi-lights ou custom)

---

## 📝 Next Steps

**Imediatamente (Próxima semana)**:

1. ✅ Aprovação de roadmap (este documento)
2. ✅ Setup inicial de compendium-service
3. ✅ Setup de shared-ui package
4. ✅ Design de Lighting Engine
5. ✅ Data model para Tormenta20

**Paralelo**:
- Contratar especialista em raycasting/lighting (se necessário)
- Preparar dataset Tormenta20 (raças, classes, poderes)
- Design de automation DSL

---

## 📚 Documentation

- **Architecture**: `docs/FASE02-ARCHITECTURE.md`
- **API Reference**: Será gerado via OpenAPI
- **Component Storybook**: `packages/shared-ui/.storybook`
- **Data Models**: `docs/FASE02-DATA-MODELS.md`

---

**Status**: 🟢 **READY TO START FASE 02**  
**Estimated Duration**: 3 months (Junho-Agosto 2026)  
**Team Size**: 6-8 engineers  
**Budget**: ~2400 engineering hours
