# Roadmap Técnico — VTT Multissistema

> Baseado em: `modelagem_vtt.docx` v1.0

---

## Fase 0 — Fundação (2 meses)

### Objetivo
Infraestrutura base operacional, identity service funcional, estrutura de banco de dados, CI/CD pipeline completo.

### Entregas

#### Semana 1-2: Monorepo e Tooling
- [ ] Inicializar monorepo Turborepo + pnpm workspaces
- [ ] Configurar TypeScript strict em todos os pacotes
- [ ] ESLint + Prettier + Husky + lint-staged
- [ ] Conventional Commits + Changesets
- [ ] `packages/shared-types`: tipos base (User, Campaign, Table, Character, etc.)
- [ ] `packages/shared-events`: contratos de eventos RabbitMQ
- [ ] `packages/shared-auth`: guards, decorators, JWT utilities
- [ ] `packages/shared-config`: env validation com Zod
- [ ] `packages/shared-utils`: helpers comuns

#### Semana 3-4: Infraestrutura Base
- [ ] Dockerfiles multi-stage para cada serviço
- [ ] `docker-compose.yml` para desenvolvimento local (todos os serviços + bancos)
- [ ] Terraform base: VPC, EKS/GKE cluster, RDS PostgreSQL, ElastiCache Redis
- [ ] Helm charts base para cada microserviço
- [ ] Kubernetes manifests: namespaces, network policies, resource quotas
- [ ] External Secrets Operator configurado
- [ ] Observabilidade: Prometheus + Grafana + Loki + Jaeger stack

#### Semana 5-6: CI/CD Pipeline
- [ ] GitHub Actions: lint → test → SAST → SCA → secret-scan → container-scan → IaC-scan
- [ ] Build e push de imagens Docker para registry privado
- [ ] Deploy automático para staging via Helm
- [ ] Playwright E2E em staging
- [ ] Blue/Green deployment para produção com rollback automático
- [ ] ArgoCD para GitOps

#### Semana 7-8: Identity Service
- [ ] `apps/identity-service`: NestJS com DDD (domain/application/infrastructure)
- [ ] Cadastro com Argon2id
- [ ] Login com JWT RS256 + refresh token rotation
- [ ] JWKS endpoint (`/.well-known/jwks.json`)
- [ ] OAuth2: Google, Discord
- [ ] MFA: TOTP (speakeasy)
- [ ] RBAC: roles ADMIN, GM, PLAYER, SPECTATOR, CREATOR
- [ ] Sessões multi-device com revogação remota
- [ ] Audit log de eventos de autenticação
- [ ] Rate limiting: 5 tentativas → lockout + CAPTCHA progressivo
- [ ] Healthcheck, readiness/liveness probes, métricas Prometheus, OpenTelemetry

---

## Fase 1 — MVP (4 meses)

### Objetivo
Mesa virtual funcional com Tormenta20 e D&D 5e, fichas automatizadas, chat e rolagens.

### Entregas

#### Mês 1: API Gateway + Campaign Service
- [ ] `apps/api-gateway`: Kong OSS ou NestJS gateway
  - Roteamento para todos os serviços
  - JWT validation middleware
  - Rate limiting por IP e por user
  - Request logging + tracing
  - API versioning (`/v1/`)
  - OpenAPI aggregation
- [ ] `apps/campaign-service`:
  - CRUD de campanhas, mesas, personagens, NPCs
  - Sistema de convites (PlayerInvite)
  - Session logs
  - Eventos para RabbitMQ

#### Mês 2: Rules Engine Service
- [ ] `apps/rules-engine-service`:
  - DSL loader: carrega sistema de RPG via JSON
  - Dice Engine: d4-d100, pools, exploding, success counting, advantage/disadvantage
  - Formula Evaluator: sandbox segura (vm2 ou isolated-vm)
  - Event Bus interno: ON_ATTACK, ON_DAMAGE, ON_HEAL, etc.
  - Buff/Debuff Manager
  - Condition Tracker
  - DSL para Tormenta20 completo
  - DSL para D&D 5e completo
  - Audit log de todas as rolagens (seed + assinatura)

