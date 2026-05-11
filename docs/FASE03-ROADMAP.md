# Fase 03 — Kickoff e Roadmap

**Data:** Início previsto após aprovação da Fase 02  
**Status:** Planejado  
**Objetivo:** Levar a plataforma ao nível de produção com MVP Go-Live

---

## Visão Geral

A Fase 03 consolida toda a fundação construída nas Fases 01 e 02, adiciona as
funcionalidades faltantes para um produto viável de mercado, e prepara a
infraestrutura para o Go-Live com foco em Tormenta20 como sistema primário.

### Critérios de Go-Live (todos obrigatórios)

| Critério | Métrica | Responsável |
|----------|---------|-------------|
| Latência de sincronização | P95 < 100ms no Brasil | Platform |
| Uptime | 99.5% em 30 dias de staging com carga real | Platform |
| Testes de carga | 100 mesas simultâneas, 8 jogadores/mesa | QA |
| Pentest | Zero críticos/altos não resolvidos | Security |
| LGPD | Validação jurídica completa | Legal |
| Fichas T20 | Personagem nível 1-20 funcional | Product |
| Compêndio | Todos os conteúdos do Livro Básico T20 | Content |

---

## Sprints

### Sprint 7 — Persistência Real e Notificações Produção (2 semanas)

**Objetivo:** Substituir todos os stores in-memory por persistência real.

**Automations → MongoDB**
- [ ] Migrar `AutomationRepository` in-memory → `MongooseAutomationRepository`
- [ ] Seed de templates built-in na boot via `AutomationSeederService`
- [ ] Testes de integração do automation repository

**Notifications → Redis + PostgreSQL**
- [ ] Redis pub/sub como broker entre instâncias do notification-service
- [ ] PostgreSQL para histórico persistente (últimos 90 dias)
- [ ] Migração do `Map<string, Notification[]>` para repositório PostgreSQL
- [ ] Email templates com Handlebars (session_starting, campaign_invite, level_up)

**Marketplace → PostgreSQL**
- [ ] Schema e migrations Prisma para `marketplace_listings`
- [ ] Full-text search via PostgreSQL `tsvector`
- [ ] CDN upload endpoint para assets (S3/Cloudflare R2)
- [ ] Asset integrity check via SHA-256

**Billing → PostgreSQL + Pagar.me**
- [ ] Schema para `subscriptions`, `invoices`, `payment_methods`
- [ ] Integração com Pagar.me (pagamentos BR-native) ou Stripe
- [ ] Webhook handler com verificação HMAC
- [ ] Dunning logic: past_due → 3 tentativas em 7 dias → cancel

---

### Sprint 8 — Compêndio Completo Tormenta20 (2 semanas)

**Objetivo:** Seed completo do Livro Básico T20 no compêndio.

**Conteúdo a adicionar:**
- [ ] 16 raças completas (todas as do LB)
- [ ] 14 classes completas com progressão 1-20
- [ ] 20 origens
- [ ] 50+ poderes de combate
- [ ] 40+ poderes de destino  
- [ ] 80+ magias de 1º a 5º círculo
- [ ] 30+ rituais
- [ ] 60+ monstros (ND 1 a 20)
- [ ] 100+ itens e equipamentos
- [ ] 25+ condições
- [ ] Divindades de Arton

**Fichas automatizadas:**
- [ ] Cálculo automático de modificadores ao mudar atributos
- [ ] Progressão de classe (HP, PM, poderes por nível)
- [ ] Automações built-in: ataque furtivo, fúria bárbara, imposição de mãos
- [ ] Integração compêndio ↔ ficha (arrastar poder/magia para a ficha)

---

### Sprint 9 — D&D 5e + Shadowrun Foundation (2 semanas)

**Objetivo:** Suporte multi-sistema funcional.

**D&D 5e:**
- [ ] Character sheet D&D 5e com atributos, perícias, saving throws
- [ ] Seed das classes principais (Fighter, Wizard, Rogue, Cleric, Paladin)
- [ ] Raças (Human, Elf, Dwarf, Halfling, Dragonborn)
- [ ] Backgrounds (Acolyte, Criminal, Noble, Sage)
- [ ] Condições D&D (Blinded, Charmed, Exhaustion 1-6, etc.)
- [ ] Sistema advantage/disadvantage (2d20kh1 / 2d20kl1)

**Shadowrun (DSL only):**
- [ ] Schema DSL para dice pools (count successes)
- [ ] Rolagens `Nd6` com contagem de acertos (5+)
- [ ] Glitch detection (metade+ dados = 1)
- [ ] 10 qualidades básicas no compêndio

---

### Sprint 10 — VTT Engine: Mapas Avançados (2 semanas)

**Objetivo:** Engine visual completo para sessões imersivas.

**Iluminação e visão:**
- [ ] Integração completa `AdvancedLightingEngine` → `realtime-gateway-service`
- [ ] Sincronização de estado de FoW entre todos os jogadores da mesa
- [ ] Fontes de luz em tokens (tocha, lanterna, luz mágica)
- [ ] Visão no escuro por raça (Anão 18m, Elfo 18m, etc.)

