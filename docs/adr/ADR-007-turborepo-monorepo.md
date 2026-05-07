# ADR-007: Turborepo como Gerenciador de Monorepo

**Status**: Aceito  
**Data**: 2025-05  
**Contexto**: Modelagem VTT Multissistema v1.0

## Contexto

Com 10+ serviços e 6+ pacotes compartilhados, o monorepo precisa de: builds incrementais, cache de CI, execução paralela de tasks e gerenciamento de dependências entre pacotes.

## Decisão

Usar **Turborepo** com **pnpm workspaces**.

Configuração de pipeline:
```json
{
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test": { "dependsOn": ["^build"] },
    "lint": {},
    "typecheck": { "dependsOn": ["^build"] },
    "dev": { "cache": false, "persistent": true }
  }
}
```

Benefícios chave:
- **Remote caching**: CI roda apenas o que mudou (Vercel Remote Cache ou self-hosted)
- **Parallel execution**: tasks independentes rodam em paralelo
- **Dependency graph**: `build` de um serviço aguarda `build` dos seus pacotes dependentes

## Consequências

**Positivas:**
- CI significativamente mais rápido com remote cache
- DX superior: `turbo dev` sobe apenas os serviços necessários
- Gerenciamento automático de ordem de build

**Negativas:**
- Dependência do Turborepo (mitigada por ser open source e amplamente adotado)
- Remote cache requer configuração adicional em CI

## Alternativas Rejeitadas

- **Nx**: rejeitado por maior complexidade de configuração e overhead para o tamanho atual do projeto
- **Lerna**: rejeitado por ser legado e ter DX inferior ao Turborepo
- **Scripts manuais**: rejeitado por não escalar com o crescimento do monorepo
