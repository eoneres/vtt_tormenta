import { registerAs } from '@nestjs/config';

export const marketplaceEnv = registerAs('marketplace', () => ({
  POSTGRES_HOST: process.env.POSTGRES_HOST ?? 'localhost',
  POSTGRES_PORT: Number(process.env.POSTGRES_PORT ?? 5432),
  POSTGRES_USER: process.env.POSTGRES_USER ?? 'postgres',
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD ?? 'postgres',
  POSTGRES_DB: process.env.POSTGRES_DB ?? 'vtt_marketplace',
  POSTGRES_SSL: process.env.POSTGRES_SSL === 'true',
}));
