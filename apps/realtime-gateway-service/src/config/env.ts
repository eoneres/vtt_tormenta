import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(2567),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  VTT_ENGINE_URL: z.string().default('http://localhost:3004'),
  RULES_ENGINE_URL: z.string().default('http://localhost:3003'),
  JWKS_URL: z.string().default('http://localhost:3001/.well-known/jwks.json'),
  DICE_HMAC_SECRET: z.string().min(16),
  MAX_CLIENTS_PER_ROOM: z.coerce.number().default(8),
  PATCH_RATE_MS: z.coerce.number().default(50),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type RealtimeEnv = z.infer<typeof schema>;

export function loadEnv(): RealtimeEnv {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment:', result.error.flatten());
    process.exit(1);
  }
  return result.data;
}
