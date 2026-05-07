# Plano de Testes Avançados — Fase 01 Extended

> **Objetivo**: Validação E2E, performance, segurança e carga completa  
> **Fase**: 01 Extended (Pré-Produção)  
> **Timeline**: 2-3 semanas

---

## 1. Testes E2E — Cenários Críticos

### 1.1 Cenário: Mesa Completa de Tormenta20

**Objetivo**: Full gameplay flow com combate real

**Setup**:
```typescript
// 1. Criar campaign
POST /campaigns
{
  name: "Aventura Épica",
  system: "tormenta20",
  gmId: userA.id
}

// 2. Criar table
POST /campaigns/{id}/tables
{
  name: "Taverna do Príncipe",
  maxPlayers: 8
}

// 3. Convidar players
POST /tables/{id}/invite
{ playerEmail: "player1@example.com" }
{ playerEmail: "player2@example.com" }

// 4. Players aceitam e entram
```

**Gameplay Steps**:

```gherkin
Scenario: O Combate da Taverna
  Given GM cria mesa com 3 inimigos
  And Players carregam suas fichas de Tormenta20
  When GM carrega mapa "Taverna de Príncipe"
  Then Mapa renderiza com 4 workers + 3 enemies tokens
  
  When Players 1 e 2 jogam iniciativa (/r 1d20+DEX)
  Then Placar de iniciativa mostra: Inimigo1 (20), Player1 (19), Player2 (18)
  
  When Player1 faz ataque (/r 1d20+8)
  And resultado = 22
  Then Chat mostra "Player1 ataca com sucesso (22)!"
  
  When Player1 rola dano (/r 1d8+3)
  And resultado = 8
  Then Enemy1 HP reduz de 30 para 22
  And HP bar atualiza em tempo real para todos
  
  When GM termina combate (comando /end-combat)
  Then XP awarded e combat ended no chat
```

**Ferramentas**: Playwright + Colyseus mock

---

### 1.2 Cenário: D&D 5e com Advantage/Disadvantage

```gherkin
Scenario: Mecânica de Vantagem/Desvantagem
  Given Player carrega ficha D&D 5e
  
  When Player tira com vantagem (frightened)
  And executa /r advantage 1d20 +3
  Then Chat mostra dois d20s, keeper higher
  And resultado final mostra: "rolled: [d20=18, d20=12] = 18+3 = 21 ✓"
  
  When outro inimigo aplica disadvantage
  And Player tira /r disadvantage 1d20+3
  Then Chat mostra dois d20s, keeper lower
  And resultado mostra taken lower
```

---

## 2. Testes de Performance — Latência Realtime

### 2.1 Setup Local

```bash
# Terminal 1: Iniciar stack
docker compose up -d postgres mongodb redis rabbitmq

# Terminal 2: Iniciar services
pnpm --filter @vtt/realtime-gateway-service dev
pnpm --filter @vtt/rules-engine-service dev
pnpm --filter @vtt/vtt-engine-service dev
pnpm --filter @vtt/frontend dev

# Terminal 3: K6 load test
k6 run tests/realtime-latency.js
```

### 2.2 Teste: Command → Broadcast Latency

**Objetivo**: Medir tempo de: Player action → Server process → All clients receive

```typescript
// tests/realtime-latency.js
import ws from 'k6/ws';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '10s', target: 1 },   // Ramp-up: 1 player
    { duration: '30s', target: 8 },   // Ramp-up: 8 players (1 room)
    { duration: '60s', target: 8 },   // Stay
    { duration: '10s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    'ws_session_duration': ['p(95)<100ms'],  // ← 100ms p95 requirement
    'ws_message_received': ['count > 0'],
  },
};

export default function() {
  const url = 'ws://localhost:8080/realtime/table:123';
  const res = ws.connect(url, function (socket) {
    socket.on('open', function () {
      // Send MOVE_TOKEN command
      const startTime = new Date();
      socket.send(JSON.stringify({
        action: 'move_token',
        tokenId: 'token-1',
        x: 5,
        y: 5,
      }));
    });

    socket.on('message', function (data) {
      // Record end time when patch received
      const latency = new Date() - startTime;
      check(latency, {
        'latency < 100ms': (l) => l < 100,
        'latency < 200ms': (l) => l < 200,
      });
    });

    socket.on('close', function () {
      sleep(1);
    });
  });
}
```

### 2.3 Teste: Sandbox Dice Engine Performance

```bash
# Medir 1000 rolls simultâneos
pnpm --filter @vtt/rules-engine-service run test:perf

# Esperado:
# - Total time: < 500ms
# - Avg per roll: < 0.5ms
# - Timeouts: 0%
```

---

## 3. Testes de Carga — Concurrent Players

### 3.1 Cenário: 32 Players (4 simultaneous rooms)

```bash
# tests/load-concurrent.js
k6 run --vus 32 --duration 5m tests/load-concurrent.js
```

**Objetivo**:
- 8 players × 4 rooms = 32 concurrent connections
- Medir throughput, latency, error rate
- Verificar state consistency across rooms

