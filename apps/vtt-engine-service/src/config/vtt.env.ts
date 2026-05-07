import { z } from 'zod';
import { validateEnv, baseEnvSchema } from '@vtt/shared-config';

const vttEnvSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().int().positive().default(3004),
  MONGODB_URI: z.string().url(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  OTEL_SERVICE_NAME: z.string().default('vtt-engine-service'),
});

export type VttEnv = z.infer<typeof vttEnvSchema>;

export const vttEnv = (): VttEnv => validateEnv(vttEnvSchema);
