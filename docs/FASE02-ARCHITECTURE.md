# 🏗️ FASE 02 — ARCHITECTURE DECISIONS

**Data**: 7 de Maio de 2026  
**Status**: 📋 **DESIGN PHASE**  
**Aplicação**: Compendium Service, Shared UI, Lighting Engine, Automation Engine

---

## 📋 Overview

Este documento captura as **decisões arquiteturais** para Fase 02, seguindo os princípios estabelecidos em Fase 01 e expandindo para novos domínios.

### 🎯 Princípios Orientadores

- **DDD First**: Domain-Driven Design em todos os serviços
- **Event-Driven**: Comunicação assíncrona entre serviços
- **CQRS**: Command-Query Responsibility Segregation onde apropriado
- **Privacy by Design**: LGPD compliance desde o início
- **Performance First**: Otimizações para realtime gaming

---

## 🏛️ New Services Architecture

### 1. Compendium Service

#### 🎯 Purpose
Serviço de catálogo de conteúdo de jogos (Tormenta20 + extensível), com busca avançada, filtros e cache inteligente.

#### 🏗️ Architecture Pattern
**Hexagonal Architecture** com DDD:
```
Domain Layer (Core)
├── Entities: EntryAggregate, EntryMetadata
├── Value Objects: EntryId, EntryType, EntryTags
├── Domain Services: EntryValidator, EntryIndexer
├── Repositories: EntryRepository (interface)

Application Layer
├── Use Cases: ListEntries, SearchEntries, GetEntry, CreateEntry
├── Commands: CreateEntryCommand, UpdateEntryCommand
├── Queries: SearchEntriesQuery, GetEntryQuery
├── DTOs: EntryDTO, SearchResultDTO

Infrastructure Layer
├── Controllers: EntryController (REST API)
├── Persistence: MongoDBEntryRepository
├── Cache: RedisEntryCache
├── Search: ElasticsearchEntryIndexer
├── External: Tormenta20DataImporter
```

#### 🗄️ Data Model

**MongoDB Collections**:
```typescript
// entries.collection
interface EntryDocument {
  _id: ObjectId;
  entryId: string; // Domain ID (e.g., "tormenta20:race:humano")
  type: EntryType; // "race", "class", "power", "spell", etc.
  system: string; // "tormenta20", "dnd5e"
  name: LocalizedString;
  description: LocalizedString;
  metadata: EntryMetadata;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// search.index
interface SearchIndex {
  entryId: string;
  system: string;
  type: EntryType;
  name: string; // flattened for search
  description: string; // flattened for search
  tags: string[];
  searchableText: string; // concatenated fields
}
```

#### 🔍 Search Strategy

**Hybrid Search** (Elasticsearch + MongoDB):
- **Full-text search**: Elasticsearch para queries complexas
- **Filtered search**: MongoDB aggregation pipelines
- **Cache**: Redis para resultados frequentes
- **Indexing**: Background jobs para manter sync

#### 📊 Performance Targets
- **Search latency**: <200ms p95
- **Index size**: ~500MB (400 entries)
- **Cache hit rate**: >80%
- **Throughput**: 1000 req/s

#### 🔒 Security
- **Authentication**: JWT via identity-service
- **Authorization**: RBAC (read/write/admin)
- **Input validation**: Zod schemas
- **Rate limiting**: 100 req/min per user

---

### 2. Shared UI Package

#### 🎯 Purpose
Biblioteca de componentes React reutilizáveis com design system consistente, acessibilidade e documentação.

#### 🏗️ Architecture Pattern
**Atomic Design** com **Compound Components**:
```
atoms/           // Base components
├── Button.tsx
├── Input.tsx
├── Icon.tsx
└── Typography.tsx

molecules/       // Composite components
├── FormField.tsx
├── Card.tsx
├── Badge.tsx
└── Tooltip.tsx

organisms/       // Complex components
├── DataTable.tsx
├── Modal.tsx
├── Form.tsx
└── Navigation.tsx

templates/       // Page layouts
├── Dashboard.tsx
├── DetailPage.tsx
└── Wizard.tsx

theme/           // Design tokens
├── colors.ts
├── spacing.ts
├── typography.ts
└── breakpoints.ts
```

