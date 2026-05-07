# ADR-004: Polyglot Persistence

**Status**: Aceito  
**Data**: 2025-05  
**Contexto**: Modelagem VTT Multissistema v1.0

## Contexto

A plataforma possui dados com naturezas radicalmente diferentes: dados transacionais com integridade referencial (usuários, campanhas, billing), dados com schema variável (fichas, regras, homebrew) e dados de alta velocidade com TTL (sessões, estado de mesa, presença).

## Decisão

Adotar **polyglot persistence**: cada tipo de dado é armazenado no banco mais adequado.

| Banco | Uso | Justificativa |
|---|---|---|
| PostgreSQL 16 | Usuários, campanhas, billing, audit_logs | ACID, integridade referencial, JSONB para dados semi-estruturados |
| MongoDB Atlas | Compêndio, fichas, homebrew, sheet_templates | Schema livre por sistema de RPG, queries flexíveis |
| Redis 7 Cluster | Sessões, estado de mesa, presença, rate limiting, Pub/Sub | Sub-millisecond, TTL nativo, Pub/Sub para RT |

Cada microserviço acessa **apenas seu próprio banco** — sem acesso cross-service a bancos de outros serviços.

## Consequências

**Positivas:**
- Banco otimizado para cada padrão de acesso
- Schema livre no MongoDB permite adicionar sistemas sem migrations
- Redis elimina round-trips ao banco para dados quentes

**Negativas:**
- Joins cross-service impossíveis (resolvido via API calls ou eventos)
- Operações distribuídas sem ACID global (Saga pattern quando necessário)
- Maior complexidade operacional (mitigada por managed services: RDS, Atlas, ElastiCache)

## Alternativas Rejeitadas

- **PostgreSQL único**: rejeitado por schema rígido incompatível com DSL variável de sistemas RPG
- **MongoDB único**: rejeitado por falta de ACID para dados financeiros e de identidade
