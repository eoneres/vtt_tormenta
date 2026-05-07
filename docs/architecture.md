# Arquitetura da Plataforma VTT Multissistema

> Fonte primária: `modelagem_vtt.docx` v1.0 — Maio 2025

---

## 1. Diagrama de Contexto (C4 Level 1)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PLATAFORMA VTT MULTISSISTEMA                       │
│                                                                             │
│  ┌──────────┐    HTTPS/WSS    ┌─────────────────────────────────────────┐  │
│  │  Browser │◄──────────────►│            API GATEWAY (Kong)           │  │
│  │ Next.js  │                │  rate-limit · auth · routing · tracing  │  │
│  └──────────┘                └──────────────┬──────────────────────────┘  │
│                                             │ REST / gRPC / Events         │
│              ┌──────────────────────────────┼──────────────────────────┐   │
│              │              MICROSERVIÇOS   │                          │   │
│              │                             ▼                          │   │
│              │  ┌─────────────┐  ┌──────────────────┐  ┌──────────┐  │   │
│              │  │  identity-  │  │    campaign-      │  │  rules-  │  │   │
│              │  │   service   │  │     service       │  │  engine  │  │   │
│              │  └──────┬──────┘  └────────┬─────────┘  └────┬─────┘  │   │
│              │         │                  │                  │        │   │
│              │  ┌──────▼──────┐  ┌────────▼─────────┐  ┌────▼─────┐  │   │
│              │  │    vtt-     │  │    realtime-      │  │compendium│  │   │
│              │  │   engine    │  │     gateway       │  │ service  │  │   │
│              │  └─────────────┘  └──────────────────┘  └──────────┘  │   │
│              │                                                        │   │
│              │  ┌─────────────┐  ┌──────────────────┐  ┌──────────┐  │   │
│              │  │ marketplace │  │  notification-   │  │ billing- │  │   │
│              │  │   service   │  │     service      │  │ service  │  │   │
│              │  └─────────────┘  └──────────────────┘  └──────────┘  │   │
│              └──────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                     MESSAGE BROKER (RabbitMQ)                        │  │
│  │  exchanges: identity.events · campaign.events · game.events          │  │
│  │             billing.events · notification.events                     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │   MongoDB    │  │    Redis 7   │  │  R2/S3/MinIO │  │
│  │  (relacional)│  │  (documentos)│  │ (cache + RT) │  │  (assets)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Diagrama de Contexto C4 Level 2 — Realtime Flow

```
Browser (PixiJS + Zustand)
        │
        │  WSS /realtime
        ▼
┌───────────────────────────────────────────────────────┐
│              realtime-gateway-service                 │
│                   (Colyseus)                          │
│                                                       │
│  Room: table:{table_id}                               │
│  ┌─────────────────────────────────────────────────┐  │
│  │  GameRoom (Colyseus Room)                       │  │
│  │  - onJoin: validate JWT + table membership      │  │
│  │  - onMessage: dispatch to command handlers      │  │
│  │  - state: MapState, TokenState, FogState        │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
│  Horizontal scaling: Redis Pub/Sub                    │
│  channel:table:{table_id}                             │
└───────────────┬───────────────────────────────────────┘
                │ HTTP (validação de regras)
                ▼
        rules-engine-service
                │
                │ Events (RabbitMQ)
                ▼
        campaign-service (persiste estado)
```

---

## 3. Bounded Contexts e Responsabilidades

| Bounded Context | Serviço | Responsabilidade | Banco |
|---|---|---|---|
| Identity & Auth | `identity-service` | Usuários, sessões, JWT, MFA, RBAC, OAuth2 | PostgreSQL + Redis |
| Campaign | `campaign-service` | Campanhas, mesas, personagens, NPCs, convites | PostgreSQL |
| Rules Engine | `rules-engine-service` | DSL, dados, fórmulas, automações, sandbox | MongoDB |
| VTT Engine | `vtt-engine-service` | Mapas, tokens, FoW, lighting, layers | MongoDB + Redis |
| Realtime Gateway | `realtime-gateway-service` | WebSocket, rooms, presença, sincronização | Redis |
| Compendium | `compendium-service` | Raças, classes, magias, monstros, itens | MongoDB + Redis |
| Marketplace | `marketplace-service` | Publicação, venda, DRM, homebrew, revenue share | PostgreSQL + MongoDB |
| Notification | `notification-service` | Push, e-mail, in-app, webhooks | PostgreSQL + Redis |
| Billing | `billing-service` | Planos, assinaturas, pagamentos (Pagar.me/Stripe) | PostgreSQL |