#### Mês 3: VTT Engine + Realtime Gateway
- [ ] `apps/vtt-engine-service`:
  - Mapas: grid quadrado e hexagonal, múltiplas layers
  - Fog of War: por token e global
  - Token management: posição, HP bar, auras, status
  - Ferramentas de medição
  - Iniciativa tracker
- [ ] `apps/realtime-gateway-service`:
  - Colyseus rooms por mesa
  - GameRoom com state tipado
  - Command handlers: MOVE_TOKEN, ROLL_DICE, UPDATE_HP, etc.
  - Redis Pub/Sub backplane
  - Reconexão com snapshot de estado
  - Event batching 50ms

#### Mês 4: Frontend MVP
- [ ] `apps/frontend`: Next.js 14
  - Autenticação (login, registro, OAuth, MFA)
  - Dashboard de campanhas
  - Mesa virtual com PixiJS:
    - Renderização de mapa
    - Tokens com drag-and-drop
    - Fog of War
    - Chat com rolagens inline
  - Ficha de personagem Tormenta20 (schema-driven)
  - Ficha de personagem D&D 5e
  - Integração WebSocket com realtime-gateway

---

## Fase 2 — Experiência (3 meses)

- [ ] Iluminação dinâmica: raycasting, LOS, sombras, fontes de luz
- [ ] Compendium Service completo (Tormenta20)
- [ ] Sistema de automações (Automation Engine)
- [ ] Iniciativa tracker avançado
- [ ] Audio player para trilhas sonoras
- [ ] Melhorias de UX na mesa virtual
- [ ] `packages/shared-ui`: componentes React reutilizáveis

---

## Fase 3 — Ecossistema (4 meses)

- [ ] `apps/marketplace-service`: publicação, venda, DRM, revenue share
- [ ] Homebrew builder: classes, origens, poderes, magias, raças, monstros
- [ ] APIs públicas documentadas (OpenAPI)
- [ ] Webhooks para integrações externas
- [ ] SDKs: TypeScript, Python
- [ ] `apps/notification-service`: e-mail, push, in-app
- [ ] `apps/billing-service`: Pagar.me (PIX) + Stripe

---

## Fase 4 — Expansão (contínuo)

- [ ] Suporte a Shadowrun (DSL)
- [ ] Mobile apps (React Native)
- [ ] IA: resumo de sessão, geração de NPCs
- [ ] Novos sistemas de RPG via comunidade
- [ ] Ferramentas de acessibilidade

---

## Critérios de Go-Live (MVP — Fase 1)

- [ ] Suporte completo a Tormenta20 e D&D 5e com fichas automatizadas
- [ ] Mesa virtual funcional com até 8 jogadores simultâneos por sala
- [ ] Latência de sincronização < 100ms p95 no Brasil
- [ ] Conformidade LGPD verificada por assessoria jurídica
- [ ] Penetration test aprovado (sem críticos/altos não resolvidos)
- [ ] 99.5% uptime em 30 dias de staging com carga simulada

---

## Backlog Inicial — Épicos

| ID | Épico | Fase | Prioridade |
|---|---|---|---|
| E01 | Monorepo e tooling base | 0 | Crítica |
| E02 | Infraestrutura Docker/K8s/Terraform | 0 | Crítica |
| E03 | CI/CD Pipeline completo | 0 | Crítica |
| E04 | Identity Service (auth, JWT, MFA, RBAC) | 0 | Crítica |
| E05 | API Gateway (routing, rate limit, auth) | 1 | Alta |
| E06 | Campaign Service (campanhas, mesas, personagens) | 1 | Alta |
| E07 | Rules Engine (DSL, dice, fórmulas, sandbox) | 1 | Alta |
| E08 | VTT Engine (mapas, tokens, FoW) | 1 | Alta |
| E09 | Realtime Gateway (Colyseus, rooms, sync) | 1 | Alta |
| E10 | Frontend MVP (mesa, fichas, chat) | 1 | Alta |
| E11 | Compendium Service (T20 completo) | 2 | Média |
| E12 | Iluminação dinâmica (raycasting, LOS) | 2 | Média |
| E13 | Marketplace + Homebrew | 3 | Baixa |
| E14 | Billing Service (Pagar.me, Stripe) | 3 | Baixa |
| E15 | Notification Service | 3 | Baixa |
| E16 | APIs públicas + SDKs | 3 | Baixa |
