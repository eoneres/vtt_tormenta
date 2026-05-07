# VTT Tormenta — Plataforma VTT Multissistema

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
