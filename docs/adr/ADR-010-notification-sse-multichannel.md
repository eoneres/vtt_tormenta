# ADR-010: Notification System — SSE, Multi-Channel e Preferências

**Data:** 2025-01  
**Status:** Aceito  
**Contexto:** Fase 02 — Sprint final (Notification + Billing + Marketplace)

---

## Contexto

A plataforma precisa de um sistema de notificações que:
- Entregue alertas em tempo real sem exigir WebSocket permanente
- Suporte múltiplos canais (in-app, email, push)
- Respeite preferências do usuário e quiet hours (LGPD-aligned)
- Seja acessível a todos os serviços via HTTP simples

As opções avaliadas foram:
- **A) WebSocket bidirecional** — requer conexão permanente, complexidade de reconexão
- **B) Polling** — desperdiça recursos, latência média alta
- **C) SSE (Server-Sent Events)** — unidirecional, HTTP simples, reconexão automática, sem overhead de protocolo

---

## Decisão

**SSE para in-app**, complementado por email (SMTP via SES/SendGrid) e push (FCM/APNs) quando habilitados.

```
Service (campaign-service, rules-engine, etc.)
  │
  │ POST /v1/notifications/send  (HTTP)
  ▼
notification-service
  ├── Filtra por preferências do usuário
  ├── in_app → SSE writer (se usuário conectado)
  ├── email  → SMTP adapter
  └── push   → FCM/APNs adapter

Frontend (EventSource)
  └── GET /v1/notifications/stream  (SSE)
      ├── Reconnects automaticamente (30s keep-alive)
      └── Recebe JSON de Notification.toPlainObject()
```

### Por que não WebSocket para notificações?

O `realtime-gateway-service` já usa WebSocket via Colyseus para o estado do jogo.
Notificações são eventos independentes do estado da mesa — misturá-los no mesmo
canal WebSocket aumentaria acoplamento. SSE mantém separação de responsabilidades:
- Colyseus: estado autoritativo da mesa, latência crítica (<100ms)
- SSE: alertas assíncronos, latência aceitável (1-5s)

---

## Consequências

### Positivas

**Simplicidade:** SSE é HTTP/1.1 nativo. Clientes reconectam automaticamente.
Sem necessidade de handshake WebSocket ou gerenciamento de estado de protocolo.

**Escalabilidade:** SSE connections são stateless do ponto de vista do load balancer
(sticky sessions configuradas via cookie). Múltiplas instâncias do notification-service
são suportadas com Redis pub/sub como broker entre instâncias.

**LGPD-compliant:** Preferências de canal são armazenadas por tipo de notificação.
Quiet hours respeitam UTC configurável. Canal `in_app` nunca é desabilitado
(é o fallback garantido).

**Segurança:** A stream SSE requer JWT válido no header. Sem JWT = 401 e
conexão fechada. As notificações são filtradas por `userId` — impossível receber
notificações de outro usuário.

### Negativas / Trade-offs

**Stateful por instância:** O mapa `sseSessions` é in-memory por instância.
Com múltiplas réplicas, um usuário conectado à réplica A não recebe notificações
enviadas via réplica B. **Solução Sprint 3:** Redis pub/sub como broker.

**iOS/Safari em background:** Apps em background no iOS suspendem SSE.
Para esses casos, push notifications (FCM via APNs) são necessárias.
Implementação completa no Sprint 3.

---

## Implementação Sprint 3 (planejado)

1. **Redis pub/sub broker** — cada instância subscreve canal `notifications:{userId}`
   no Redis. Quando qualquer instância recebe `POST /send`, publica no Redis.
   Todas as instâncias entregam ao SSE writer local se o usuário estiver conectado.

2. **Persistent store** — PostgreSQL para histórico de notificações
   (atual: in-memory, máx 100 por usuário).

3. **Email templates** — Handlebars templates por `NotificationType`,
   renderizados pelo notification-service antes de enviar ao SES.

4. **Push notifications** — Integração FCM via `firebase-admin` SDK.
   Tokens de dispositivo armazenados por usuário.
