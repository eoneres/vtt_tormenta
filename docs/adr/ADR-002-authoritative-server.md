# ADR-002: Authoritative Server para Estado de Jogo

**Status**: Aceito  
**Data**: 2025-05  
**Contexto**: Modelagem VTT Multissistema v1.0

## Contexto

Em um VTT multiplayer, o estado do jogo (posição de tokens, HP, fog of war, rolagens) precisa ser consistente para todos os jogadores. Permitir que clientes apliquem estado localmente sem validação cria vetores de trapaça e inconsistências.

## Decisão

O servidor é a **única fonte de verdade** para todo estado de jogo. O cliente envia **intenções** (comandos), o servidor valida, aplica e faz broadcast do novo estado para todos os clientes da room.

Fluxo obrigatório:
```
Cliente → INTENT (ex: MOVE_TOKEN) → realtime-gateway
realtime-gateway → valida (rules-engine) → aplica estado
realtime-gateway → broadcast STATE_UPDATE → todos os clientes
```

Rolagens são computadas **exclusivamente no servidor** com seed auditável e assinatura digital.

## Consequências

**Positivas:**
- Impossibilidade de trapaça via manipulação de cliente
- Estado sempre consistente entre todos os jogadores
- Log auditável de todos os eventos de jogo
- Detecção de anomalias estatísticas (bots)

**Negativas:**
- Latência adicional por round-trip (mitigada por event batching 50ms e edge nodes no Brasil)
- Complexidade no cliente (optimistic UI com rollback)

## Alternativas Rejeitadas

- **Client-authoritative**: rejeitado por ser trivialmente explorável
- **Peer-to-peer**: rejeitado por impossibilidade de auditoria e inconsistências de rede
