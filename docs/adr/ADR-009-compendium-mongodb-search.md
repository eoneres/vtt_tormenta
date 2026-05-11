# ADR-009: Compendium Service — Arquitetura, Busca e Seeding

**Data:** 2025-01  
**Status:** Aceito  
**Autores:** Equipe VTT Platform  
**Contexto:** Fase 02 — Sprint 1 (Compendium Service)

---

## Contexto

O compêndio é o repositório central de conteúdo de jogo — raças, classes,
feitiços, monstros, itens, condições — tanto oficial quanto homebrew.

Requisitos:
- Busca full-text performática (nome, descrição, tags, atributos)
- Suporte a múltiplos sistemas de RPG (Tormenta20, D&D 5e, Shadowrun)
- Separação clara entre conteúdo oficial e homebrew
- Cache de resultados para evitar sobrecarga do MongoDB
- Seed de dados oficiais sem intervenção manual
- API REST pública para conteúdo oficial (não requer autenticação)

---

## Decisão

### Persistência: MongoDB

MongoDB foi escolhido (em vez de PostgreSQL) porque:

1. **Esquema flexível:** Cada sistema RPG tem atributos completamente diferentes
   (um feitiço D&D tem `spellLevel`, um poder Tormenta20 tem `pmCost`).
   O campo `attributes: [{key, value, label}]` permite esse polimorfismo sem
   migrações constantes.

2. **Full-text search nativo:** MongoDB suporta índices de texto com operador
   `$text` nativamente, suficiente para v1 sem necessidade de Elasticsearch.

3. **Documentos auto-contidos:** Uma entrada do compêndio é um documento
   completo (com seus atributos e relações) — sem necessidade de JOINs.

### Busca Full-Text

O campo `searchVector` é pré-computado na entidade como:
```
nome + shortDescription + tags.join(' ') + attributes.map(label+value).join(' ')
```

Isso permite que uma busca por "tiro de arco" encontre entradas com
`tags: ["arco"]` ou `attributes[{key:"attack", value:"arco"}]`, mesmo sem
mencionar literalmente "tiro de arco" no nome.

### Cache: Redis com invalidação por sistema

```
CACHE KEY PATTERN:
  entry:{id}          → TTL 5min
  sys:{system}:*      → invalidado quando qualquer entrada do sistema muda
  stats:{system}      → TTL 10min
```

O cache é best-effort: falhas de Redis não impedem respostas (só ficam mais lentas).

### Seeding Oficial

O `CompendiumSeederService` implementa `OnApplicationBootstrap` e verifica
`SEED_ON_BOOT=true`. Em produção, o seed roda uma única vez em staging
antes do deploy de produção; em produção propriamente, `SEED_ON_BOOT=false`.

Dados do seed são TypeScript puro (`tormenta20.seed-data.ts`), versionados
no repositório. Adições ao compêndio oficial são feitas via PR ao seed data.

### Homebrew

Conteúdo homebrew tem `isOfficial: false`, `isHomebrew: true`, e `createdBy`
do usuário criador. Permissões:
- Criador pode editar/deletar seu próprio homebrew
- Admin pode editar/deletar qualquer entrada
- Oficial nunca pode ser deletado por não-admin

### Versionamento de entradas

O campo `version` (integer) é incrementado a cada `update()`. Isso permite:
- Detectar conflitos em edições concorrentes (futura implementação de OCC)
- Auditar histórico de mudanças (Sprint 5+)
- Cache invalidation baseada em versão

---

## Consequências

### Positivas

- API pública performática para conteúdo oficial sem autenticação
- Homebrew per-user isolado por `createdBy`
- MongoDB full-text search suficiente para v1 sem Elasticsearch
- Seeding reproduzível e versionado em código
- Cache Redis reduz load do MongoDB ~80% para queries repetidas

### Negativas / Trade-offs

**Full-text search limitado:** O `$text` do MongoDB não suporta fuzzy matching
(typos). Para Sprint 4+, migrar para Atlas Search ou Elasticsearch para
busca mais inteligente (sugestões, tolerância a erros).

**Sem versionamento histórico:** Apenas o `version` counter existe.
Histórico completo de edições requer event sourcing ou collection separada.
Planejado para Sprint 5.

**Sem relações bidirecionais automáticas:** As `relations` são unidirecionais
e armazenadas como referências simples (`targetId`, `targetName`). Não há
manutenção automática de integridade referencial — se uma entrada é deletada,
suas referências ficam dangling. Sprint 4 adicionará validação de relações.

---

## Estrutura dos Índices MongoDB

```javascript
// Unicidade por slug + sistema
{ slug: 1, system: 1 }  UNIQUE

// Domain ID (rápido para getById)
{ id: 1 }  UNIQUE

// Listagem com filtros comuns
{ system: 1, type: 1, isPublic: 1 }
{ system: 1, tags: 1 }
{ createdBy: 1, isHomebrew: 1 }

// Full-text search
{ searchVector: "text", name: "text", tags: "text" }

// Sort
{ name: 1 }
{ updatedAt: -1 }
```

---

## Métricas de Performance Esperadas

| Operação | P50 | P95 | P99 |
|----------|-----|-----|-----|
| GET /entries/:id (cache hit) | 2ms | 5ms | 10ms |
| GET /entries/:id (cache miss) | 8ms | 20ms | 50ms |
| GET /entries?q=... (full-text) | 15ms | 40ms | 100ms |
| POST /entries (create) | 20ms | 50ms | 100ms |
| POST /entries/bulk-import (500 entries) | 2s | 5s | 10s |