---

## 4. Estratégia de Comunicação entre Serviços

### 4.1 Comunicação Síncrona (REST/gRPC)
- Usada para: queries que precisam de resposta imediata (validação de token, busca de compêndio)
- Padrão: REST via API Gateway para chamadas externas; gRPC direto entre serviços internos críticos
- Circuit breaker: implementado em cada cliente HTTP (nestjs-circuit-breaker / opossum)
- Timeout padrão: 5s com retry exponencial (3 tentativas)

### 4.2 Comunicação Assíncrona (RabbitMQ)
- Usada para: eventos de domínio que não precisam de resposta síncrona
- Exchanges e routing keys:

```
identity.events
  └── user.registered
  └── user.deleted
  └── user.mfa_enabled

campaign.events
  └── campaign.created
  └── table.session_started
  └── character.updated

game.events
  └── roll.executed
  └── token.moved
  └── combat.turn_changed
  └── hp.changed

billing.events
  └── subscription.activated
  └── subscription.expired
  └── purchase.completed

notification.events
  └── notification.send_email
  └── notification.send_push
```

### 4.3 Realtime (Redis Pub/Sub + Colyseus)
- Eventos de mesa em tempo real via Colyseus rooms
- Sincronização entre pods via Redis Pub/Sub: `channel:table:{table_id}`
- Event batching: micro-eventos agrupados em frames de 50ms

---

## 5. Estratégia de Autenticação e Autorização

### 5.1 Fluxo de Autenticação
```
1. POST /auth/login → identity-service
2. Valida credenciais (Argon2id)
3. Emite: access_token (JWT RS256, 15min) + refresh_token (opaque, 30 dias, Redis)
4. API Gateway valida JWT em cada request (chave pública via JWKS endpoint)
5. Claims propagados via headers internos: X-User-Id, X-User-Roles, X-Session-Id
```

### 5.2 RBAC
| Role | Permissões |
|---|---|
| ADMIN | Acesso total à plataforma |
| GM | Gerencia campanhas, mesas, NPCs, mapas |
| PLAYER | Acessa mesas onde foi convidado, gerencia próprios personagens |
| SPECTATOR | Visualiza mesa sem interagir |
| CREATOR | Publica no marketplace, cria homebrew |

### 5.3 Autorização em Serviços
- Cada serviço valida permissões localmente via guards NestJS
- Política: deny-by-default, whitelist explícita por endpoint
- Recursos de campanha: validação de membership antes de qualquer operação

---

## 6. Estratégia de Observabilidade

### 6.1 Três Pilares
- **Logs**: JSON estruturado (Pino) → Loki → Grafana. Campos obrigatórios: `traceId`, `service`, `level`, `timestamp`, `userId` (anonimizado)
- **Métricas**: Prometheus scrape em `/metrics` de cada serviço → Grafana dashboards por serviço + SLO dashboards
- **Traces**: OpenTelemetry SDK em cada serviço → Jaeger/Tempo. TraceId propagado via W3C Trace Context headers

### 6.2 SLOs (do documento)
| Serviço | Disponibilidade | p95 | p99 |
|---|---|---|---|
| API Gateway | 99.9% | <200ms | <500ms |
| Realtime Gateway | 99.9% | <50ms | <150ms |
| Rules Engine | 99.5% | <100ms | <300ms |
| Compendium API | 99.5% | <300ms | <800ms |
| Marketplace API | 99.5% | <500ms | <1500ms |

---

## 7. Estratégia DevSecOps

### 7.1 Pipeline CI/CD (GitHub Actions)
```
PR → main:
  1. lint-typecheck     (ESLint + tsc --noEmit)
  2. unit-tests         (Jest, >80% coverage obrigatório)
  3. integration-tests  (Pact contract tests)
  4. sast               (SonarQube)
  5. sca                (Snyk / Dependabot)
  6. secret-scan        (Gitleaks)
  7. container-scan     (Trivy)
  8. iac-scan           (Checkov)
  9. build-push         (Docker → registry privado)
 10. deploy-staging     (Helm upgrade)
 11. e2e-tests          (Playwright)
 12. deploy-production  (Blue/Green + rollback automático)
```