**Mapas:**
- [ ] Upload de imagens de mapa (JPG/PNG/WebP, max 20MB)
- [ ] Grid configurável: quadrado, hexagonal (hex), sem grid
- [ ] Camadas de mapa (background, objetos, tokens, GM layer)
- [ ] Paredes e portas interativas (abrir/fechar em tempo real)
- [ ] Ferramenta de ping animado no mapa

**Tokens:**
- [ ] Upload de imagens de token
- [ ] Token de área (Large, Huge, Gargantuan)
- [ ] Barra de HP/MP customizável sobre o token
- [ ] Auras visuais (alcance de poder, área de magia)
- [ ] Sincronização de condições visuais (ícones sobre o token)

---

### Sprint 11 — Marketplace Completo + Homebrew (2 semanas)

**Objetivo:** Economia criativa funcional.

- [ ] Upload de assets para CDN com validação de formato
- [ ] Preview de conteúdo homebrew antes de comprar
- [ ] Sistema de pesquisa avançada com filtros
- [ ] Rating e reviews com moderação
- [ ] Creator dashboard com métricas de vendas e downloads
- [ ] Payout automático para criadores (integração Pagar.me)
- [ ] Import de conteúdo homebrew diretamente para campanha
- [ ] Sistema de licenças: Free, CC-BY, proprietário

---

### Sprint 12 — APIs Públicas + Developer Docs (1 semana)

**Objetivo:** Ecossistema aberto para desenvolvedores terceiros.

- [ ] API pública rate-limited para leitura do compêndio
- [ ] API de criação de rolls autenticada com API key
- [ ] OpenAPI spec publicado em `developer.vtt-platform.com`
- [ ] SDK TypeScript publicado no npm
- [ ] Webhook system: eventos de mesa para integrações externas
- [ ] Sandbox environment para desenvolvedores

---

### Sprint 13 — Performance, Hardening e Go-Live (2 semanas)

**Objetivo:** Produção real.

**Performance:**
- [ ] Redis Cluster para session store distribuído
- [ ] CDN (Cloudflare) para assets e frontend estático
- [ ] Database connection pooling (PgBouncer para PostgreSQL)
- [ ] MongoDB Atlas com sharding automático
- [ ] Lighthouse score ≥ 90 no frontend

**Security hardening:**
- [ ] Penetration test externo (OWASP Top 10)
- [ ] Dependency audit (npm audit, Dependabot)
- [ ] Container scanning (Trivy) no CI
- [ ] WAF rules no Cloudflare
- [ ] Rate limiting granular por endpoint
- [ ] CORS whitelist production

**Observabilidade:**
- [ ] Alertas PagerDuty para incidentes críticos
- [ ] Runbooks para cada alert rule do Prometheus
- [ ] Distributed tracing end-to-end (Jaeger)
- [ ] SLO dashboards (availability, latency, error rate)
- [ ] Chaos engineering: Chaos Monkey no staging

**Go-Live:**
- [ ] DNS + SSL production
- [ ] Blue/Green deploy validado com rollback < 5 min
- [ ] Backup automático PostgreSQL + MongoDB (diário, 30 dias)
- [ ] Incident response playbook documentado
- [ ] Status page (https://status.vtt-platform.com)
- [ ] Beta testers: 50 usuários convidados 2 semanas antes

---

## Arquitetura Fase 03 — Mudanças

### Redis Cluster (Notification broker)

```
notification-service replica A  ──┐
notification-service replica B  ──┼──► Redis Cluster ◄── any service POST /send
notification-service replica C  ──┘
```

### PostgreSQL Write/Read split

```
api-gateway → identity-service → PostgreSQL Primary (writes)
                               → PostgreSQL Read Replica (reads)
billing-service (mesma pattern)
```

### CDN Pipeline para assets

```
User upload ──► API Gateway ──► marketplace-service ──► S3/R2 (origin)
                                                    ──► Cloudflare CDN (cache)
Frontend ──────────────────────────────────────────► CDN edge
```

---

## Métricas de Sucesso Fase 03

| KPI | Target |
|-----|--------|
| Mesas ativas por dia (Go-Live) | ≥ 50 |
| Usuários registrados (30 dias pós-launch) | ≥ 500 |
| Latência sync P95 | < 100ms |
| Error rate | < 0.1% |
| NPS após beta | ≥ 8/10 |
| MTTR (Mean Time to Recovery) | < 30 min |

---

## Dependências Externas

| Dependência | Uso | Alternativa |
|-------------|-----|-------------|
| Pagar.me | Pagamentos BR | Stripe (USD) |
| AWS SES | Email transacional | SendGrid |
| Cloudflare R2 | Storage de assets | AWS S3 |
| MongoDB Atlas | DB managed | Self-hosted Mongo |
| Firebase (FCM) | Push notifications | OneSignal |
| PagerDuty | Incident alerting | OpsGenie |
