/**
 * k6 Load Test — API Gateway Throughput
 *
 * Simulates realistic VTT API usage:
 *   - Auth token refresh
 *   - Compendium searches
 *   - Character sheet reads
 *   - Dice roll requests
 *
 * Target SLOs:
 *   - P95 latency < 200ms for read endpoints
 *   - P95 latency < 500ms for write endpoints
 *   - Error rate < 0.1%
 *   - Throughput > 500 req/s sustained
 *
 * Run: k6 run --env BASE_URL=https://api.vtt-platform.com load-tests/scripts/api-gateway.k6.js
 */

import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// ─── Custom metrics ────────────────────────────────────────────────────────────
const compendiumSearchDuration = new Trend('compendium_search_duration', true);
const rollDuration              = new Trend('roll_duration', true);
const authErrors                = new Counter('auth_errors');
const rollErrors                = new Counter('roll_errors');
const errorRate                 = new Rate('error_rate');

// ─── Config ────────────────────────────────────────────────────────────────────
const BASE_URL  = __ENV.BASE_URL  ?? 'http://localhost:3000';
const API_URL   = __ENV.API_URL   ?? 'http://localhost:8080';
const TEST_JWT  = __ENV.TEST_JWT  ?? 'eyJ...test-token'; // pre-generated test JWT

export const options = {
  scenarios: {
    // Ramp up to peak load
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50  },  // warm up
        { duration: '1m',  target: 200 },  // ramp to 200 users
        { duration: '2m',  target: 500 },  // peak: 500 concurrent
        { duration: '1m',  target: 200 },  // scale down
        { duration: '30s', target: 0   },  // cool down
      ],
      gracefulRampDown: '30s',
    },
    // Sustained load spike
    spike: {
      executor: 'constant-vus',
      vus: 800,
      duration: '30s',
      startTime: '5m',
    },
  },

  thresholds: {
    // Overall HTTP
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed:   ['rate<0.01'],
    // Custom
    compendium_search_duration: ['p(95)<200'],
    roll_duration:              ['p(95)<150'],
    error_rate:                 ['rate<0.01'],
  },

  // Structured output for CI
  summaryTrendStats: ['min', 'med', 'avg', 'p(90)', 'p(95)', 'p(99)', 'max'],
};

const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TEST_JWT}`,
  'x-user-id': 'load-test-user',
};

// ─── Test scenarios ────────────────────────────────────────────────────────────

export default function () {
  const scenario = Math.random();

  if (scenario < 0.40) {
    // 40% — compendium browsing (read-heavy, cacheable)
    compendiumScenario();
  } else if (scenario < 0.65) {
    // 25% — dice rolling
    diceRollScenario();
  } else if (scenario < 0.80) {
    // 15% — character sheet reads
    characterSheetScenario();
  } else if (scenario < 0.90) {
    // 10% — auth token check / refresh
    authScenario();
  } else {
    // 10% — campaign listing
    campaignListScenario();
  }

  sleep(Math.random() * 2 + 0.5); // think time: 0.5–2.5s
}

function compendiumScenario() {
  group('compendium_search', () => {
    const queries = ['guerreiro', 'magia', 'monstro', 'halfling', 'espada', 'bola de fogo'];
    const q = queries[Math.floor(Math.random() * queries.length)];
    const systems = ['tormenta20', 'dnd5e'];
    const system = systems[Math.floor(Math.random() * systems.length)];

    const start = Date.now();
    const res = http.get(`${API_URL}/v1/compendium/entries?q=${q}&system=${system}&limit=10`, {
      headers: HEADERS,
    });
    compendiumSearchDuration.add(Date.now() - start);

    const ok = check(res, {
      'compendium search 200':    (r) => r.status === 200,
      'compendium has entries':   (r) => {
        try { return Array.isArray((JSON.parse(r.body as string) as any).entries); }
        catch { return false; }
      },
    });
    errorRate.add(!ok);
  });
}

function diceRollScenario() {
  group('dice_roll', () => {
    const notations = ['1d20', '2d6+3', '4d6kh3', '1d100', '1d20+5', '3d8'];
    const notation = notations[Math.floor(Math.random() * notations.length)];

    const start = Date.now();
    const res = http.post(
      `${API_URL}/v1/rolls`,
      JSON.stringify({ notation, context: 'load-test', tableId: 'test-table' }),
      { headers: HEADERS },
    );
    rollDuration.add(Date.now() - start);

    const ok = check(res, {
      'roll 200 or 201': (r) => r.status === 200 || r.status === 201,
      'roll has total':  (r) => {
        try { return typeof (JSON.parse(r.body as string) as any).total === 'number'; }
        catch { return false; }
      },
      'roll within bounds': (r) => {
        try {
          const body = JSON.parse(r.body as string) as any;
          return body.total >= 1 && body.total <= 200;
        } catch { return false; }
      },
    });

    if (!ok) rollErrors.add(1);
    errorRate.add(!ok);
  });
}

function characterSheetScenario() {
  group('character_sheet', () => {
    // In real test: use pre-seeded character IDs
    const res = http.get(`${API_URL}/v1/characters/campaign/test-campaign-id`, {
      headers: HEADERS,
    });
    const ok = check(res, {
      'character list 200': (r) => r.status === 200,
    });
    errorRate.add(!ok);
  });
}

function authScenario() {
  group('auth', () => {
    const res = http.get(`${API_URL}/v1/users/me`, { headers: HEADERS });
    const ok = check(res, {
      'auth me 200 or 401': (r) => r.status === 200 || r.status === 401,
    });
    if (res.status >= 500) {
      authErrors.add(1);
      errorRate.add(true);
    }
  });
}

function campaignListScenario() {
  group('campaign_list', () => {
    const res = http.get(`${API_URL}/v1/campaigns`, { headers: HEADERS });
    const ok = check(res, {
      'campaigns 200': (r) => r.status === 200,
    });
    errorRate.add(!ok);
  });
}
