import { z } from 'zod';
import { validateEnv, baseEnvSchema } from '@vtt/shared-config';

const rulesEnvSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().int().positive().default(3003),
  DICE_HMAC_SECRET: z.string().min(16),
  SYSTEMS_DIR: z.string().default('./systems'),
  OTEL_SERVICE_NAME: z.string().default('rules-engine-service'),
});

export type RulesEnv = z.infer<typeof rulesEnvSchema>;

export const rulesEnv = (): RulesEnv => validateEnv(rulesEnvSchema);