### 7.2 Gestão de Secrets
- Desenvolvimento: `.env.local` (nunca versionado)
- Staging/Production: HashiCorp Vault ou AWS Secrets Manager
- Kubernetes: External Secrets Operator sincroniza Vault → K8s Secrets
- Rotação automática de chaves JWT a cada 90 dias

---

## 8. Estratégia de Testes

| Tipo | Ferramenta | Cobertura Mínima | Quando Roda |
|---|---|---|---|
| Unit | Jest | 80% | PR |
| Integration | Jest + Testcontainers | Críticos | PR |
| Contract | Pact | Todos os contratos | PR |
| E2E | Playwright | Fluxos críticos | Staging |
| Load | k6 | SLOs validados | Pré-release |
| Realtime | Colyseus test client | Rooms críticas | PR |

---

## 9. Estratégia de Realtime Multiplayer

### 9.1 Modelo Authoritative Server
- Cliente envia **intenções** (ex: `MOVE_TOKEN {tokenId, x, y}`)
- Servidor valida contra regras do sistema (distância máxima, LOS, permissões)
- Servidor aplica ao estado canônico e faz broadcast para todos os clientes da room
- Cliente NUNCA aplica estado localmente antes da confirmação do servidor

### 9.2 Reconexão e Resiliência
- Estado da mesa cacheado no Redis: `table:state:{table_id}`
- Ao reconectar, cliente recebe snapshot completo do estado atual
- Eventos perdidos durante desconexão são reenviados via event log

### 9.3 Escalabilidade Horizontal
- Múltiplos pods do realtime-gateway-service
- Redis Pub/Sub como backplane: evento em pod A é replicado para pod B
- Sticky sessions via Kong (mesmo pod para mesma room, fallback via Redis)

---

## 10. Estratégia LGPD/Compliance

- **Privacy by Design**: PII nunca em logs, IPs anonimizados após 30 dias
- **Minimização**: coleta apenas dados necessários (ver tabela no documento)
- **Direito ao esquecimento**: soft delete imediato + purge em 30 dias
- **Portabilidade**: `GET /me/data` exporta tudo em JSON/CSV
- **Auditoria**: tabela `audit_logs` append-only, imutável
- **DPO**: canal `privacidade@plataforma.com.br`
- **Incidentes**: notificação ANPD em até 72h (Art. 48 LGPD)

---

## 11. Convenções do Monorepo (Turborepo)

### 11.1 Estrutura de Pacotes
```
apps/          → aplicações deployáveis (Next.js, NestJS services)
packages/      → bibliotecas compartilhadas (sem deploy próprio)
infrastructure/ → IaC, Docker, Helm, K8s
docs/          → documentação arquitetural
```

### 11.2 Convenções de Código
- TypeScript strict mode em todos os pacotes (`"strict": true`)
- Sem `any` explícito (ESLint: `@typescript-eslint/no-explicit-any: error`)
- Imports absolutos via path aliases (`@vtt/shared-types`, `@vtt/shared-events`)
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)
- Branches: `main` (produção), `develop` (integração), `feat/*`, `fix/*`

### 11.3 Versionamento
- Monorepo: versão independente por pacote (Changesets)
- APIs: versionamento via URL (`/v1/`, `/v2/`)
- Eventos: versionamento no payload (`"version": "1.0"`)
- Imagens Docker: tag = git SHA + semver (`1.2.3-abc1234`)

---

## 12. Dependências entre Serviços

```
frontend
  └── api-gateway (REST)
  └── realtime-gateway-service (WSS)

api-gateway
  └── identity-service (auth validation)
  └── campaign-service
  └── rules-engine-service
  └── vtt-engine-service
  └── compendium-service
  └── marketplace-service
  └── billing-service

realtime-gateway-service
  └── identity-service (JWT validation)
  └── rules-engine-service (rule validation)
  └── vtt-engine-service (map/token state)
  └── Redis (Pub/Sub backplane)

campaign-service
  └── identity-service (user validation)
  └── rules-engine-service (system validation)
  └── notification-service (events → RabbitMQ)

billing-service
  └── identity-service
  └── notification-service (events → RabbitMQ)

marketplace-service
  └── identity-service
  └── billing-service
  └── compendium-service

notification-service
  └── (consumer only — recebe eventos via RabbitMQ)
```
