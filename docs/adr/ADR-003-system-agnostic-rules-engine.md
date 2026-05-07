# ADR-003: System Agnostic Rules Engine via DSL Declarativa

**Status**: Aceito  
**Data**: 2025-05  
**Contexto**: Modelagem VTT Multissistema v1.0

## Contexto

A plataforma precisa suportar múltiplos sistemas de RPG (Tormenta20, D&D 5e, Shadowrun) sem que cada sistema exija alterações no código da plataforma. Hardcodar regras de RPG no core cria acoplamento insustentável.

## Decisão

Toda regra de sistema de RPG é definida via **DSL declarativa em JSON/YAML**, carregada em runtime pelo `rules-engine-service`. O core da plataforma não conhece nenhum sistema específico.

Estrutura da DSL (conforme documento):
```json
{
  "system": "tormenta20",
  "version": "1.0",
  "attributes": ["forca", "destreza", ...],
  "skills": [{ "id": "atletismo", "attribute": "forca", "trained_bonus": 5 }],
  "roll": { "attack": "1d20 + attribute_mod + proficiency + misc" },
  "events": ["ON_ATTACK", "ON_DAMAGE", "ON_HEAL", ...],
  "conditions": ["abalado", "agarrado", ...]
}
```

Scripts de automação rodam em **sandbox isolada** (VM/WebAssembly) com:
- Timeout de 100ms por execução
- Sem acesso a filesystem, rede ou env vars
- Whitelist de funções permitidas

## Consequências

**Positivas:**
- Novos sistemas adicionados sem deploy de código
- Homebrew e sistemas customizados suportados nativamente
- Testabilidade isolada de cada sistema
- Comunidade pode contribuir com sistemas via JSON

**Negativas:**
- DSL precisa ser expressiva o suficiente para sistemas complexos (Shadowrun)
- Escape hatch necessário para regras impossíveis de modelar em DSL pura (scripts declarativos supervisionados)

## Alternativas Rejeitadas

- **Código por sistema**: rejeitado por criar acoplamento e impossibilitar expansão sem deploy
- **Scripting livre (Lua/JS)**: rejeitado por risco de segurança sem sandbox adequada
