/**
 * k6 Load Test — VTT Platform
 *
 * Simulates 50 simultaneous game tables:
 *   - Each "table" has 5 virtual users (1 GM + 4 players)
 *   - Tests: auth, dice rolls, token movement, compendium search, chat
 *   - SLA targets: p95 < 2s HTTP, WebSocket < 100ms
 *
 * Run:
 *   k6 run test/load/vtt-load-test.js \
 *     -e BASE_URL=https://staging.vtt-platform.com \
 *     -e WS_URL=wss://staging.vtt-platform.com
 *
 * Stages:
 *   0-2min:  ramp to 50 users  (warm-up)
 *   2-8min:  hold 250 users    (steady state — 50 tables × 5 users)
 *   8-12min: ramp to 500 users (stress test — 100 tables)
 *   12-13min: ramp down
 */

import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ─── Custom metrics ───────────────────────────────────────────────────────────

const wsMessageLatency = new Trend('ws_message_latency_ms', true);
const diceRollRate     = new Rate('dice_roll_success_rate');
const tokenMoveRate    = new Rate('token_move_success_rate');
const wsErrors         = new Counter('ws_errors');
const authErrors       = new Counter('auth_errors');

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const WS_URL   = __ENV.WS_URL  || 'ws://localhost:3005';

export const options = {
  stages: [
    { duration: '2m',  target: 50  },   // ramp to 50 users
    { duration: '6m',  target: 250 },   // steady state (50 tables)
    { duration: '4m',  target: 500 },   // stress (100 tables)
    { duration: '1m',  target: 0   },   // ramp down
  ],
  thresholds: {
    // HTTP SLA
    'http_req_duration{type:auth}':           ['p(95)<2000'],
    'http_req_duration{type:dice}':           ['p(95)<500'],
    'http_req_duration{type:compendium}':     ['p(95)<1000'],
    'http_req_duration{type:token_move}':     ['p(95)<300'],
    // WebSocket SLA
    'ws_message_latency_ms':                  ['p(95)<100'],
    // Error rates
    'dice_roll_success_rate':                 ['rate>0.99'],
    'token_move_success_rate':                ['rate>0.99'],
    'http_req_failed':                        ['rate<0.01'],
  },
};

// ─── Auth helper ──────────────────────────────────────────────────────────────

function authenticate(vuId) {
  const email    = `loadtest-vtu${vuId}@vtt-test.internal`;
  const password = 'LoadTest123!';

  const res = http.post(
    `${BASE_URL}/v1/auth/login`,
    JSON.stringify({ email, password }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { type: 'auth' },
    },
  );

  const ok = check(res, {
    'login 200':    (r) => r.status === 200,
    'has token':    (r) => !!r.json('accessToken'),
  });

  if (!ok) {
    authErrors.add(1);
    return null;
  }

  return res.json('accessToken');
}

// ─── Scenario helpers ─────────────────────────────────────────────────────────

function rollDice(token) {
  const expressions = ['1d20+5', '4d6kh3', '2d8+3', '1d100', '3d6'];
  const expr = expressions[Math.floor(Math.random() * expressions.length)];

  const res = http.post(
    `${BASE_URL}/v1/rules/roll`,
    JSON.stringify({ expression: expr }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      tags: { type: 'dice' },
    },
  );

  const ok = check(res, {
    'dice roll 200':    (r) => r.status === 200,
    'has total':        (r) => r.json('total') !== undefined,
  });

  diceRollRate.add(ok);
  return ok;
}

function searchCompendium(token) {
  const queries = ['guerreiro', 'bola de fogo', 'goblin', 'espada', 'clérigo'];
  const q = queries[Math.floor(Math.random() * queries.length)];

  const res = http.get(
    `${BASE_URL}/v1/compendium?system=tormenta20&query=${encodeURIComponent(q)}&limit=10`,
    {
      headers: { 'Authorization': `Bearer ${token}` },
      tags: { type: 'compendium' },
    },
  );

  return check(res, {
    'compendium 200': (r) => r.status === 200,
    'has items':      (r) => Array.isArray(r.json('items')),
  });
}

function simulateGameSession(token, tableId) {
  const wsUrl = `${WS_URL}?token=${token}&tableId=${tableId}`;
  let sessErrors = 0;

  ws.connect(wsUrl, { tags: { type: 'game_ws' } }, (socket) => {
    socket.on('open', () => {
      // Send ping immediately
      const pingStart = Date.now();
      socket.send(JSON.stringify({ type: 'PING' }));

      // Roll dice via WebSocket
      socket.send(JSON.stringify({
        type: 'ROLL_DICE',
        expression: '1d20',
        label: 'Ataque',
      }));

      // Move a token
      const tokenMoveStart = Date.now();
      socket.send(JSON.stringify({
        type: 'MOVE_TOKEN',
        tokenId: `token-${Math.floor(Math.random() * 5) + 1}`,
        position: { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) },
      }));
    });

    socket.on('message', (data) => {
      try {
        const msg = JSON.parse(data);
        if (msg.type === 'PONG') {
          wsMessageLatency.add(Date.now() - (msg.pingAt || Date.now()));
        }
        if (msg.type === 'TOKEN_MOVED') {
          tokenMoveRate.add(true);
        }
        if (msg.type === 'ROLL_RESULT') {
          diceRollRate.add(true);
        }
      } catch {
        sessErrors++;
      }
    });

    socket.on('error', () => {
      wsErrors.add(1);
      sessErrors++;
    });

    // Stay connected for a "round" duration (6 seconds = 1 combat round)
    sleep(6);
    socket.close();
  });

  tokenMoveRate.add(sessErrors === 0);
}

// ─── Main VU function ─────────────────────────────────────────────────────────

export default function main() {
  const vuId = __VU;
  const tableId = `load-table-${Math.floor(vuId / 5) + 1}`;  // 5 VUs per table

  // 1. Authenticate
  const token = authenticate(vuId);
  if (!token) {
    sleep(5);
    return;
  }

  // 2. Simulate a game session
  group('game-session', () => {
    // HTTP: compendium search (player looking up spell/ability)
    group('compendium-lookup', () => {
      searchCompendium(token);
    });

    sleep(1);

    // HTTP: dice roll via REST (used for macros/automation)
    group('dice-roll-rest', () => {
      rollDice(token);
      rollDice(token);
    });

    sleep(1);

    // WebSocket: full game session simulation
    group('ws-session', () => {
      simulateGameSession(token, tableId);
    });

    sleep(2);
  });
}

// ─── Teardown ─────────────────────────────────────────────────────────────────

export function teardown() {
  console.log('Load test complete. Check k6 metrics above for SLA compliance.');
}
