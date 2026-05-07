import { Router } from 'express';
import { matchMaker } from 'colyseus';
import { register, Gauge, Counter } from 'prom-client';

// ─── Prometheus Metrics ───────────────────────────────────────────────────────

const activeRoomsGauge = new Gauge({
  name: 'vtt_realtime_active_rooms',
  help: 'Number of active game rooms',
});

const connectedClientsGauge = new Gauge({
  name: 'vtt_realtime_connected_clients',
  help: 'Total connected WebSocket clients',
});

const commandsCounter = new Counter({
  name: 'vtt_realtime_commands_total',
  help: 'Total commands processed',
  labelNames: ['type', 'status'],
});

export { commandsCounter };

// ─── Router ───────────────────────────────────────────────────────────────────

export function buildHealthRouter(): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'realtime-gateway',
      timestamp: new Date().toISOString(),
    });
  });

  router.get('/ready', async (_req, res) => {
    try {
      // Check matchmaker is responsive
      const rooms = await matchMaker.query({});
      activeRoomsGauge.set(rooms.length);
      const clients = rooms.reduce((sum, r) => sum + r.clients, 0);
      connectedClientsGauge.set(clients);
      res.json({ status: 'ready', rooms: rooms.length, clients });
    } catch {
      res.status(503).json({ status: 'not_ready' });
    }
  });

  router.get('/metrics', async (_req, res) => {
    res.set('Content-Type', register.contentType);
    res.send(await register.metrics());
  });

  return router;
}