#### 🎨 Design System

**Theme Structure**:
```typescript
interface Theme {
  colors: {
    primary: ColorScale;
    secondary: ColorScale;
    neutral: ColorScale;
    semantic: {
      success: ColorScale;
      warning: ColorScale;
      error: ColorScale;
      info: ColorScale;
    };
  };
  spacing: SpacingScale;
  typography: TypographyScale;
  breakpoints: BreakpointScale;
  shadows: ShadowScale;
  radii: BorderRadiusScale;
}
```

**Dark Mode Support**:
- CSS custom properties para theme switching
- Context provider para theme management
- Automatic system preference detection

#### ♿ Accessibility
- **WCAG AA compliance** target
- ARIA labels e roles
- Keyboard navigation
- Screen reader support
- Focus management

#### 📚 Documentation
- **Storybook** para visual documentation
- **TypeScript** para API documentation
- **Usage examples** em cada story
- **Design guidelines** integradas

#### 🧪 Testing Strategy
- **Unit tests**: Jest + React Testing Library
- **Visual tests**: Storybook + Chromatic
- **Accessibility tests**: axe-core integration
- **Coverage**: >90% para components

---

## 🔧 Enhanced Services

### 3. VTT Engine Service — Lighting Engine

#### 🎯 Purpose
Adicionar iluminação dinâmica, sombras e atmosfera visual à mesa virtual.

#### 🏗️ Architecture Pattern
**Domain Extension** do VTT Engine existente:

```
domain/
├── lighting/
│   ├── entities/
│   │   ├── LightSource.ts
│   │   ├── LightingLayer.ts
│   │   └── ShadowCaster.ts
│   ├── services/
│   │   ├── RaycastingEngine.ts
│   │   ├── LightingCalculator.ts
│   │   └── AtmosphereManager.ts
│   └── value-objects/
│       ├── LightIntensity.ts
│       ├── ColorTemperature.ts
│       └── ShadowGeometry.ts
```

#### ⚡ Raycasting Algorithm

**2D Raycasting Implementation**:
```typescript
class RaycastingEngine {
  // Spatial hashing para performance
  private spatialHash: SpatialHash;

  // Raycasting otimizado
  castRays(origin: Point, obstacles: Polygon[]): RayResult[] {
    const rays = this.generateRays(origin, 360, 1); // 1° resolution
    return rays.map(ray => this.castSingleRay(ray, obstacles));
  }

  // Spatial hashing para collision detection
  private getNearbyObstacles(point: Point, radius: number): Polygon[] {
    return this.spatialHash.query(point, radius);
  }
}
```

**Performance Optimizations**:
- **Spatial Hashing**: Grid-based collision detection
- **Level-of-Detail**: Different resolutions por distance
- **Caching**: Pre-computed shadows para static objects
- **WebWorkers**: Offload calculations do main thread

#### 🎨 Lighting Model

**Multi-layer Lighting**:
1. **Ambient Light**: Base illumination
2. **Point Lights**: Torches, lamps, spells
3. **Directional Light**: Sun/moon simulation
4. **Dynamic Shadows**: Real-time obstruction

**Color Temperature**:
- Warm lights (torches): 1800K-2500K
- Cool lights (magic): 4000K-6500K
- Neutral (daylight): 5500K

#### 📊 Performance Targets
- **Render FPS**: 120+ fps com lighting ativo
- **Raycast latency**: <16ms (60fps)
- **Memory usage**: <50MB para lighting state
- **Network sync**: <100ms p95

---

### 4. Automation Engine

#### 🎯 Purpose
Sistema de automações configuráveis para regras de jogo, permitindo GMs criar workflows complexos via UI.

#### 🏗️ Architecture Pattern
**DSL + Interpreter Pattern**:

