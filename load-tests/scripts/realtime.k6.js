/**
 * k6 Load Test — Realtime Multiplayer (Colyseus)
 *
 * Simulates 100 simultaneous tables with 6 players each = 600 WebSocket connections.
 * Tests the authoritative server's capacity under realistic game workloads.
 *
 * Target SLOs:
 *   - WebSocket connection < 500ms P95
 *   - Message round-trip < 100ms P95 (state sync target)
 *   - 0 message drops under sustained load
 *   - CPU per pod < 70% at 100 tables
 *
 * Run: k6 run --env WS_URL=wss://realtime.vtt-platform.com load-tests/scripts/realtime.k6.js
 */

import ws from 'k6/ws';
import { sleep, check, group } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';

// ─── Custom metrics ────────────────────────────────────────────────────────────
const connectionTime     = new Trend('ws_connection_time', true);
const messageRoundTrip   = new Trend('ws_message_round_trip', true);
const messagesReceived   = new Counter('ws_messages_received');
const connectionsFailed  = new Counter('ws_connections_failed');
const stateUpdateErrors  = new Rate('state_update_errors');

const WS_URL   = __ENV.WS_URL   ?? 'ws://localhost:2567';
const TEST_JWT = __ENV.TEST_JWT ?? 'eyJ...test-token';

export const options = {
  scenarios: {
    // 100 tables × 6 players = 600 concurrent WS connections
    concurrent_tables: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },  // 100 tables (1 VU = 1 player session)
        { duration: '1m',  target: 300 },  // 50 tables × 6 players
        { duration: '2m',  target: 600 },  // 100 tables × 6 players (target)
        { duration: '2m',  target: 600 },  // sustain
        { duration: '30s', target: 0   },
      ],
    },
    // Sudden mass join (session start spike)
    session_start_spike: {
      executor: 'constant-vus',
      vus: 200,
      duration: '30s',
      startTime: '4m30s',
    },
  },

  thresholds: {
    ws_connection_time:   ['p(95)<500'],
    ws_message_round_trip: ['p(95)<100'],
    ws_connections_failed: ['count<10'],
    state_update_errors:   ['rate<0.005'],
  },
};

export default function () {
  const tableId  = `load-table-${Math.floor(__VU / 6)}`;      // 6 VUs per table
  const playerId = `load-player-${__VU}`;

  const connectStart = Date.now();

  const res = ws.connect(
    `${WS_URL}`,
    {
      headers: { Authorization: `Bearer ${TEST_JWT}` },
    },
    function (socket) {
      connectionTime.add(Date.now() - connectStart);

      let connected = false;
      let messageCount = 0;
      let pingStart = 0;

      socket.on('open', () => {
        connected = true;

        // Join or create room
        socket.send(JSON.stringify({
          type: 'joinOrCreate',
          roomName: 'game_room',
          options: { tableId, playerId, jwt: TEST_JWT },
        }));
      });

      socket.on('message', (data: string) => {
        messageCount++;
        messagesReceived.add(1);

        try {
          const msg = JSON.parse(data) as any;

          // Track round-trip for pong responses
          if (msg.type === 'pong' && pingStart > 0) {
            messageRoundTrip.add(Date.now() - pingStart);
            pingStart = 0;
          }

          // Validate state patches are well-formed
          if (msg.type === 'patch') {
            const valid = check(msg, {
              'patch has tableId':  (m) => typeof m.tableId === 'string',
              'patch has changes':  (m) => Array.isArray(m.changes) || typeof m.state === 'object',
            });
            stateUpdateErrors.add(!valid);
          }
        } catch {
          stateUpdateErrors.add(true);
        }
      });

      socket.on('error', (e: Error) => {
        connectionsFailed.add(1);
      });

      // Simulate realistic game activity
      const SESSION_DURATION_MS = 120_000; // 2 minute session
      const activityInterval = socket.setInterval(() => {
        if (!connected) return;

        const action = Math.random();

        if (action < 0.30) {
          // Token move (most common action)
          socket.send(JSON.stringify({
            type: 'command',
            name: 'MOVE_TOKEN',
            payload: {
              tokenId: `token-${playerId}`,
              x: Math.floor(Math.random() * 1400) + 70,
              y: Math.floor(Math.random() * 1400) + 70,
            },
          }));
        } else if (action < 0.55) {
          // Dice roll request
          socket.send(JSON.stringify({
            type: 'command',
            name: 'ROLL_DICE',
            payload: {
              notation: ['1d20', '2d6+3', '1d8'][Math.floor(Math.random() * 3)],
              reason: 'attack',
            },
          }));
        } else if (action < 0.70) {
          // Chat message
          socket.send(JSON.stringify({
            type: 'command',
            name: 'SEND_CHAT',
            payload: { message: `Load test message ${messageCount}` },
          }));
        } else if (action < 0.80) {
          // Ping to measure RTT
          pingStart = Date.now();
          socket.send(JSON.stringify({ type: 'ping' }));
        }
        // 20%: no action (idle player)
      }, 2000); // Action every 2 seconds

      socket.setTimeout(() => {
        socket.clearInterval(activityInterval);
        socket.send(JSON.stringify({ type: 'command', name: 'LEAVE_TABLE', payload: {} }));
        socket.close();
      }, SESSION_DURATION_MS);
    },
  );

  check(res, { 'ws connection successful': (r) => r && (r as any).status === 101 });

  sleep(1); // brief pause before next connection attempt
}
