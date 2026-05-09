"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.observabilityEnvSchema = exports.messageBrokerEnvSchema = exports.authEnvSchema = exports.databaseEnvSchema = exports.baseEnvSchema = void 0;
exports.validateEnv = validateEnv;
const zod_1 = require("zod");
exports.baseEnvSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'staging', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().int().positive().default(3000),
    LOG_LEVEL: zod_1.z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    CORS_ORIGIN: zod_1.z.string().default('*'),
});
exports.databaseEnvSchema = zod_1.z.object({
    POSTGRES_HOST: zod_1.z.string(),
    POSTGRES_PORT: zod_1.z.coerce.number().int().positive().default(5432),
    POSTGRES_USER: zod_1.z.string(),
    POSTGRES_PASSWORD: zod_1.z.string(),
    POSTGRES_DB: zod_1.z.string(),
    POSTGRES_SSL: zod_1.z.coerce.boolean().default(false),
    MONGODB_URI: zod_1.z.string().url(),
    REDIS_HOST: zod_1.z.string(),
    REDIS_PORT: zod_1.z.coerce.number().int().positive().default(6379),
    REDIS_PASSWORD: zod_1.z.string().optional(),
    REDIS_TLS: zod_1.z.coerce.boolean().default(false),
});
exports.authEnvSchema = zod_1.z.object({
    JWT_PRIVATE_KEY: zod_1.z.string(),
    JWT_PUBLIC_KEY: zod_1.z.string(),
    JWT_ACCESS_TOKEN_TTL: zod_1.z.coerce.number().int().positive().default(900), // 15min
    JWT_REFRESH_TOKEN_TTL: zod_1.z.coerce.number().int().positive().default(2592000), // 30 days
    JWT_ISSUER: zod_1.z.string().default('vtt-platform'),
    OAUTH_GOOGLE_CLIENT_ID: zod_1.z.string().optional(),
    OAUTH_GOOGLE_CLIENT_SECRET: zod_1.z.string().optional(),
    OAUTH_DISCORD_CLIENT_ID: zod_1.z.string().optional(),
    OAUTH_DISCORD_CLIENT_SECRET: zod_1.z.string().optional(),
});
exports.messageBrokerEnvSchema = zod_1.z.object({
    RABBITMQ_URI: zod_1.z.string().url(),
    RABBITMQ_EXCHANGE_PREFIX: zod_1.z.string().default('vtt'),
});
exports.observabilityEnvSchema = zod_1.z.object({
    OTEL_ENABLED: zod_1.z.coerce.boolean().default(false),
    OTEL_EXPORTER_OTLP_ENDPOINT: zod_1.z.string().url().optional(),
    OTEL_SERVICE_NAME: zod_1.z.string(),
    OTEL_SERVICE_VERSION: zod_1.z.string().default('0.0.1'),
    PROMETHEUS_ENABLED: zod_1.z.coerce.boolean().default(true),
    PROMETHEUS_PORT: zod_1.z.coerce.number().int().positive().default(9090),
});
function validateEnv(schema) {
    const result = schema.safeParse(process.env);
    if (!result.success) {
        console.error('❌ Invalid environment variables:');
        console.error(JSON.stringify(result.error.format(), null, 2));
        process.exit(1);
    }
    return result.data;
}
//# sourceMappingURL=index.js.map