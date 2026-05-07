import 'reflect-metadata';
import { Server } from 'colyseus';
import { RedisPresence } from '@colyseus/redis-presence';
import { RedisDriver } from '@colyseus/redis-driver';
import { monitor } from '@colyseus/monitor';
import express from 'express';
import { createServer } from 'http';
import { loadEnv } from './config/env';
import { GameRoom } from './rooms/game-room';
import { buildHealthRouter } from './health/health.router';

async function bootstrap(): Promise<void> {
  const env = loadEnv();

  const app = express();
  app.use(express.json());

  // Health + metrics
  app.use(buildHealthRouter());

  // Colyseus monitor (dev only)
  if (env.NODE_ENV !== 'production') {
    app.use('/colyseus', monitor());
  }

  const httpServer = createServer(app);

  const gameServer = new Server({
    server: httpServer,
    presence: new RedisPresence(env.REDIS_URL),
    driver: new RedisDriver(env.REDIS_URL),
  });

  gameServer.define('game_room', GameRoom, { env }).enableRealtimeListing();

  await gameServer.listen(env.PORT);
  console.info(`Realtime Gateway running on port ${env.PORT}`);

  const shutdown = async (): Promise<void> => {
    await gameServer.gracefullyShutdown();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

void bootstrap();
