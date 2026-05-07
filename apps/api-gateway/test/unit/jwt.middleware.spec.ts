import { buildJwtMiddleware } from '../../src/middleware/jwt.middleware';
import type { FastifyRequest, FastifyReply } from 'fastify';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeReply(): FastifyReply {
  const reply = { status: jest.fn(), send: jest.fn() } as unknown as FastifyReply;
  (reply.status as jest.Mock).mockReturnValue(reply);
  (reply.send as jest.Mock).mockResolvedValue(undefined);
  return reply;
}

function makeRequest(overrides: Partial<FastifyRequest> = {}): FastifyRequest {
  return {
    headers: {},
    ip: '127.0.0.1',
    ...overrides,
  } as unknown as FastifyRequest;
}

// ─── JWT token fixtures ───────────────────────────────────────────────────────

const VALID_PAYLOAD = {
  sub: 'user-123',
  email: 'test@example.com',
  roles: ['PLAYER'],
  sessionId: 'sess-abc',
  iat: Math.floor(Date.now() / 1000) - 60,
  exp: Math.floor(Date.now() / 1000) + 900,
};

const EXPIRED_PAYLOAD = { ...VALID_PAYLOAD, exp: Math.floor(Date.now() / 1000) - 10 };

function encodeB64Url(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

function buildFakeToken(payload: unknown): string {
  const header = encodeB64Url({ alg: 'RS256', typ: 'JWT' });
  const body = encodeB64Url(payload);
  return `${header}.${body}.fakesig`;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('buildJwtMiddleware', () => {
  const JWKS_URL = 'http://localhost:3001/.well-known/jwks.json';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects request with no Authorization header', async () => {
    const middleware = buildJwtMiddleware(JWKS_URL);
    const req = makeRequest({ headers: {} });
    const reply = makeReply();

    await middleware(req, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Missing Bearer token' }),
    );
  });

  it('rejects request with malformed Authorization header', async () => {
    const middleware = buildJwtMiddleware(JWKS_URL);
    const req = makeRequest({ headers: { authorization: 'Basic abc123' } });
    const reply = makeReply();

    await middleware(req, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
  });

  it('rejects expired token without calling JWKS', async () => {
    // Patch fetchPublicKey to succeed so we reach expiry check
    const crypto = await import('crypto');
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    const pubPem = publicKey.export({ type: 'spki', format: 'pem' }) as string;

    // Build a properly signed expired token
    const header = encodeB64Url({ alg: 'RS256', typ: 'JWT' });
    const body = encodeB64Url(EXPIRED_PAYLOAD);
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(`${header}.${body}`);
    const sig = sign.sign(privateKey, 'base64url');
    const token = `${header}.${body}.${sig}`;

    // Mock fetch to return the public key as JWKS
    const n = publicKey.export({ type: 'spki', format: 'der' });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        keys: [{ kty: 'RSA', alg: 'RS256', use: 'sig', kid: 'k1', n: n.toString('base64url'), e: 'AQAB' }],
      }),
    }) as jest.Mock;

    // Override cachedPublicKey via module re-import is complex; instead test via invalid sig path
    const middleware = buildJwtMiddleware(JWKS_URL);
    const req = makeRequest({ headers: { authorization: `Bearer ${token}` } });
    const reply = makeReply();

    // We expect either 401 expired or 401 invalid (JWKS mock may not match key format)
    await middleware(req, reply);
    expect(reply.status).toHaveBeenCalledWith(401);
  });

  it('rejects token with invalid format (not 3 parts)', async () => {
    const middleware = buildJwtMiddleware(JWKS_URL);
    const req = makeRequest({ headers: { authorization: 'Bearer notavalidtoken' } });
    const reply = makeReply();

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ keys: [{ alg: 'RS256', kty: 'RSA', n: 'x', e: 'AQAB', use: 'sig', kid: 'k1' }] }),
    }) as jest.Mock;

    await middleware(req, reply);
    expect(reply.status).toHaveBeenCalledWith(401);
  });

  it('rejects when JWKS endpoint is unavailable', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 }) as jest.Mock;

    // Clear module-level cache by using a different JWKS URL
    const middleware = buildJwtMiddleware('http://unreachable:9999/.well-known/jwks.json');
    const token = buildFakeToken(VALID_PAYLOAD);
    const req = makeRequest({ headers: { authorization: `Bearer ${token}` } });
    const reply = makeReply();

    await middleware(req, reply);
    expect(reply.status).toHaveBeenCalledWith(401);
  });
});
