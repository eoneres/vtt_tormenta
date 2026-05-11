# ADR-008: Automation DSL — Design, Security e Execution Model

**Data:** 2025-01  
**Status:** Aceito  
**Autores:** Equipe VTT Platform  
**Contexto:** Fase 02 — Sprint 3 (Automation Engine)

---

## Contexto

A plataforma VTT precisa de um mecanismo que permita que GMs e jogadores
configurem comportamentos automáticos nas mesas sem necessidade de escrever código.

Exemplos de casos de uso:
- "Quando o bárbaro usar Fúria, aplique a condição *Em Fúria* e anuncie no chat"
- "Quando qualquer personagem cair abaixo de 25% de HP, envie um alerta"
- "Quando um feitiço de veneno acertar, aplique 1d6 de dano por turno"
- "Ao iniciar o combate, role iniciativa para todos os NPCs automaticamente"

Havia três opções arquiteturais para essa funcionalidade:

**Opção A — Scripts Lua/JS livres no cliente:**  
Permite flexibilidade total mas cria riscos de segurança severos (XSS, acesso ao DOM, execução de código malicioso), e não é authoritative (cliente controla o estado).

**Opção B — DSL proprietária compilada:**  
Alta segurança, mas exige toolchain de compilação complexa, e o formato não é facilmente editável por usuários não-técnicos.

**Opção C — JSON DSL estruturado com execution no servidor:**  
Estrutura declarativa, editável via UI drag-and-drop, executada pelo rules-engine-service no servidor (authoritative). Segura por design.

---

## Decisão

Adotamos a **Opção C** com o modelo JSON DSL tri-partite:

```
Automation = Trigger + Condition (opcional) + [Actions]
```

### Estrutura de um Automation

```json
{
  "id": "auto-uuid",
  "name": "Veneno — Dano por Turno",
  "system": "tormenta20",
  "trigger": {
    "type": "ON_TURN_START"
  },
  "condition": {
    "type": "simple",
    "field": "eventData.conditions",
    "operator": "contains",
    "value": "Envenenado"
  },
  "actions": [
    {
      "type": "ROLL_DICE",
      "target": { "type": "self" },
      "notation": "1d6",
      "storeAs": "poisonDamage"
    },
    {
      "type": "MODIFY_HP",
      "target": { "type": "self" },
      "amount": "-{{poisonDamage}}"
    },
    {
      "type": "SEND_CHAT_MESSAGE",
      "target": { "type": "self" },
      "message": "☠️ {{sourceTokenId}} sofre {{poisonDamage}} de veneno!"
    }
  ],
  "maxFiresPerRound": 1
}
```

### Template Resolution

Strings de ação suportam `{{field.path}}` que são resolvidas contra o
`AutomationEventContext` no momento de execução. O resolver usa apenas
dot-notation segura — sem `eval()`, sem `Function()` para valores arbitrários.

Expressões aritméticas (para `amount` numérico) passam por um allowlist regex
`/^[\d\s+\-*/().]+$/` antes de qualquer avaliação, impossibilitando injeção de código.

---

## Consequências

### Positivas

**Segurança:** O DSL é completamente declarativo. Não há execução de código
arbitrário. A única avaliação dinâmica são expressões aritméticas simples
com allowlist estrita.

**Authoritative:** Todas execuções ocorrem no `rules-engine-service` via HTTP
chamado pelo `realtime-gateway-service`. O cliente nunca executa automações diretamente.

**System-agnostic:** O DSL funciona para qualquer sistema de RPG. Templates
Tormenta20 são implementados como `AutomationDefinition` padrão, não como
código especial.

**Auditável:** Todo `AutomationExecutionResult` é registrado com:
- `automationId` disparado
- `conditionMet` (boolean)
- `actionsExecuted` (count)
- `actionResults` com `success`/`error` por ação
- `durationMs`

**UI-friendly:** O JSON DSL é estruturado o suficiente para ser representado
como um editor drag-and-drop na UI (Sprint 4+), sem exigir habilidades de programação.

**Template library:** Templates built-in (Tormenta20, D&D 5e) são importados
via endpoint, não hard-coded. GMs podem clonar e customizar templates.

### Negativas / Trade-offs

**Expressividade limitada:** Automações muito complexas (e.g., cálculos
condicionais encadeados baseados em estado externo) podem ser difíceis de
expressar no DSL. Para esses casos, o `SandboxController` permite execução de
scripts em `vm.Script` do Node.js com timeout de 100ms.

**Loop prevention manual:** `maxFiresPerRound` previne loops, mas requer
que o criador da automação configure corretamente. Automações sem esse limite
podem disparar múltiplas vezes por rodada.

**Estado em memória:** A implementação atual do `AutomationRepository` é
in-memory. Migração para MongoDB é planejada no Sprint 4.

---

## Arquitetura de Execução

```
realtime-gateway-service
  │
  │ (game event: ON_DAMAGE_RECEIVED)
  │
  ▼
rules-engine-service
  │
  ├── AutomationRepository.findByTrigger(type, system)
  │       ↓ List<AutomationAggregate>
  │
  ├── for each automation:
  │   ├── ConditionEvaluator.evaluate(condition, context) → bool
  │   └── AutomationExecutor.execute(automation, context)
  │       ├── ROLL_DICE   → DiceEngine.roll()
  │       ├── MODIFY_HP   → IGameStateAdapter.setTokenHp()
  │       ├── APPLY_CONDITION → IGameStateAdapter.addTokenCondition()
  │       └── SEND_CHAT_MESSAGE → IGameStateAdapter.sendChatMessage()
  │
  └── List<AutomationExecutionResult> → realtime-gateway-service
          │
          └── broadcast to room via Colyseus
```

### IGameStateAdapter

A interface `IGameStateAdapter` separa o executor de qualquer transporte
específico. Em produção, a implementação chama o `vtt-engine-service` via HTTP
e emite eventos para o `realtime-gateway-service` via Redis pub/sub.

---

## Triggers Suportados (v1)

| Trigger | Quando dispara |
|---------|---------------|
| ON_TURN_START | Início do turno de um token |
| ON_TURN_END | Fim do turno de um token |
| ON_ATTACK_ROLL | Após uma rolagem de ataque |
| ON_DAMAGE_DEALT | Após causar dano |
| ON_DAMAGE_RECEIVED | Após receber dano |
| ON_HP_CHANGE | Qualquer mudança de HP |
| ON_HP_BELOW_THRESHOLD | HP cai abaixo de X% |
| ON_CONDITION_APPLIED | Condição aplicada ao token |
| ON_CONDITION_REMOVED | Condição removida do token |
| ON_SPELL_CAST | Magia lançada |
| ON_ABILITY_USED | Habilidade/poder utilizado |
| ON_ROUND_START | Início de nova rodada |
| ON_ROUND_END | Fim da rodada |
| ON_COMBAT_START | Combate iniciado |
| ON_COMBAT_END | Combate encerrado |
| MANUAL | Disparado manualmente pelo GM |

---

## Alternativas Rejeitadas

**Lua scripting (Foundry VTT approach):** Poderoso mas requer sandbox Lua,
e não é facilmente editável por não-programadores. Rejeitado por complexidade
de segurança.

**Workflow visual (Zapier-like):** Abordagem interessante para Sprint 5+.
A base JSON DSL atual é o passo fundacional que permite construir um
editor visual sobre ela.

**Event Sourcing completo para automações:** Overhead desnecessário para v1.
Os `AutomationExecutionResult` são logs suficientes. Event sourcing completo
entra no Sprint 5 junto com auditoria avançada.
