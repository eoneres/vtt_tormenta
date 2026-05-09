import { z } from 'zod';
export declare const baseEnvSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "staging", "production", "test"]>>;
    PORT: z.ZodDefault<z.ZodNumber>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error"]>>;
    CORS_ORIGIN: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "staging" | "production" | "test";
    PORT: number;
    LOG_LEVEL: "debug" | "info" | "warn" | "error";
    CORS_ORIGIN: string;
}, {
    NODE_ENV?: "development" | "staging" | "production" | "test" | undefined;
    PORT?: number | undefined;
    LOG_LEVEL?: "debug" | "info" | "warn" | "error" | undefined;
    CORS_ORIGIN?: string | undefined;
}>;
export declare const databaseEnvSchema: z.ZodObject<{
    POSTGRES_HOST: z.ZodString;
    POSTGRES_PORT: z.ZodDefault<z.ZodNumber>;
    POSTGRES_USER: z.ZodString;
    POSTGRES_PASSWORD: z.ZodString;
    POSTGRES_DB: z.ZodString;
    POSTGRES_SSL: z.ZodDefault<z.ZodBoolean>;
    MONGODB_URI: z.ZodString;
    REDIS_HOST: z.ZodString;
    REDIS_PORT: z.ZodDefault<z.ZodNumber>;
    REDIS_PASSWORD: z.ZodOptional<z.ZodString>;
    REDIS_TLS: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    POSTGRES_HOST: string;
    POSTGRES_PORT: number;
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: string;
    POSTGRES_DB: string;
    POSTGRES_SSL: boolean;
    MONGODB_URI: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_TLS: boolean;
    REDIS_PASSWORD?: string | undefined;
}, {
    POSTGRES_HOST: string;
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: string;
    POSTGRES_DB: string;
    MONGODB_URI: string;
    REDIS_HOST: string;
    POSTGRES_PORT?: number | undefined;
    POSTGRES_SSL?: boolean | undefined;
    REDIS_PORT?: number | undefined;
    REDIS_PASSWORD?: string | undefined;
    REDIS_TLS?: boolean | undefined;
}>;
export declare const authEnvSchema: z.ZodObject<{
    JWT_PRIVATE_KEY: z.ZodString;
    JWT_PUBLIC_KEY: z.ZodString;
    JWT_ACCESS_TOKEN_TTL: z.ZodDefault<z.ZodNumber>;
    JWT_REFRESH_TOKEN_TTL: z.ZodDefault<z.ZodNumber>;
    JWT_ISSUER: z.ZodDefault<z.ZodString>;
    OAUTH_GOOGLE_CLIENT_ID: z.ZodOptional<z.ZodString>;
    OAUTH_GOOGLE_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
    OAUTH_DISCORD_CLIENT_ID: z.ZodOptional<z.ZodString>;
    OAUTH_DISCORD_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    JWT_PRIVATE_KEY: string;
    JWT_PUBLIC_KEY: string;
    JWT_ACCESS_TOKEN_TTL: number;
    JWT_REFRESH_TOKEN_TTL: number;
    JWT_ISSUER: string;
    OAUTH_GOOGLE_CLIENT_ID?: string | undefined;
    OAUTH_GOOGLE_CLIENT_SECRET?: string | undefined;
    OAUTH_DISCORD_CLIENT_ID?: string | undefined;
    OAUTH_DISCORD_CLIENT_SECRET?: string | undefined;
}, {
    JWT_PRIVATE_KEY: string;
    JWT_PUBLIC_KEY: string;
    JWT_ACCESS_TOKEN_TTL?: number | undefined;
    JWT_REFRESH_TOKEN_TTL?: number | undefined;
    JWT_ISSUER?: string | undefined;
    OAUTH_GOOGLE_CLIENT_ID?: string | undefined;
    OAUTH_GOOGLE_CLIENT_SECRET?: string | undefined;
    OAUTH_DISCORD_CLIENT_ID?: string | undefined;
    OAUTH_DISCORD_CLIENT_SECRET?: string | undefined;
}>;
export declare const messageBrokerEnvSchema: z.ZodObject<{
    RABBITMQ_URI: z.ZodString;
    RABBITMQ_EXCHANGE_PREFIX: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    RABBITMQ_URI: string;
    RABBITMQ_EXCHANGE_PREFIX: string;
}, {
    RABBITMQ_URI: string;
    RABBITMQ_EXCHANGE_PREFIX?: string | undefined;
}>;
export declare const observabilityEnvSchema: z.ZodObject<{
    OTEL_ENABLED: z.ZodDefault<z.ZodBoolean>;
    OTEL_EXPORTER_OTLP_ENDPOINT: z.ZodOptional<z.ZodString>;
    OTEL_SERVICE_NAME: z.ZodString;
    OTEL_SERVICE_VERSION: z.ZodDefault<z.ZodString>;
    PROMETHEUS_ENABLED: z.ZodDefault<z.ZodBoolean>;
    PROMETHEUS_PORT: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    OTEL_ENABLED: boolean;
    OTEL_SERVICE_NAME: string;
    OTEL_SERVICE_VERSION: string;
    PROMETHEUS_ENABLED: boolean;
    PROMETHEUS_PORT: number;
    OTEL_EXPORTER_OTLP_ENDPOINT?: string | undefined;
}, {
    OTEL_SERVICE_NAME: string;
    OTEL_ENABLED?: boolean | undefined;
    OTEL_EXPORTER_OTLP_ENDPOINT?: string | undefined;
    OTEL_SERVICE_VERSION?: string | undefined;
    PROMETHEUS_ENABLED?: boolean | undefined;
    PROMETHEUS_PORT?: number | undefined;
}>;
export declare function validateEnv<T extends z.ZodTypeAny>(schema: T): z.infer<T>;
export type BaseEnv = z.infer<typeof baseEnvSchema>;
export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;
export type AuthEnv = z.infer<typeof authEnvSchema>;
export type MessageBrokerEnv = z.infer<typeof messageBrokerEnvSchema>;
export type ObservabilityEnv = z.infer<typeof observabilityEnvSchema>;
//# sourceMappingURL=index.d.ts.map