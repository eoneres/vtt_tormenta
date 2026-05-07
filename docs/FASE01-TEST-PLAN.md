# Plano de Testes — Fase 01 VTT Multissistema

> **Objetivo**: Validar implementação da Fase 01 (MVP com Tormenta20 + D&D 5e)  
> **Data**: Maio 2026  
> **Status**: EM EXECUÇÃO

---

## 1. Escopo de Testes — Fase 01

### Serviços a Testar

| Serviço | Status | Cobertura Esperada |
|---|---|---|
| `rules-engine-service` | ✅ Desenvolvido | DSL loader, dice engine, fórmulas, sandbox |
| `vtt-engine-service` | ✅ Desenvolvido | Mapas, tokens, FoW, iniciativa |
| `realtime-gateway-service` | ✅ Desenvolvido | Colyseus rooms, state sync, commands |
| `frontend` | ✅ Desenvolvido | UI, realtime sync, fichas, chat |

### Não em Escopo (Fase 1)

- `api-gateway` (Fase 1 — Mês 1)
- `campaign-service` (Fase 1 — Mês 1)

---

## 2. Estratégia de Testes por Camada

### 2.1 Camada de Domínio — Unit Tests

#### Rules Engine Service

**Objetivo**: Validar DSL loader, dice engine, fórmulas, sandbox

**Testes Críticos**:

```
✓ Dice Engine
  ✓ d4, d6, d8, d10, d12, d20, d100
  ✓ Dice pools: 4d6, 2d20
  ✓ Modifiers: +5, -3
  ✓ Exploding dice: 6d6!
  ✓ Keep highest/lowest: 4d6kh3, 4d6kl3
  ✓ Reroll: 4d6cr<=1
  ✓ Critical success/failure seeds (deterministic)

✓ Formula Parser
  ✓ Simple arithmetic: 1d20 + 5
  ✓ Nested: (1d8 + 2) * 2
  ✓ Advantage: kh(1d20, 1d20)
  ✓ Disadvantage: kl(1d20, 1d20)
  ✓ Invalid formulas rejected

✓ Tormenta20 DSL
  ✓ Atributos (FOR, DEX, CON, INT, SAB, CAR)
  ✓ Modificadores de atributo
  ✓ Perícias (Acrobacia, Luta, etc.)
  ✓ Defesas (CD, RD, resistências)
  ✓ Recursos (PM, PV)
  ✓ Condições (envenenado, assustado)
  ✓ Perícias complexas com modificadores

✓ D&D 5e DSL
  ✓ Ability scores + modifiers
  ✓ Skills (Acrobatics, Insight, etc.)
  ✓ Saving throws (DC system)
  ✓ Advantage/disadvantage mechanics
  ✓ Spell slots
  ✓ Conditions (charmed, frightened, etc.)
  ✓ Attack roll automation

✓ Sandbox Security
  ✓ Timeout protection (100ms limit)
  ✓ Infinite loop detection
  ✓ Prototype pollution prevention
  ✓ No access to require/import
  ✓ HMAC signature verification
```

#### VTT Engine Service

**Objetivo**: Validar mapas, tokens, FoW, iniciativa

**Testes Críticos**:

```
✓ Map Management
  ✓ Grid creation (4x4, 10x10, 100x100)
  ✓ Grid types: square, hexagonal
  ✓ Layers: terrain, objects, tokens
  ✓ Layer ordering (z-index)

✓ Token Management
  ✓ Token creation with position
  ✓ Snap-to-grid logic
  ✓ Bounds checking
  ✓ HP bars (0 <= HP <= maxHP)
  ✓ Movement validation (no clipping)

✓ Fog of War
  ✓ Global FoW toggle
  ✓ Per-token FoW reveal
  ✓ FoW reset/clear
  ✓ Vision range calculation
  ✓ LOS obstruction (basic)

✓ Initiative Tracker
  ✓ Initiative roll aggregation
  ✓ Sort by initiative + DEX
  ✓ Current turn tracking
  ✓ Turn advancement
  ✓ Round counter
  ✓ Combat start/end
```

#### Realtime Gateway Service

**Objetivo**: Validar Colyseus rooms, command handlers, state sync

**Testes Críticos**:

```
✓ Room Management
  ✓ Room creation for table
  ✓ Player join with JWT validation
  ✓ GM/Player permission checks
  ✓ Max 8 players per room
  ✓ Room cleanup on last player leave

✓ Command Handlers
  ✓ MOVE_TOKEN: snap-to-grid, bounds check
  ✓ ROLL_DICE: invokes rules-engine
  ✓ UPDATE_HP: 0 <= HP <= maxHP
  ✓ APPLY_CONDITION: valid condition set
  ✓ CHAT_MESSAGE: rate limiting, sanitization
  ✓ SET_INITIATIVE: valid roll
  ✓ NEXT_TURN: turn order update
  ✓ START/END_COMBAT: state transitions
  ✓ REVEAL/RESET_FOW: GM-only guard

✓ State Synchronization
  ✓ Initial state snapshot on join
  ✓ Patch-based updates (50ms)
  ✓ Reconnection with snapshot (30s window)
  ✓ Multi-node sync via Redis

✓ Validation
  ✓ All commands validated with Zod
  ✓ Invalid payloads rejected
  ✓ Type safety enforced
```

