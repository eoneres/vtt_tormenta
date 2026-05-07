# ADR-001: Arquitetura de Microserviços com Event-Driven Architecture

**Status**: Aceito  
**Data**: 2025-05  
**Contexto**: Modelagem VTT Multissistema v1.0

## Contexto

A plataforma precisa suportar múltiplos domínios de negócio independentes (identidade, campanhas, regras, VTT, marketplace, billing), com times potencialmente separados, escalabilidade independente por domínio e evolução sem acoplamento.

## Decisão

Adotar arquitetura de **microserviços** com **Event-Driven Architecture** via RabbitMQ para comunicação assíncrona entre bounded contexts, e REST/gRPC para comunicação síncrona quando necessário.

Cada microserviço:
- Representa exatamente um Bounded Context (DDD)
- Possui seu próprio banco de dados (Database per Service)
- Comunica-se com outros serviços apenas via API Gateway (externo) ou eventos (interno)
- É deployável e escalável independentemente

## Consequências

**Positivas:**
- Escalabilidade independente por domínio (ex: Rules Engine pode escalar sem afetar Billing)
- Times autônomos por serviço
- Falha isolada: um serviço down não derruba a plataforma
- Tecnologia adequada por domínio (Go para RT crítico se necessário)

**Negativas:**
- Complexidade operacional maior (mitigada por Kubernetes + Helm)
- Eventual consistency entre serviços (aceitável para o domínio)
- Necessidade de distributed tracing (mitigada por OpenTelemetry)

## Alternativas Rejeitadas

- **Monólito modular**: rejeitado por limitar escalabilidade independente e criar risco de acoplamento progressivo
- **Serverless puro**: rejeitado por incompatibilidade com WebSocket stateful (Colyseus)
