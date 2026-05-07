import { z } from 'zod';
import { validateEnv, baseEnvSchema, databaseEnvSchema, messageBrokerEnvSchema } from '@vtt/shared-config';

const campaignEnvSchema = baseEnvSchema
  .merge(databaseEnvSchema.pick({
    POSTGRES_HOST: true, POSTGRES_PORT: true, POSTGRES_USER: true,
    POSTGRES_PASSWORD: true, POSTGRES_DB: true, POSTGRES_SSL: true,
  }))
  .merge(messageBrokerEnvSchema)
  .extend({
    PORT: z.coerce.number().int().positive().default(3002),
    JWT_PUBLIC_KEY: z.string(),
    JWT_ISSUER: z.string().default('vtt-platform'),
    OTEL_SERVICE_NAME: z.string().default('campaign-service'),
  });

export type CampaignEnv = z.infer<typeof campaignEnvSchema>;

export const campaignEnv = (): CampaignEnv => validateEnv(campaignEnvSchema);