#### Frontend

**Objetivo**: Validar UI components, stores, realtime sync

**Testes Críticos**:

```
✓ Authentication
  ✓ Login flow
  ✓ JWT storage
  ✓ Session management
  ✓ Logout clears session

✓ Campaign UI
  ✓ Campaign list render
  ✓ Campaign CRUD operations
  ✓ Create/edit campaign form
  ✓ Table list within campaign

✓ VTT Canvas
  ✓ Map renders with grid
  ✓ Tokens render correctly
  ✓ Drag-and-drop positioning
  ✓ Snap-to-grid enforcement
  ✓ Token selection highlight
  ✓ FoW rendering (cut-out)
  ✓ HP bar display

✓ Chat
  ✓ Message input
  ✓ Message rendering
  ✓ Inline roll syntax (/r 1d20+5)
  ✓ Emote syntax (/me action)
  ✓ Message history

✓ Character Sheet
  ✓ D&D 5e sheet render
  ✓ Tormenta20 sheet render
  ✓ Editable fields
  ✓ Roll buttons (skill, save, attack)

✓ Store Management (Zustand)
  ✓ Auth state persistence
  ✓ Table state updates
  ✓ Actions dispatch correctly

✓ Realtime Sync
  ✓ Join room
  ✓ Receive state patches
  ✓ Disconnect/reconnect
  ✓ UI updates on message
```

---

### 2.2 Camada de Integração — Integration Tests

#### Rules Engine ↔ Realtime Gateway

**Objetivo**: Validar invocação de dice rolls durante combate

**Testes**:

```
✓ Combat Roll Flow
  ✓ Player sends /r 1d20+5 via chat
  ✓ Realtime gateway dispatches ROLL_DICE
  ✓ Rules engine evaluates formula
  ✓ Result returned with seed + HMAC
  ✓ Chat message includes result

✓ Automation
  ✓ Trigger event from Tormenta20 power
  ✓ Rules engine auto-calculates damage
  ✓ Result applied to target HP
  ✓ Chat logged automatically
```

#### VTT Engine ↔ Realtime Gateway

**Objetivo**: Validar sincronização de estado do mapa

**Testes**:

```
✓ Token Movement
  ✓ Player moves token locally
  ✓ Command dispatched to realtime-gateway
  ✓ VTT engine validates movement
  ✓ State updated in room
  ✓ All players receive patch

✓ Initiative Update
  ✓ Initiative rolls sent to gateway
  ✓ VTT engine orders tracker
  ✓ All players see updated order

✓ Combat State Machine
  ✓ Start combat transitions state
  ✓ Turn advancement works
  ✓ End combat clears initiative
```

#### Frontend ↔ Realtime Gateway

**Objetivo**: Validar sincronização realtime no cliente

**Testes**:

```
✓ Full Sync Flow
  ✓ Player A moves token
  ✓ Player B receives and renders update <100ms
  ✓ Player A takes damage
  ✓ Player B updates HP bar immediately
  ✓ Chat messages sync to all players

✓ Disconnect/Reconnect
  ✓ Player disconnects
  ✓ Room preserves state 30s
  ✓ Player reconnects
  ✓ Full state snapshot sent
  ✓ UI reconciles state correctly
```

---

### 2.3 Testes End-to-End (E2E)

#### Cenário 1: Mesa Completa de Tormenta20

**Objetivo**: Fluxo completo de um combate real

**Steps**:

```
1. Initialize
   ✓ GM creates campaign "Aventura Épica"
   ✓ GM creates table and joins
   ✓ 2 players register and join via invite
   
2. Setup
   ✓ GM loads Tormenta20 map (Taverna)
   ✓ Players load their character sheets
   ✓ GM places 3 enemy tokens
   
3. Gameplay
   ✓ Players roll initiative
   ✓ First player rolls attack: /r 1d20+8
   ✓ Result shown to all
   ✓ If hit, roll damage: /r 1d8+3
   ✓ Enemy HP reduced
   ✓ Enemy takes turn
   ✓ Combat continues 3 rounds
   ✓ Enemy defeated
   
4. Verify
   ✓ Combat log complete
   ✓ No latency > 100ms p95
   ✓ All players saw same state
   ✓ XP awarded correctly
```

#### Cenário 2: Mesa D&D 5e com Vantagem/Desvantagem

```
1. Setup
   ✓ GM creates adventure
   ✓ Player loads D&D 5e sheet
   
2. Advantage Roll
   ✓ Player rolls with advantage: /r advantage 1d20
   ✓ Two d20s rolled and kept highest
   ✓ Result displayed with breakdown
   
3. Disadvantage Roll
   ✓ Condition applied: frightened
   ✓ Next roll automatic disadvantage
   ✓ Result displays correctly
   
4. Spell Slots
   ✓ Wizard casts Fireball
   ✓ 3rd level spell slot consumed
   ✓ Remaining slots display correct
```

