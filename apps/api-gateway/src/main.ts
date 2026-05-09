import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import httpProxy from '@fastify/http-proxy';
import { generateRequestId, generateTraceId } from '@vtt/shared-utils';
import { SERVICE_ROUTES } from './config/routes.config';
import { buildJwtMiddleware } from './middleware/jwt.middleware';

const JWKS_URL =
  process.env['JWKS_URL'] ?? 'http://localhost:3001/.well-known/jwks.json';

async function bootstrap(): Promise<void> {
  const app = Fastify({
    logger: {
      level: process.env['LOG_LEVEL'] ?? 'info',
      serializers: {
        req(req) {
          return {
            method: req.method,
            url: req.url,
            traceId: req.headers['x-trace-id'],
            requestId: req.id,
          };
        },
      },
    },
    genReqId: () => generateRequestId(),
    trustProxy: true,
  });

  // ─── Trace ID injection ──────────────────────────────────────────────────
  app.addHook('onRequest', async (request) => {
    if (!request.headers['x-trace-id']) {
      request.headers['x-trace-id'] = generateTraceId();
    }
  });

  // ─── Global rate limit ───────────────────────────────────────────────────
  await app.register(rateLimit, {
    global: true,
    max: 300,
    timeWindow: '1 minute',
    redis: undefined, // use in-memory for dev; swap for Redis in prod
    keyGenerator: (req) =>
      (req.headers['x-user-id'] as string) ?? req.ip,
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded',
    }),
  });

  const jwtMiddleware = buildJwtMiddleware(JWKS_URL);

  // ─── Register proxy routes ───────────────────────────────────────────────
  for (const route of SERVICE_ROUTES) {
    // Per-route rate limit override
    if (route.rateLimit) {
      await app.register(rateLimit, {
        max: route.rateLimit.max,
        timeWindow: route.rateLimit.timeWindow,
        keyGenerator: (req) =>
          (req.headers['x-user-id'] as string) ?? req.ip,
      });
    }

    const proxyOptions: any = {
      upstream: route.upstream,
      prefix: route.prefix,
      rewritePrefix: route.prefix,
      httpMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      replyOptions: {
        rewriteRequestHeaders: ((_req: any, headers: any) => ({
          ...headers,
          'x-forwarded-by': 'vtt-api-gateway',
        })) as any,
      },
    };

    // Only add preHandler if authentication is required
    if (route.requiresAuth) {
      proxyOptions.preHandler = jwtMiddleware;
    }

    await app.register(httpProxy, proxyOptions);
  }

  // ─── Health endpoint ─────────────────────────────────────────────────────
  app.get('/health', async () => ({
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    routes: SERVICE_ROUTES.map((r) => r.prefix),
  }));

  // ─── 404 handler ─────────────────────────────────────────────────────────
  app.setNotFoundHandler(async (_, reply) => {
    await reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: 'Route not found',
    });
  });

  const port = parseInt(process.env['PORT'] ?? '3000', 10);
  await app.listen({ port, host: '0.0.0.0' });

  const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
  for (const signal of signals) {
    process.on(signal, async () => {
      await app.close();
      process.exit(0);
    });
  }
}

void bootstrap();
