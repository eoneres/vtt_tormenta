# ADR-006: Colyseus como Framework Realtime

**Status**: Aceito  
**Data**: 2025-05  
**Contexto**: Modelagem VTT Multissistema v1.0

## Contexto

O VTT precisa de comunicação realtime com: rooms isoladas por mesa, estado sincronizado entre múltiplos clientes, game loop, autoridade de servidor e escalabilidade horizontal.

## Decisão

Usar **Colyseus** como framework para o `realtime-gateway-service`.

Justificativas:
- **Rooms nativas**: isolamento perfeito por mesa de jogo
- **Schema state**: estado tipado e sincronizado automaticamente via delta encoding
- **Authoritative server**: modelo nativo de servidor autoritativo
- **Horizontal scaling**: suporte nativo a Redis Pub/Sub como backplane
- **TypeScript nativo**: alinhado com a stack do projeto

Configuração de rooms:
```
GameRoom (Colyseus Room)
  - maxClients: 9 (1 GM + 8 jogadores)
  - state: MapState, TokenState[], FogState, InitiativeState
  - onJoin: valida JWT + membership na mesa
  - onMessage: despacha para command handlers
  - onLeave: atualiza presença, persiste estado
```

## Consequências

**Positivas:**
- Abstração de WebSocket com game loop integrado
- Delta encoding reduz bandwidth (apenas mudanças são enviadas)
- Reconexão automática com reenvio de estado

**Negativas:**
- Vendor lock-in no framework (mitigado por abstração em camada de serviço)
- Curva de aprendizado para o time

## Alternativas Rejeitadas

- **Socket.IO puro**: rejeitado por falta de abstrações de game loop e state management
- **Custom WebSocket**: rejeitado por custo de desenvolvimento e manutenção
- **LiveKit**: rejeitado por foco em mídia (áudio/vídeo), não em game state