```
domain/
├── automation/
│   ├── dsl/
│   │   ├── AutomationDSL.ts      // Grammar definition
│   │   ├── AutomationParser.ts   // AST builder
│   │   └── AutomationValidator.ts // Semantic validation
│   ├── entities/
│   │   ├── AutomationTemplate.ts
│   │   ├── AutomationInstance.ts
│   │   └── TriggerCondition.ts
│   ├── services/
│   │   ├── AutomationExecutor.ts
│   │   ├── ConditionEvaluator.ts
│   │   └── VariableResolver.ts
│   └── value-objects/
│       ├── DiceRoll.ts
│       ├── Condition.ts
│       └── Action.ts
```

#### 📝 Automation DSL

**Sample DSL**:
```dsl
automation "initiative_tracker" {
  trigger: "combat_start"

  variables {
    participants: list<character>
    current_turn: number = 0
  }

  actions {
    roll_initiative(participants)
    sort_by_initiative(participants)
    set_current_turn(0)
    broadcast("Combat started!")
  }
}

automation "damage_calculation" {
  trigger: "attack_roll"

  variables {
    attacker: character
    target: character
    weapon: item
    damage_roll: dice_result
  }

  conditions {
    target.hp > 0
    weapon.is_equipped
  }

  actions {
    calculate_damage(damage_roll, weapon.modifiers)
    apply_damage(target, damage_roll.total)
    check_death_saving_throw(target)
    if target.hp <= 0 {
      trigger("character_death", target)
    }
  }
}
```

#### 🔧 Execution Engine

**Safe Execution**:
- **Sandbox**: VM2 para isolamento
- **Timeout**: 5s max execution
- **Memory limits**: 100MB heap
- **Error handling**: Graceful degradation

**State Management**:
- **Context**: Game state + variables
- **Transactions**: Atomic execution
- **Rollback**: Error recovery
- **Logging**: Audit trail

#### 🎛️ UI Builder

**Visual Automation Builder**:
- Drag-and-drop interface
- Template library
- Real-time validation
- Preview execution

---

## 🔗 Integration Architecture

### Event-Driven Communication

**Event Schema** (RabbitMQ):
```typescript
// compendium.events
interface CompendiumEvents {
  'compendium.entry.created': EntryCreatedEvent;
  'compendium.entry.updated': EntryUpdatedEvent;
  'compendium.search.performed': SearchPerformedEvent;
}

// automation.events
interface AutomationEvents {
  'automation.executed': AutomationExecutedEvent;
  'automation.failed': AutomationFailedEvent;
}

// lighting.events
interface LightingEvents {
  'lighting.updated': LightingUpdatedEvent;
  'lighting.shadow.changed': ShadowChangedEvent;
}
```

### API Gateway Integration

**New Routes**:
```typescript
// Compendium API
GET    /api/v2/compendium/search
GET    /api/v2/compendium/:id
POST   /api/v2/compendium/import

// Automation API
POST   /api/v2/automations/execute
GET    /api/v2/automations/templates
PUT    /api/v2/automations/:id

// Lighting API
POST   /api/v2/maps/:id/lighting
GET    /api/v2/maps/:id/lighting/state
```

### Database Strategy

**Multi-Database Architecture**:
- **PostgreSQL**: Transactional data (users, campaigns, characters)
- **MongoDB**: Document data (compendium entries, automation templates)
- **Redis**: Cache + realtime state (lighting, automations)

---

## 📊 Performance Architecture

### Caching Strategy

**Multi-Level Caching**:
1. **Browser Cache**: Static assets, compendium data
2. **CDN**: Global distribution for assets
3. **Redis Cache**: API responses, search results
4. **Application Cache**: Computed lighting, automation state

### Monitoring & Observability

**Metrics Collection**:
- **Application Metrics**: Response times, error rates, throughput
- **Business Metrics**: Automation usage, search patterns, lighting performance
- **Infrastructure Metrics**: CPU, memory, network, database connections

