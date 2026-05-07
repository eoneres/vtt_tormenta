# Fase 02 — Backlog & Sprint Planning

> **Objetivo**: Organização de trabalho em sprints de 2 semanas  
> **Timeline**: Junho - Agosto 2026 (12 semanas = 6 sprints)

---

## 📊 Backlog by Priority

### 🔴 CRITICAL PATH (Must Have)

**Sprint 0 (Prep Week)**

- [ ] **SETUP-01**: Setup compendium-service monorepo structure
  - Time: 4h | Owner: Backend Lead
  - Description: Criar scaffold NestJS + configure workspaces

- [ ] **SETUP-02**: Setup shared-ui package
  - Time: 3h | Owner: Frontend Lead
  - Description: Criar scaffold React + Storybook

- [ ] **DESIGN-01**: Design Lighting Engine architecture
  - Time: 6h | Owner: Architect
  - Description: Raycasting algorithm, cache strategy, benchmarks

- [ ] **DATA-01**: Extract Tormenta20 data model
  - Time: 8h | Owner: Backend
  - Description: Schema para raças, classes, poderes, magias

**Sprint 1 (Mês 1, Semanas 1-2)**

- [ ] **LIGHT-01**: Implement Raycasting 2D Engine
  - Time: 40h | Owner: Backend
  - Depends: DESIGN-01
  - Criteria: Benchmark > 60fps on 100x100 map

- [ ] **COMP-01**: Implement Compendium API (basic CRUD)
  - Time: 32h | Owner: Backend
  - Depends: DATA-01
  - Endpoints: GET /entries, GET /entries/:id, POST /entries

- [ ] **UI-01**: Create reusable Button & Input components
  - Time: 16h | Owner: Frontend
  - Depends: SETUP-02
  - Criteria: 10+ variants, full accessibility

- [ ] **TEST-01**: Unit tests for Raycasting
  - Time: 24h | Owner: QA
  - Depends: LIGHT-01
  - Target: >90% coverage

**Sprint 2 (Mês 1, Semanas 3-4)**

- [ ] **LIGHT-02**: Advanced LOS with Shadows
  - Time: 32h | Owner: Backend
  - Depends: LIGHT-01
  - Features: Multiple lights, penumbra, occlusion

- [ ] **COMP-02**: Search & Filtering Engine
  - Time: 24h | Owner: Backend
  - Features: Full-text search, faceted filtering, tagging

- [ ] **UI-02**: Create Table & Modal components
  - Time: 20h | Owner: Frontend
  - Criteria: Sortable, filterable, accessible

- [ ] **AUDIO-01**: Audio System (Infrastructure)
  - Time: 16h | Owner: Frontend
  - Features: Howler.js integration, volume control

**Sprint 3 (Mês 2, Semanas 5-6)**

- [ ] **AUTO-01**: Automation DSL Design & Parser
  - Time: 40h | Owner: Backend
  - Features: Trigger/action/condition system

- [ ] **COMP-03**: Compendium UI Integration
  - Time: 32h | Owner: Full-Stack
  - Features: Drag-drop to character sheets

- [ ] **INIT-01**: Advanced Initiative Tracker UI
  - Time: 24h | Owner: Frontend
  - Features: Visual enhancements, turn delays

- [ ] **UI-03**: Form system + validation components
  - Time: 24h | Owner: Frontend

**Sprint 4 (Mês 2, Semanas 7-8)**

- [ ] **AUTO-02**: Automation UI Builder
  - Time: 32h | Owner: Frontend
  - Features: Drag-drop automation creation

- [ ] **AUTO-03**: Automation Execution Engine
  - Time: 32h | Owner: Backend
  - Features: Event system, action execution

- [ ] **PERF-01**: Frontend optimization
  - Time: 24h | Owner: Frontend
  - Targets: Code splitting, image optimization, LCP <2.5s

**Sprint 5 (Mês 3, Semanas 9-10)**

- [ ] **PERF-02**: Backend optimization
  - Time: 32h | Owner: Backend
  - Targets: Query optimization, caching, connection pooling

- [ ] **PERF-03**: Realtime optimization
  - Time: 24h | Owner: DevOps
  - Targets: Patch compression, selective sync

- [ ] **TEST-02**: E2E tests (critical paths)
  - Time: 32h | Owner: QA
  - Coverage: Campaign creation, gameplay, compendium

**Sprint 6 (Mês 3, Semanas 11-12)**

- [ ] **POLISH-01**: UI/UX Polish
  - Time: 40h | Owner: Design + Frontend
  - Features: Animations, transitions, dark mode

- [ ] **DOC-01**: Update architecture docs
  - Time: 16h | Owner: Tech Writer

- [ ] **LAUNCH-01**: Deployment & Rollout
  - Time: 24h | Owner: DevOps
  - Tasks: Staging, canary, monitoring setup

---

## 🔵 HIGH PRIORITY (Should Have)

- [ ] **AUDIO-02**: Ambient sounds by location
- [ ] **AUDIO-03**: Sound effects for actions
- [ ] **COMP-04**: Homebrew creation & versioning
- [ ] **PERF-04**: Load testing (100 concurrent games)
- [ ] **SEC-01**: Security audit (OWASP)
- [ ] **WCAG-01**: Accessibility audit (WCAG AA)

---

## 🟡 MEDIUM PRIORITY (Nice to Have)

- [ ] **THEME-01**: Theme customization system
- [ ] **OFFLINE-01**: Service worker for offline support
- [ ] **MOBILE-01**: Mobile optimization
- [ ] **ANALYTICS-01**: User analytics dashboard