**Métricas Esperadas**:
```
- Connection success: 100%
- Message delivery: 99.9%+
- State divergence: 0
- Error rate: < 0.1%
- P95 latency: < 100ms
- Memory per room: < 10MB
```

---

## 4. Testes de Segurança — OWASP Top 10

### 4.1 Security Scanning with OWASP ZAP

```bash
# Passive + Active scan
docker run -t owasp/zap:latest zap-full-scan.py \
  -t http://localhost:3010 \
  -r scan-report.html

# Expected: 0 CRITICAL, 0 HIGH vulnerabilities
```

### 4.2 Manual Security Testing

#### 4.2.1 Input Validation

```typescript
// Test: XSS in chat message
POST /chat
{
  "message": "<script>alert('xss')</script>"
}
// Expected: Sanitized to: &lt;script&gt;alert('xss')&lt;/script&gt;

// Test: Formula injection in dice roll
POST /roll
{
  "formula": "1d20 + process.exit()"
}
// Expected: Rejected, formula not executed
```

#### 4.2.2 Authentication/Authorization

```typescript
// Test: Invalid JWT
GET /api/tables/123 \
  -H "Authorization: Bearer invalid.token"
// Expected: 401 Unauthorized

// Test: User A accesses User B's campaign
GET /campaigns/{userB_campaign_id}
// Headers: Authorization: Bearer {userA_token}
// Expected: 403 Forbidden

// Test: Player tries GM-only command
socket.send({
  action: 'reveal_fog',  // GM-only
  tableId: 'table-123'
})
// Expected: Rejected, "insufficient permissions"
```

#### 4.2.3 Rate Limiting

```typescript
// Test: 5x failed login attempts
for (let i = 0; i < 6; i++) {
  POST /auth/login { email, password: "wrong" }
}
// Expected: 
// - Requests 1-5: 401 Unauthorized
// - Request 6: 429 Too Many Requests
// - CAPTCHA required on next attempt
```

---

## 5. Testes de LGPD/Compliance

### 5.1 Data Export

```bash
# User requests their data export
GET /api/users/{id}/export
# Expected: ZIP file containing:
# - User profile
# - Campaign history
# - Character sheets
# - Roll logs
# - All personal data in portable format
```

### 5.2 Account Deletion

```bash
# User requests account deletion
DELETE /api/users/{id}
{ "reason": "No longer using service" }

# Expected:
# - User record anonymized
# - Campaign data preserved (if shared ownership)
# - Personal data deleted
# - Deletion logged in audit trail
```

### 5.3 Audit Trail

```bash
# Verify audit logs
GET /api/admin/audit-log?userId={id}&action=login

# Expected: Complete log entry with:
# - Timestamp
# - User ID
# - Action (login, logout, data_export, etc)
# - IP address
# - User agent
# - Success/failure status
```

---

## 6. Testes de Infraestrutura

### 6.1 Database Failover

```bash
# 1. Confirm primary RDS healthy
aws rds describe-db-instances --db-instance-identifier vtt-prod-db

# 2. Initiate failover
aws rds failover-db-cluster --db-cluster-identifier vtt-prod-cluster

# 3. Verify:
# - Read-only replica becomes primary
# - Application reconnects automatically
# - No data loss
# - Downtime < 30s
```

### 6.2 Pod Crash Recovery

```bash
# 1. Kill random pod
kubectl delete pod -n vtt-prod $(kubectl get pods -n vtt-prod -o jsonpath='{.items[0].metadata.name}')

# 2. Verify:
# - StatefulSet creates replacement pod
# - Active connections migrate
# - Games continue with < 5s interruption
# - No state loss
```

### 6.3 Multi-Region Failover

```bash
# 1. Route traffic to primary region
echo "Region: us-east-1"

# 2. Inject region failure
# (via chaos engineering, e.g. with Gremlin)

# 3. Verify DNS failover to secondary region
nslookup api.vtt.example.com
# Expected: Points to us-west-2 secondary

# 4. Games continue with:
# - 1-2s visible latency bump
# - No player disconnection
# - State remains consistent
```

---

## 7. Testes de Escalabilidade

### 7.1 Horizontal Scaling Test

```bash
# Start with 2 replicas
kubectl scale deployment realtime-gateway-service \
  --replicas=2 -n vtt-prod

# Load test with k6 (gradually increase)
k6 run --stage "1m:50vus" --stage "2m:100vus" \
  --stage "2m:200vus" tests/scale-test.js

# Monitor:
# - CPU/Memory per pod (should stay < 80%)
# - Network I/O
# - Redis pub/sub latency
# - Kafka consumer lag (if applicable)

# Scale to 5 replicas mid-test
kubectl scale deployment realtime-gateway-service \
  --replicas=5 -n vtt-prod

# Verify:
# - New pods join Redis pub/sub
# - Existing connections stable
# - No duplicate messages
# - Load rebalanced
```

---

## 8. Testes de Compatibilidade

### 8.1 Browser Compatibility

