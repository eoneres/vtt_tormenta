export interface ServiceRoute {
  prefix: string;
  upstream: string;
  stripPrefix?: boolean;
  requiresAuth: boolean;
  rateLimit?: { max: number; timeWindow: string };
  /** Routes accessible publicly (no auth required even if requiresAuth=true) */
  publicPaths?: string[];
}

export const SERVICE_ROUTES: ServiceRoute[] = [
  // ─── Identity / Auth ──────────────────────────────────────────────────────
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
  // ─── LGPD / Privacy (Art. 18) ─────────────────────────────────────────────
  {
    prefix: '/v1/lgpd',
    upstream: process.env['IDENTITY_SERVICE_URL'] ?? 'http://localhost:3001',
    requiresAuth: true,
    publicPaths: ['/v1/lgpd/info'], // data processing info is public
    rateLimit: { max: 10, timeWindow: '1 hour' }, // strict: privacy endpoints
  },

  // ─── Campaign & Character ──────────────────────────────────────────────────
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

  // ─── Rules Engine ─────────────────────────────────────────────────────────
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
    prefix: '/v1/automations',
    upstream: process.env['RULES_ENGINE_SERVICE_URL'] ?? 'http://localhost:3003',
    requiresAuth: true,
    rateLimit: { max: 60, timeWindow: '1 minute' },
  },

  // ─── VTT Engine ───────────────────────────────────────────────────────────
  {
    prefix: '/v1/maps',
    upstream: process.env['VTT_ENGINE_SERVICE_URL'] ?? 'http://localhost:3004',
    requiresAuth: true,
  },
  {
    prefix: '/v1/tokens',
    upstream: process.env['VTT_ENGINE_SERVICE_URL'] ?? 'http://localhost:3004',
    requiresAuth: true,
  },
  {
    prefix: '/v1/fog',
    upstream: process.env['VTT_ENGINE_SERVICE_URL'] ?? 'http://localhost:3004',
    requiresAuth: true,
  },

  // ─── Compendium ───────────────────────────────────────────────────────────
  {
    prefix: '/v1/compendium',
    upstream: process.env['COMPENDIUM_SERVICE_URL'] ?? 'http://localhost:3040',
    requiresAuth: false,
    rateLimit: { max: 200, timeWindow: '1 minute' },
  },

  // ─── Notifications ────────────────────────────────────────────────────────
  {
    prefix: '/v1/notifications',
    upstream: process.env['NOTIFICATION_SERVICE_URL'] ?? 'http://localhost:3050',
    requiresAuth: true,
  },

  // ─── Marketplace ──────────────────────────────────────────────────────────
  {
    prefix: '/v1/marketplace',
    upstream: process.env['MARKETPLACE_SERVICE_URL'] ?? 'http://localhost:3060',
    requiresAuth: false,
    publicPaths: ['/v1/marketplace/listings', '/v1/marketplace/search'],
    rateLimit: { max: 100, timeWindow: '1 minute' },
  },

  // ─── Billing ──────────────────────────────────────────────────────────────
  {
    prefix: '/v1/billing',
    upstream: process.env['BILLING_SERVICE_URL'] ?? 'http://localhost:3070',
    requiresAuth: true,
    rateLimit: { max: 20, timeWindow: '1 minute' },
  },
];