---

## 📋 Epic Task Breakdown

### Epic 1: Lighting (120 hours)

**Backend (80h)**
```
- LIGHT-01: Raycasting (40h)
- LIGHT-02: Advanced LOS (32h)
- TEST-01: lighting tests (24h)
- PERF-03: Lighting optimization (8h)
```

**Frontend (24h)**
```
- UI-01: Lighting controls (12h)
- AUDIO-01: Audio system (12h)
```

**DevOps (16h)**
```
- PERF-03: Benchmark & optimization (16h)
```

### Epic 2: Compendium (128 hours)

**Backend (80h)**
```
- COMP-01: Basic CRUD (32h)
- COMP-02: Search/filtering (24h)
- DATA-01: Data modeling (16h)
- COMP-04: Homebrew (8h)
```

**Full-Stack (48h)**
```
- COMP-03: UI integration (32h)
- TEST: E2E tests (16h)
```

### Epic 3: Automation (112 hours)

**Backend (64h)**
```
- AUTO-01: DSL design (40h)
- AUTO-03: Execution engine (32h)
- PERF-02: Optimization (8h)
```

**Frontend (48h)**
```
- AUTO-02: UI builder (32h)
- INIT-01: Initiative tracker (16h)
```

### Epic 4: UI Components (120 hours)

**Frontend (120h)**
```
- UI-01: Basic components (16h)
- UI-02: Advanced components (20h)
- UI-03: Form system (24h)
- POLISH-01: Polish (40h)
- WCAG-01: Accessibility (20h)
```

### Epic 5: Performance (96 hours)

**Frontend (24h)**
- PERF-01: Frontend optimization

**Backend (32h)**
- PERF-02: Backend optimization
- PERF-04: Load testing

**DevOps (16h)**
- PERF-03: Realtime optimization

**QA (24h)**
- TEST-02: E2E performance tests

---

## 👥 Work Assignment Recommendation

### Team Structure (8 people, ideal)

**Backend (3 engineers)**
- Lead: Lighting + Automation
- Mid: Compendium service
- Mid: Performance optimization

**Frontend (2 engineers)**
- Lead: Component library + UI Polish
- Mid: Compendium UI + Automation UI

**DevOps/Infra (1 engineer)**
- Infrastructure + Performance

**QA/Testing (1 engineer)**
- Unit tests + E2E tests

**Tech Lead/Architect** (1/2 time)
- Design decisions + code review

---

## 📅 Sprint Schedule

| Sprint | Dates | Focus | Owner |
|--------|-------|-------|-------|
| 0 (Prep) | 27/05-03/06 | Setup + Design | Leads |
| 1 | 03/06-17/06 | Lighting foundations | Backend + Frontend |
| 2 | 17/06-01/07 | Lighting polish + Compendium | All |
| 3 | 01/07-15/07 | Automation DSL + Integration | Backend + Full-Stack |
| 4 | 15/07-29/07 | Automation UI + Polishing | Frontend + Backend |
| 5 | 29/07-12/08 | Performance + E2E tests | All |
| 6 | 12/08-26/08 | Final polish + Launch prep | All |

---

## 🚀 Definition of Done

### For Each Task

- [ ] Code complete
- [ ] Unit tests written (>80% coverage)
- [ ] Code review approved
- [ ] Merged to main
- [ ] No regressions on CI/CD
- [ ] Documentation updated
- [ ] PR closes related GitHub issue

### For Each Sprint

- [ ] All tasks marked Done
- [ ] Sprint review completed
- [ ] Demo recorded/presented
- [ ] Performance metrics documented
- [ ] Next sprint ready

### For Phase Release

- [ ] All epics complete
- [ ] E2E tests passing 100%
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Product owner approval
- [ ] Deployment runbook ready

---

## 📊 Tracking & Metrics

### Weekly Metrics

- **Velocity**: Tasks completed per sprint
- **Burndown**: Remaining hours vs time
- **Quality**: Bug count, test coverage
- **Performance**: Build time, deploy frequency

### Release Metrics

- **Feature Completeness**: % of scope delivered
- **Quality**: Bug density, test coverage
- **Performance**: Latency, throughput, CPU/Mem
- **User Satisfaction**: NPS, feedback

---

## 🎯 Success Indicators

### Functional

✅ All 5 epics 100% complete  
✅ Zero critical bugs at launch  
✅ All features documented  
✅ Compendium has 400+ entries

### Performance

✅ Realtime <100ms p95  
✅ Search <200ms  
✅ UI <16ms render time  
✅ Can handle 100 concurrent games

### Quality

✅ >85% code coverage  
✅ 0 security vulnerabilities  
✅ WCAG AA compliance  
✅ E2E coverage 95%+

### User Experience

✅ Dark mode supported  
✅ All components documented  
✅ 50+ automation templates  
✅ Mobile friendly (responsive)

---

## 📚 Deliverables

By end of Fase 02:

1. ✅ apps/compendium-service (production-ready)
2. ✅ packages/shared-ui (with Storybook)
3. ✅ Enhanced realtime-gateway (lighting support)
4. ✅ Enhanced frontend (new UI, automations)
5. ✅ Enhanced vtt-engine-service (advanced lighting)
6. ✅ Complete API documentation
7. ✅ Architecture decision records (ADRs)
8. ✅ Performance benchmarks
9. ✅ Security audit report
10. ✅ Deployment runbook

---

**Next**: Create individual sprint tasks in GitHub Issues

**Status**: 🟢 READY TO START

**Kickoff Meeting**: Next Monday (03/06/2026)