---

### 2.4 Testes de Segurança

#### Authentication & Authorization

```
✓ JWT Validation
  ✓ Invalid token rejected
  ✓ Expired token rejected
  ✓ Tampered token rejected
  ✓ JWKS refresh works
  
✓ RBAC Enforcement
  ✓ Only GM can use REVEAL_FOW
  ✓ Only GM can EndCombat
  ✓ Players cannot modify other players' tokens
  ✓ Invalid roles rejected

✓ Session Security
  ✓ CSRF tokens validated
  ✓ XSS payloads in chat sanitized
  ✓ No access to other players' private data
```

#### Input Validation

```
✓ Rules Engine
  ✓ Formula injection prevented
  ✓ Timeout protection works
  ✓ Prototype pollution prevented
  ✓ No eval() execution

✓ Realtime Commands
  ✓ Zod validation enforced
  ✓ Invalid payloads rejected
  ✓ Type coercion impossible
  ✓ Out-of-bounds values caught

✓ Frontend
  ✓ Chat sanitized (no script tags)
  ✓ File upload boundaries
  ✓ Rate limiting enforced
```

#### Data Privacy (LGPD)

```
✓ Personal Data
  ✓ PII (email, name) not in logs
  ✓ Audit trail shows who accessed what
  ✓ Sensitive operations logged
  
✓ Export/Deletion
  ✓ User data export API works
  ✓ Deletion cascades correctly
  ✓ 30-day retention policy honored
```

---

### 2.5 Testes de Performance

#### Latência de Sincronização

```
✓ Command → State Update → All Clients < 100ms p95
  ✓ Measure 100 moves in same room (8 players)
  ✓ Measure 100 damage updates
  ✓ Measure 100 chat messages
  
✓ Realtime Patch Delivery
  ✓ 50ms patch rate maintained
  ✓ No buffer overflow
  ✓ Reconnection < 1s
```

#### Throughput

```
✓ Concurrent Players
  ✓ 8 players in same room
  ✓ 4 simultaneous rooms
  ✓ Total 32 concurrent connections
  ✓ No message loss
  ✓ No state divergence

✓ Dice Roll Performance
  ✓ 1000 d20 rolls/second
  ✓ Average latency < 10ms
  ✓ Sandbox timeout triggers < 1%
```

#### Footprint

```
✓ Memory
  ✓ Per-room state < 10MB
  ✓ Per-connection < 2MB
  
✓ Network
  ✓ Patch size < 1KB average
  ✓ Full state snapshot < 50KB
```

---

## 3. Criteria de Sucesso — Fase 01

### Must Have ✅

- [ ] 100% das unit tests passando (all services)
- [ ] >80% code coverage em lógica crítica
- [ ] 0 vulnerabilidades críticas/altas
- [ ] E2E scenarios completos passando
- [ ] Latência realtime < 100ms p95 (5 instâncias)
- [ ] LGPD compliance verificado
- [ ] JWT RS256 validação funcionando
- [ ] Sandbox rules-engine seguro (pen test)

### Should Have

- [ ] >90% code coverage
- [ ] Load test com 32 concurrent players
- [ ] Stress test: 500+ dice rolls/sec
- [ ] Multi-region failover working
- [ ] Chaos engineering: kill random pods

### Nice to Have

- [ ] API docs (OpenAPI) complete
- [ ] Security headers configured
- [ ] Performance dashboards in Grafana

---

## 4. Instrumentação de Testes

### Test Command

```bash
# Unit tests todos os serviços
pnpm turbo run test

# Com coverage
pnpm turbo run test:coverage

# Específico
pnpm --filter @vtt/rules-engine-service test -- --watch

# E2E
pnpm --filter @vtt/frontend test:e2e
```

### Ferramentas

| Ferramenta | Uso |
|---|---|
| Jest | Unit + Integration |
| Playwright | E2E browser |
| k6 | Load testing realtime |
| OWASP ZAP | Security scan |
| SonarQube | Code quality |

---

## 5. Cronograma de Execução

| Etapa | Tempo | Responsável | Status |
|---|---|---|---|
| Unit Tests | 4h | Dev | ⏳ HOJE |
| Integration Tests | 3h | Dev | ⏳ HOJE |
| E2E Scenarios | 4h | QA | ⏳ DEPOIS |
| Security Tests | 3h | DevSecOps | ⏳ DEPOIS |
| Performance Tests | 4h | DevOps | ⏳ DEPOIS |
| Report + Results | 2h | QA | ⏳ FINAL |

**Total**: 20 horas

---

## 6. Documentação de Resultados

Será preenchida com:

- ✅ Testes passed/failed
- 📊 Coverage report
- 🚨 Bugs encontrados
- ⚠️ Warnings/suggestions
- 🔒 Security findings
- ⚡ Performance metrics

---

**Próximas Steps**:
1. Executar unit tests (regras + engine)
2. Executar integration tests (sincronia)
3. Executar E2E (cenários reais)
4. Executar security scan (OWASP)
5. Executar load test (latência)
6. Gerar relatório final
