import { z } from 'zod';

export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  CORS_ORIGIN: z.string().default('*'),
});

export const databaseEnvSchema = z.object({
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_SSL: z.coerce.boolean().default(false),
  
  MONGODB_URI: z.string().url(),
  
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_TLS: z.coerce.boolean().default(false),
});

export const authEnvSchema = z.object({
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  JWT_ACCESS_TOKEN_TTL: z.coerce.number().int().positive().default(900), // 15min
  JWT_REFRESH_TOKEN_TTL: z.coerce.number().int().positive().default(2592000), // 30 days
  JWT_ISSUER: z.string().default('vtt-platform'),
  
  OAUTH_GOOGLE_CLIENT_ID: z.string().optional(),
  OAUTH_GOOGLE_CLIENT_SECRET: z.string().optional(),
  OAUTH_DISCORD_CLIENT_ID: z.string().optional(),
  OAUTH_DISCORD_CLIENT_SECRET: z.string().optional(),
});

export const messageBrokerEnvSchema = z.object({
  RABBITMQ_URI: z.string().url(),
  RABBITMQ_EXCHANGE_PREFIX: z.string().default('vtt'),
});

export const observabilityEnvSchema = z.object({
  OTEL_ENABLED: z.coerce.boolean().default(false),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
  OTEL_SERVICE_NAME: z.string(),
  OTEL_SERVICE_VERSION: z.string().default('0.0.1'),
  
  PROMETHEUS_ENABLED: z.coerce.boolean().default(true),
  PROMETHEUS_PORT: z.coerce.number().int().positive().default(9090),
});

export function validateEnv<T extends z.ZodTypeAny>(schema: T): z.infer<T> {
  const result = schema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }
  
  return result.data;
}

export type BaseEnv = z.infer<typeof baseEnvSchema>;
export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;
export type AuthEnv = z.infer<typeof authEnvSchema>;
export type MessageBrokerEnv = z.infer<typeof messageBrokerEnvSchema>;
export type ObservabilityEnv = z.infer<typeof observabilityEnvSchema>;
