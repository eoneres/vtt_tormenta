export interface ServiceRoute {
  prefix: string;
  upstream: string;
  stripPrefix?: boolean;
  requiresAuth: boolean;
  rateLimit?: { max: number; timeWindow: string };
}

export const SERVICE_ROUTES: ServiceRoute[] = [
  {
    prefix: '/v1/auth',
    upstream: process.env['IDENTITY_SERVICE_URL'] ?? 'http://localhost:3001',
    requiresAuth: false,
    rateLimit: { max: 20, timeWindow: '1 minute' },
  },
  {
    prefix: '/v1/users',
    upstream: process.env['IDENTITY_SERVICE_URL'] ?? 'http://localhost:3001',
    requiresAuth: true,
  },
  {
    prefix: '/.well-known',
    upstream: process.env['IDENTITY_SERVICE_URL'] ?? 'http://localhost:3001',
    requiresAuth: false,
  },
  {
    prefix: '/v1/campaigns',
    upstream: process.env['CAMPAIGN_SERVICE_URL'] ?? 'http://localhost:3002',
    requiresAuth: true,
  },
  {
    prefix: '/v1/tables',
    upstream: process.env['CAMPAIGN_SERVICE_URL'] ?? 'http://localhost:3002',
    requiresAuth: true,
  },
  {
    prefix: '/v1/characters',
    upstream: process.env['CAMPAIGN_SERVICE_URL'] ?? 'http://localhost:3002',
    requiresAuth: true,
  },
  {
    prefix: '/v1/rolls',
    upstream: process.env['RULES_ENGINE_SERVICE_URL'] ?? 'http://localhost:3003',
    requiresAuth: true,
    rateLimit: { max: 120, timeWindow: '1 minute' },
  },
  {
    prefix: '/v1/systems',
    upstream: process.env['RULES_ENGINE_SERVICE_URL'] ?? 'http://localhost:3003',
    requiresAuth: false,
  },
  {
    prefix: '/v1/maps',
    upstream: process.env['VTT_ENGINE_SERVICE_URL'] ?? 'http://localhost:3004',
    requiresAuth: true,
  },
  {
    prefix: '/v1/compendium',
    upstream: process.env['COMPENDIUM_SERVICE_URL'] ?? 'http://localhost:3005',
    requiresAuth: false,
    rateLimit: { max: 200, timeWindow: '1 minute' },
  },
];