**Logging Strategy**:
- **Structured Logging**: JSON format com correlation IDs
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Centralized**: Loki + Grafana para aggregation
- **Retention**: 30 dias para application logs

---

## 🔒 Security Architecture

### Authentication & Authorization

**JWT-Based Auth**:
- **Access Tokens**: 15min expiry
- **Refresh Tokens**: 7 days expiry
- **Scopes**: read:compendium, write:automation, admin:lighting

**RBAC Matrix**:
```
Role          | Compendium | Automation | Lighting | Admin
--------------|------------|------------|----------|-------
Player        | read       | execute    | read     | no
GM            | read       | read/write | read/write| no
Admin         | full       | full       | full     | full
```

### Data Protection

**Encryption**:
- **At Rest**: AES-256 para database
- **In Transit**: TLS 1.3 para all communications
- **Secrets**: HashiCorp Vault para credentials

**Privacy Compliance**:
- **Data Minimization**: Only collect necessary data
- **Consent Management**: User preferences for data usage
- **Audit Logging**: All data access logged
- **Retention Policies**: Automatic data deletion

---

## 🚀 Deployment Architecture

### Container Strategy

**Service Containers**:
```dockerfile
# compendium-service
FROM node:18-alpine
COPY dist/ .
EXPOSE 3001
CMD ["node", "main.js"]

# shared-ui (build-time only)
FROM node:18-alpine AS builder
COPY . .
RUN pnpm build
```

### Infrastructure

**Kubernetes Deployments**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: compendium-service
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: compendium
        image: compendium-service:v2.0.0
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### CI/CD Pipeline

**GitHub Actions**:
1. **Build**: TypeScript compilation, tests, linting
2. **Security**: SAST, dependency scanning, container scanning
3. **Deploy**: Blue-green deployment to staging/production
4. **Monitor**: Health checks, performance tests

---

## 📋 Decision Log

### ADR-007: Raycasting Algorithm Choice
**Context**: Need efficient 2D lighting calculation for realtime gaming  
**Decision**: Custom 2D raycasting with spatial hashing  
**Rationale**: Better performance than WebGL shaders for 2D maps, easier debugging  
**Consequences**: Higher CPU usage, but acceptable for target hardware

### ADR-008: Compendium Data Storage
**Context**: Need flexible schema for game content with search capabilities  
**Decision**: MongoDB + Elasticsearch hybrid  
**Rationale**: MongoDB for document flexibility, Elasticsearch for search performance  
**Consequences**: Additional infrastructure complexity, but better user experience

### ADR-009: Automation DSL Design
**Context**: Need user-friendly way to create complex game automations  
**Decision**: Custom DSL with visual builder  
**Rationale**: Balance between power and usability, safer than user code execution  
**Consequences**: Learning curve for DSL, but enables complex automations safely

### ADR-010: Shared UI Architecture
**Context**: Need consistent, accessible UI components across applications  
**Decision**: Atomic Design with Storybook + TypeScript  
**Rationale**: Scalable component architecture with excellent developer experience  
**Consequences**: Initial setup overhead, but long-term maintainability gains

---

## 🎯 Success Metrics

### Technical Metrics
- **Performance**: All targets met (lighting 120fps, search <200ms)
- **Reliability**: 99.9% uptime, <1% error rate
- **Security**: 0 critical vulnerabilities, full compliance
- **Maintainability**: >85% test coverage, documented APIs

### Business Metrics
- **User Adoption**: 80% of GMs using automations
- **Content Coverage**: 100% Tormenta20 rules covered
- **Performance**: No complaints about lighting lag
- **Satisfaction**: >4.5/5 user rating

---

## 📚 References

- [DDD Reference](https://domainlanguage.com/ddd/)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Atomic Design](https://atomicdesign.bradfrost.com/)
- [Raycasting Algorithms](https://lodev.org/cgtutor/raycasting.html)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Document Status**: 📋 **DRAFT FOR REVIEW**  
**Review Date**: 14 de Maio de 2026  
**Approval Required**: Tech Lead + Architect  
**Next Update**: Post-Sprint 0
