/**
 * k6 WebSocket Stress Test — Colyseus Realtime Gateway
 *
 * Pure WebSocket stress: 200 concurrent connections hammering:
 *   - Token moves (most CPU-intensive — triggers raycasting)
 *   - Dice rolls (authoritative server-side)
 *   - Chat messages (broadcast to all room members)
 *
 * Validates the <100ms p95 WebSocket latency SLA.
 *
 * Run:
 *   k6 run test/load/ws-stress.js \
 *     -e WS_URL=wss://staging.vtt-platform.com \
 *     -e AUTH_TOKEN=<jwt>
 */

import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

const moveLatency   = new Trend('token_move_latency_ms', true);
const rollLatency   = new Trend('dice_roll_latency_ms', true);
const chatLatency   = new Trend('chat_latency_ms', true);
const reconnects    = new Counter('ws_reconnects');
const messageErrors = new Rate('ws_message_error_rate');

const WS_URL    = __ENV.WS_URL    || 'ws://localhost:3005';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'test-token';

export const options = {
  stages: [
    { duration: '30s', target: 50  },
    { duration: '2m',  target: 200 },
    { duration: '1m',  target: 200 },
    { duration: '30s', target: 0   },
  ],
  thresholds: {
    'token_move_latency_ms': ['p(95)<100', 'p(99)<200'],
    'dice_roll_latency_ms':  ['p(95)<150', 'p(99)<300'],
    'chat_latency_ms':       ['p(95)<80'],
    'ws_message_error_rate': ['rate<0.01'],
    'ws_reconnects':         ['count<50'],
  },
};

export default function () {
  const tableId = `stress-table-${Math.floor(__VU / 5) + 1}`;
  const url     = `${WS_URL}?token=${AUTH_TOKEN}&tableId=${tableId}`;

  const pendingOps = new Map();
  let opId = 0;

  const res = ws.connect(url, {}, (socket) => {
    socket.on('open', () => {
      // Token move scenario: every 2 seconds
      const moveInterval = setInterval(() => {
        const id = ++opId;
        const start = Date.now();
        pendingOps.set(`move-${id}`, start);
        socket.send(JSON.stringify({
          type: 'MOVE_TOKEN',
          _opId: id,
          tokenId: `token-${__VU % 5 + 1}`,
          position: {
            x: Math.floor(Math.random() * 30),
            y: Math.floor(Math.random() * 30),
          },
        }));
      }, 2000);

      // Dice roll: every 5 seconds
      const rollInterval = setInterval(() => {
        const id = ++opId;
        const start = Date.now();
        pendingOps.set(`roll-${id}`, start);
        socket.send(JSON.stringify({
          type: 'ROLL_DICE',
          _opId: id,
          expression: '1d20+5',
        }));
      }, 5000);

      // Chat: every 10 seconds
      const chatInterval = setInterval(() => {
        const id = ++opId;
        const start = Date.now();
        pendingOps.set(`chat-${id}`, start);
        socket.send(JSON.stringify({
          type: 'CHAT_MESSAGE',
          _opId: id,
          content: `Load test message ${id} from VU ${__VU}`,
        }));
      }, 10000);

      // Run for 25 seconds per VU iteration
      sleep(25);
      clearInterval(moveInterval);
      clearInterval(rollInterval);
      clearInterval(chatInterval);
      socket.close();
    });

    socket.on('message', (data) => {
      try {
        const msg = JSON.parse(data);
        const opId = msg._opId;

        if (opId) {
          const key = `${msg.type?.includes('MOVE') ? 'move' : msg.type?.includes('ROLL') ? 'roll' : 'chat'}-${opId}`;
          const start = pendingOps.get(key);
          if (start) {
            const latency = Date.now() - start;
            if (key.startsWith('move')) moveLatency.add(latency);
            else if (key.startsWith('roll')) rollLatency.add(latency);
            else chatLatency.add(latency);
            pendingOps.delete(key);
          }
        }

        messageErrors.add(false);
      } catch {
        messageErrors.add(true);
      }
    });

    socket.on('error', (e) => {
      messageErrors.add(true);
    });

    socket.on('close', (code) => {
      if (code !== 1000 && code !== 1001) {
        reconnects.add(1);
      }
    });
  });

  check(res, { 'ws connected': (r) => r && r.status === 101 });
}
