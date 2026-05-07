import { SERVICE_ROUTES } from '../../src/config/routes.config';

describe('SERVICE_ROUTES', () => {
  it('contains all required service prefixes', () => {
    const prefixes = SERVICE_ROUTES.map((r) => r.prefix);
    expect(prefixes).toContain('/v1/auth');
    expect(prefixes).toContain('/v1/campaigns');
    expect(prefixes).toContain('/v1/characters');
    expect(prefixes).toContain('/v1/rolls');
    expect(prefixes).toContain('/v1/systems');
    expect(prefixes).toContain('/v1/maps');
    expect(prefixes).toContain('/.well-known');
  });

  it('auth route does not require auth', () => {
    const authRoute = SERVICE_ROUTES.find((r) => r.prefix === '/v1/auth');
    expect(authRoute?.requiresAuth).toBe(false);
  });

  it('campaign route requires auth', () => {
    const route = SERVICE_ROUTES.find((r) => r.prefix === '/v1/campaigns');
    expect(route?.requiresAuth).toBe(true);
  });

  it('auth route has stricter rate limit than default', () => {
    const authRoute = SERVICE_ROUTES.find((r) => r.prefix === '/v1/auth');
    expect(authRoute?.rateLimit?.max).toBeLessThanOrEqual(20);
  });

  it('rolls route has rate limit configured', () => {
    const rollsRoute = SERVICE_ROUTES.find((r) => r.prefix === '/v1/rolls');
    expect(rollsRoute?.rateLimit).toBeDefined();
  });

  it('all routes have upstream defined', () => {
    for (const route of SERVICE_ROUTES) {
      expect(route.upstream).toBeTruthy();
    }
  });

  it('well-known route does not require auth', () => {
    const route = SERVICE_ROUTES.find((r) => r.prefix === '/.well-known');
    expect(route?.requiresAuth).toBe(false);
  });
});
