# VTT Platform — Plataforma de RPG Online Multissistema

> Mesa virtual cloud-native, authoritative-server, multi-sistema, LGPD-compliant.  
> Inspirado no Roll20 e D&D Beyond. Foco inicial em **Tormenta20**, D&D 5e e Shadowrun.

[![CI](https://github.com/your-org/vtt-tormenta/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/vtt-tormenta/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/your-org/vtt-tormenta/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/vtt-tormenta)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Visão Geral da Arquitetura

```
                              ┌──────────────────────────────────┐
                              │         Frontend (Next.js 14)     │
                              │  PixiJS · React · Zustand · TQ    │
                              └──────────────┬───────────────────┘
                                             │ HTTPS / WSS
                              ┌──────────────▼───────────────────┐
                              │          API Gateway             │
                              │  Rate limit · Auth · Routing      │
                              └──┬─────┬──────┬────┬──────┬──────┘
                                 │     │      │    │      │
          ┌──────────────────────┘     │      │    │      └─────────────────────┐
          │                    ┌───────┘      │    └──────────┐                 │
          ▼                    ▼              ▼               ▼                 ▼
  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐
  │   Identity    │  │   Campaign   │  │ Rules Engine │  │  Compendium  │  │ Billing  │
  │   Service     │  │   Service    │  │   Service    │  │   Service    │  │ Service  │
  │  JWT·MFA·RBAC │  │ Campaigns·   │  │ Dice·DSL·    │  │ T20·DnD5e·  │  │ Plans·   │
  │               │  │ Characters   │  │ Automations  │  │ Homebrew     │  │ Pagar.me │
  └───────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘

          ┌─────────────────────────────────────────────────────────────────────┐
          │                    Realtime Layer (Colyseus)                         │
          │         WebSocket · Authoritative State · Fog · Lighting            │
          └─────────────────────────────────────────────────────────────────────┘

          ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
          │  VTT Engine      │    │  Notification    │    │  Marketplace     │
          │  Map·Fog·Light   │    │  SSE · Email ·   │    │  Listings ·      │
          │  LOS·Raycasting  │    │  Push            │    │  Reviews · CDN   │
          └──────────────────┘    └──────────────────┘    └──────────────────┘

          ┌──────────────────────────────────────────────────────────────────┐
          │                      Data Layer                                   │
          │   PostgreSQL (relational) · MongoDB (documents) · Redis (cache)   │
          └──────────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Next.js 14, React, TypeScript, PixiJS, Zustand, React Query, TailwindCSS |
| **Backend** | NestJS, TypeScript (strict), Fastify adapter |
| **Realtime** | Colyseus 0.15, WebSocket, State machine autorizada |
| **Bancos** | PostgreSQL 16, MongoDB 7, Redis 7 |
| **Infra** | Docker, Kubernetes, Helm, Terraform, GitHub Actions |
| **Observabilidade** | Prometheus, Grafana, Loki, Jaeger (OpenTelemetry) |
| **Segurança** | JWT RS256, Argon2id, Rate limiting, CSP, OWASP Top 10 |
| **Monorepo** | Turborepo, pnpm workspaces |

---

## Estrutura do Repositório

```
/apps
  /api-gateway              ← Proxy reverso, rate limit, auth middleware
  /identity-service         ← Autenticação, JWT, MFA, RBAC, LGPD
  /campaign-service         ← Campanhas, mesas, personagens (T20/D&D5e)
  /rules-engine-service     ← Dice engine, DSL, automações, fórmulas
  /vtt-engine-service       ← Mapas, tokens, fog of war, iluminação
  /realtime-gateway-service ← Colyseus rooms, sincronização em tempo real
  /compendium-service       ← Conteúdo oficial e homebrew (MongoDB)
  /notification-service     ← SSE, email, push, preferências
  /marketplace-service      ← Listagens de homebrew, reviews, CDN
  /billing-service          ← Assinaturas, planos, webhooks Pagar.me
  /frontend                 ← Next.js app (mesa VTT + dashboard + admin)

/packages
  /shared-types             ← Tipos TypeScript compartilhados
  /shared-events            ← Contratos de eventos entre serviços
  /shared-auth              ← Guards, decorators, JWT utilities
  /shared-config            ← Variáveis de ambiente tipadas e validadas
  /shared-ui                ← Componentes React: Button, Badge, DiceRoller...
  /shared-utils             ← generateId, slugify, formatDate...

/infrastructure
  /helm                     ← Helm charts por serviço
  /kubernetes               ← Manifests K8s (namespaces, network policies)
  /monitoring               ← Prometheus alerts, Grafana dashboards
  /terraform                ← IaC para AWS/GCP

/load-tests                 ← k6 scripts (API gateway + realtime)
/e2e                        ← Playwright E2E tests + fixtures
/docs
  /adr                      ← Architecture Decision Records (10 ADRs)
```

---

## Início Rápido

### Pré-requisitos

- Node.js 20+
- pnpm 9+
- Docker + Docker Compose
- (opcional) kubectl + Helm para K8s

### Instalação

```bash
# Clone o repositório
git clone https://github.com/your-org/vtt-tormenta.git
cd vtt-tormenta

# Instale dependências
pnpm install

# Copie as variáveis de ambiente
cp .env.example .env
cp apps/compendium-service/.env.example apps/compendium-service/.env

# Suba a infraestrutura (MongoDB, PostgreSQL, Redis, RabbitMQ)
docker compose up -d postgres mongodb redis rabbitmq

# Build dos pacotes compartilhados
pnpm turbo run build --filter="@vtt/shared-*"

# Seed do compêndio Tormenta20
SEED_ON_BOOT=true pnpm --filter @vtt/compendium-service dev

# Suba todos os serviços em modo dev
pnpm dev
```

### Serviços e Portas

| Serviço | Porta | URL |
|---------|-------|-----|
| Frontend | 3000 | http://localhost:3000 |
| API Gateway | 8080 | http://localhost:8080 |
| Identity Service | 3001 | http://localhost:3001/api/docs |
| Campaign Service | 3002 | http://localhost:3002/api/docs |
| Rules Engine | 3003 | http://localhost:3003/api/docs |
| VTT Engine | 3004 | http://localhost:3004/api/docs |
| Realtime Gateway | 2567 | ws://localhost:2567 |
| Compendium Service | 3040 | http://localhost:3040/api/docs |
| Notification Service | 3050 | http://localhost:3050/api/docs |
| Marketplace Service | 3060 | http://localhost:3060/api/docs |
| Billing Service | 3070 | http://localhost:3070/api/docs |
| Grafana | 3100 | http://localhost:3100 |
| Prometheus | 9090 | http://localhost:9090 |
| Jaeger | 16686 | http://localhost:16686 |

---

## Testes

```bash
# Unit tests com coverage
pnpm test:coverage

# Integration tests (requer serviços Docker rodando)
pnpm turbo run test:integration

# E2E (Playwright)
pnpm exec playwright test

# Load tests (requer k6 instalado)
k6 run load-tests/scripts/api-gateway.k6.js
k6 run load-tests/scripts/realtime.k6.js
```

### Cobertura Atual

| Serviço | Unit | Integration |
|---------|------|-------------|
| identity-service | ~85% | ✅ |
| compendium-service | ~80% | ✅ |
| rules-engine-service | ~88% | ✅ |
| campaign-service | ~82% | ✅ |
| notification-service | ~85% | ✅ |
| marketplace-service | ~83% | ✅ |
| billing-service | ~88% | 🔄 |
| vtt-engine-service | ~75% | 🔄 |
| realtime-gateway-service | ~70% | 🔄 |

---

## Architecture Decision Records

| ADR | Título | Status |
|-----|--------|--------|
| [ADR-001](docs/adr/ADR-001-microservices-event-driven.md) | Microserviços + Event-Driven Architecture | Aceito |
| [ADR-002](docs/adr/ADR-002-authoritative-server.md) | Authoritative Server Model | Aceito |
| [ADR-003](docs/adr/ADR-003-system-agnostic-rules-engine.md) | Rules Engine System-Agnostic via DSL | Aceito |
| [ADR-004](docs/adr/ADR-004-polyglot-persistence.md) | Persistência Poliglota (PG + Mongo + Redis) | Aceito |
| [ADR-005](docs/adr/ADR-005-jwt-rs256-jwks.md) | JWT RS256 + JWKS | Aceito |
| [ADR-006](docs/adr/ADR-006-colyseus-realtime.md) | Colyseus para Realtime | Aceito |
| [ADR-007](docs/adr/ADR-007-turborepo-monorepo.md) | Turborepo Monorepo | Aceito |
| [ADR-008](docs/adr/ADR-008-automation-dsl.md) | Automation DSL JSON | Aceito |
| [ADR-009](docs/adr/ADR-009-compendium-mongodb-search.md) | Compendium MongoDB + Full-text | Aceito |
| [ADR-010](docs/adr/ADR-010-notification-sse-multichannel.md) | Notifications via SSE + Multi-channel | Aceito |

---

## Fases de Desenvolvimento

| Fase | Entregáveis Principais | Status |
|------|----------------------|--------|
| **Fase 01** | Monorepo, CI/CD, Identity, API Gateway, Rules Engine, VTT Engine, Realtime, Frontend MVP | ✅ Completo |
| **Fase 02** | Compendium (T20 seed), shared-ui, Automation DSL, Lighting/FoW, Campaign/Character, Notification, Marketplace, Billing | ✅ Completo |
| **Fase 03** | Persistência real, T20 completo, D&D 5e, APIs públicas, Go-Live | 🔄 Planejado |

---

## Funcionalidades

### Mesa Virtual (VTT)
- 🗺️ Mapas com grid quadrado, hexagonal e livre
- 🌫️ Fog of War progressivo (por célula) com revelação por LOS
- 💡 Iluminação dinâmica com raycasting, penumbra e cores
- 🎭 Tokens arrastáveis com HP/MP bars e condições visuais
- 📏 Ferramenta de medição (linha, círculo, cone, retângulo)
- 🧱 Paredes e portas interativas com bloqueio de LOS/luz
- 🎲 Chat de dados integrado ao chat da mesa

### Sistemas de RPG
- 🐉 **Tormenta20** — fichas completas com 23 perícias, poderes, magias por círculo
- ⚔️ **D&D 5e** — fichas com advantage/disadvantage, backgrounds, subclasses
- 🤖 **Shadowrun** — dice pools, contagem de acertos, glitch detection
- ⚙️ **Custom** — sistema próprio via DSL JSON

### Automações
- ⚡ 10+ templates prontos para Tormenta20 (Fúria, Veneno, Regeneração...)
- 🔧 Editor de automações sem código (Trigger → Condition → Actions)
- 🔒 Execução 100% server-side (authoritative)
- 🧮 Template engine `{{field.path}}` para mensagens dinâmicas

### Compêndio
- 📚 34+ entradas oficiais Tormenta20 (raças, classes, magias, monstros, condições)
- 🔍 Busca full-text com tags e atributos
- 🛠 Sistema homebrew por usuário
- 📱 Arrastar-para-ficha direto do compêndio

### LGPD (Art. 18)
- 📤 Exportação portável dos dados pessoais
- 🗑️ Direito ao esquecimento com anonimização seletiva
- ✅ Histórico de consentimentos por tipo
- 📋 Informações de tratamento de dados públicas

---

## Segurança

- **Autenticação:** JWT RS256 com JWKS endpoint, refresh tokens rotativos
- **Senhas:** Argon2id com parâmetros recomendados (memory=64MB, iterations=3)
- **MFA:** TOTP (Google Authenticator compatível)
- **Rate Limiting:** Por endpoint, por IP e por usuário autenticado
- **RBAC:** Roles: `user`, `gm`, `admin` com verificação em cada serviço
- **OWASP:** CSP, CSRF token, validação de input com class-validator/Zod
- **Auditoria:** Logs estruturados de todas as ações sensíveis

---

## Contribuindo

Ver [CONTRIBUTING.md](CONTRIBUTING.md). Em resumo:

1. Fork e crie sua branch: `git checkout -b feat/minha-feature`
2. Siga as convenções: Conventional Commits, TypeScript strict, testes obrigatórios
3. `pnpm lint && pnpm typecheck && pnpm test`
4. Abra um PR contra `develop`

---

## Licença

MIT © VTT Platform Team
 — Plataforma VTT Multissistema

SaaS cloud-native de RPG online com foco em **Tormenta20**, D&D 5e e Shadowrun.  
Arquitetura enterprise-grade: microserviços, event-driven, realtime multiplayer, LGPD-compliant.

---

## Documentação

| Documento | Descrição |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | Diagramas, bounded contexts, estratégias |
| [`docs/roadmap.md`](docs/roadmap.md) | Roadmap técnico e backlog por fase |
| [`docs/adr/`](docs/adr/) | Architecture Decision Records |
| [`modelagem_vtt.docx`](modelagem_vtt.docx) | **Fonte primária de verdade** |

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14, TypeScript, PixiJS, Zustand, React Query, TailwindCSS |
| Backend | NestJS, TypeScript, Fastify |
| Realtime | Colyseus, WebSockets |
| Bancos | PostgreSQL 16, MongoDB 7, Redis 7 |
| Mensageria | RabbitMQ |
| Infra | Kubernetes (EKS), Helm, Terraform, Docker |
| Observabilidade | Prometheus, Grafana, Loki, OpenTelemetry, Jaeger |
| CI/CD | GitHub Actions, ArgoCD |

---

## Estrutura do Monorepo

```
apps/
  frontend/                  # Next.js 14 — SPA + canvas VTT
  api-gateway/               # Kong OSS / NestJS gateway
  identity-service/          # Auth, JWT RS256, MFA, RBAC, OAuth2
  campaign-service/          # Campanhas, mesas, personagens
  rules-engine-service/      # DSL de sistemas RPG, dice engine, sandbox
  vtt-engine-service/        # Mapas, tokens, FoW, lighting
  realtime-gateway-service/  # Colyseus WebSocket rooms
  compendium-service/        # Raças, classes, magias, monstros
  marketplace-service/       # Publicação, venda, DRM, homebrew
  notification-service/      # E-mail, push, in-app
  billing-service/           # Assinaturas, Pagar.me, Stripe

packages/
  shared-types/              # Tipos TypeScript compartilhados
  shared-events/             # Contratos de eventos RabbitMQ
  shared-auth/               # Guards, decorators, JWT strategy NestJS
  shared-config/             # Validação de env com Zod
  shared-utils/              # Utilitários: ID, hash, paginação, LGPD
  shared-ui/                 # Componentes React reutilizáveis

infrastructure/
  terraform/                 # IaC: VPC, EKS, RDS, ElastiCache
  helm/                      # Helm charts por serviço
  kubernetes/                # Namespaces, network policies, RBAC
  docker/                    # Configs: Prometheus, Loki, Grafana, Postgres

docs/
  architecture.md
  roadmap.md
  adr/                       # ADR-001 a ADR-007
```

---

## Setup Local

### Pré-requisitos

- Node.js >= 20
- pnpm >= 9
- Docker + Docker Compose

### Instalação

```bash
# Instalar dependências
pnpm install

# Subir infraestrutura local (bancos, RabbitMQ, observabilidade)
docker compose up -d postgres mongodb redis rabbitmq

# Configurar variáveis de ambiente
cp apps/identity-service/.env.example apps/identity-service/.env.local
# Editar .env.local com suas chaves

# Rodar migrations do PostgreSQL
cd apps/identity-service
pnpm migration:run
cd ../..

# Build dos pacotes compartilhados
pnpm turbo run build --filter=@vtt/shared-*

# Rodar serviço em desenvolvimento
pnpm turbo run dev --filter=@vtt/identity-service
```

### Gerar chaves JWT RS256

```bash
openssl genrsa -out private.pem 4096
openssl rsa -in private.pem -pubout -out public.pem
```

---

## Desenvolvimento

```bash
# Lint
pnpm lint

# Typecheck
pnpm typecheck

# Testes
pnpm test

# Testes com coverage
pnpm test:coverage

# Build completo
pnpm build
```

---

## Roadmap

| Fase | Duração | Entregas |
|---|---|---|
| **Fase 0** — Fundação | 2 meses | Infra, CI/CD, Identity Service |
| **Fase 1** — MVP | 4 meses | VTT básico, fichas T20/D&D 5e, chat, rolagens |
| **Fase 2** — Experiência | 3 meses | Iluminação dinâmica, compêndio, automações |
| **Fase 3** — Ecossistema | 4 meses | Marketplace, homebrew, APIs públicas |
| **Fase 4** — Expansão | Contínuo | Mobile, IA, novos sistemas |

---

## Segurança

- JWT RS256 com rotação de chaves via JWKS
- Argon2id para senhas (64MB memória, 3 iterações)
- Zero Trust: toda requisição autentica e autoriza
- Authoritative Server: cliente nunca é fonte de verdade
- OWASP Top 10 mitigado em todas as camadas
- LGPD: Privacy by Design, direito ao esquecimento, exportação de dados

---

## Licença

Proprietário — todos os direitos reservados.