```typescript
// Test matrix: Playwright Chromium, Firefox, WebKit
const browser = ['chromium', 'firefox', 'webkit'];

for (const b of browser) {
  test(`Mesa virtual em ${b}`, async () => {
    // Full E2E scenario in each browser
    const browser = await playwright[b].launch();
    await mesa.runFullGameplay(browser);
  });
}
```

### 8.2 Network Conditions

```typescript
// Simulate 4G, LTE, satellite connections
const networkProfiles = [
  { download: 4, upload: 2, latency: 50 },   // 4G
  { download: 10, upload: 5, latency: 100 }, // LTE
  { download: 0.5, upload: 0.2, latency: 500 }, // Satellite
];

for (const profile of networkProfiles) {
  test(`Gameplay com latência de ${profile.latency}ms`, async () => {
    await page.route('**/*', route => {
      // Simulate network profile
      return route.continue({
        delay: profile.latency / 2,
      });
    });
    
    // Run full scenario
    await mesa.runFullGameplay(page);
  });
}
```

---

## 9. Checklist de Aprovação — Go-Live Fase 01

### 🟢 Testes Unitários

- [x] 100/100 testes passando
- [x] 4 issues críticos resolvidos
- [x] SystemLoader, LOS, schemas funcionando
- [x] Sandbox segurança validada

### 🟡 Testes E2E (Planejado)

- [ ] Cenário Tormenta20 completo
- [ ] Cenário D&D 5e com advantage/disadvantage
- [ ] Ficha de personagem interativa
- [ ] Chat com inline rolls
- [ ] Iniciativa tracker
- [ ] 3+ rodadas de combate

### 🟡 Performance (Planejado)

- [ ] Latência < 100ms p95 (8 players)
- [ ] Dice rolls: 1000/sec
- [ ] State sync: 50ms ticks
- [ ] Reconnection: < 1s
- [ ] Memory footprint: < 100MB per room

### 🟡 Segurança (Planejado)

- [ ] OWASP ZAP: 0 críticos/altos
- [ ] XSS prevention validado
- [ ] CSRF tokens funcionando
- [ ] Rate limiting ativado
- [ ] JWT RS256 validação
- [ ] Sandbox timeout protection

### 🟡 LGPD/Compliance (Planejado)

- [ ] Data export funcionando
- [ ] Account deletion cascading
- [ ] Audit trail completo
- [ ] 30-day retention policy
- [ ] Assessoria jurídica review

### 🟡 Infraestrutura (Planejado)

- [ ] DB failover < 30s
- [ ] Pod crash recovery < 5s
- [ ] Multi-region failover < 60s
- [ ] Horizontal scaling: +3 replicas
- [ ] 99.5% uptime em 30 dias

---

## 10. Timeline de Execução

| Semana | TaskName | Status | DueDate |
|---|---|---|---|
| Semana 1 | E2E Scenarios (Playwrightñ | ⏳ Planejado | 2026-05-14 |
| Semana 1 | Performance Test (K6) | ⏳ Planejado | 2026-05-14 |
| Semana 2 | Security Scan (OWASP ZAP) | ⏳ Planejado | 2026-05-21 |
| Semana 2 | LGPD Audit | ⏳ Planejado | 2026-05-21 |
| Semana 3 | Load Test (32 concurrent) | ⏳ Planejado | 2026-05-28 |
| Semana 3 | Infrastructure Failover | ⏳ Planejado | 2026-05-28 |

---

## 11. Recursos Necessários

### Ferramentas

- [x] Jest (unit testing)
- [ ] Playwright (E2E browser)
- [ ] K6 (load/performance)
- [ ] OWASP ZAP (security scan)
- [ ] Colyseus debug tools
- [ ] Redis CLI for monitoring
- [ ] Kubectl for K8s testing

### Infraestrutura de Teste

- Staging cluster (K8s) com: PostgreSQL, MongoDB, Redis, RabbitMQ, Prometheus, Grafana
- Load generation cluster (K6 cloud ou self-hosted)
- Security testing infra (OWASP ZAP, Burp Suite)

### Pessoas

- 1 QA Engineer (E2E + manual testing)
- 1 Performance Engineer (K6 + monitoring)
- 1 Security Engineer (penetration testing)
- 1 DevOps (infrastructure testing)

---

## 12. Documentação de Resultados

Todos os testes devem gerar:

- ✅ Test report (passed/failed)
- ✅ Screenshots/videos (failures)
- ✅ Performance metrics (Grafana)
- ✅ Security findings (OWASP report)
- ✅ Recommendations (action items)

Formato: Markdown + JSON para CI/CD integration

---

## Próximos Passos Imediatos

1. **Hoje**: Review este plano com time
2. **Amanhã**: Começar E2E com Playwright
3. **Próxima Semana**: Performance testing com K6
4. **Semana 2**: Security audit (OWASP)
5. **Semana 3**: Load testing + infrastructure validation
6. **Depois**: Aprovação final para Fase 02

---

**Status**: 🟡 READY FOR EXTENDED TESTING  
**Aprovação**: Aguardando review de Tech Lead + DevSecOps  
**Data**: 2026-05-07
