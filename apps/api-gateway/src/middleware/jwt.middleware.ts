import { createPublicKey, createVerify } from 'crypto';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { JwtPayload } from '@vtt/shared-types';

interface JwkKey extends Record<string, unknown> {
  kty: string;
  n: string;
  e: string;
  use: string;
  alg: string;
  kid: string;
}

interface JwksResponse {
  keys: JwkKey[];
}

let cachedPublicKey: string | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function fetchPublicKey(jwksUrl: string): Promise<string> {
  if (cachedPublicKey && Date.now() < cacheExpiresAt) {
    return cachedPublicKey;
  }

  const res = await fetch(jwksUrl);
  if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`);

  const jwks = (await res.json()) as JwksResponse;
  const key = jwks.keys.find((k) => k.alg === 'RS256');
  if (!key) throw new Error('No RS256 key found in JWKS');

  const publicKey = createPublicKey({ key, format: 'jwk' });
  cachedPublicKey = publicKey.export({ type: 'spki', format: 'pem' }) as string;
  cacheExpiresAt = Date.now() + CACHE_TTL_MS;
  return cachedPublicKey;
}

function decodeJwt(token: string): { header: Record<string, string>; payload: JwtPayload; signature: string; raw: string } {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT format');
  const [headerB64, payloadB64, signature] = parts as [string, string, string];
  const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString()) as Record<string, string>;
  const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString()) as JwtPayload;
  return { header, payload, signature, raw: `${headerB64}.${payloadB64}` };
}

function verifySignature(raw: string, signature: string, publicKeyPem: string): boolean {
  const verify = createVerify('RSA-SHA256');
  verify.update(raw);
  return verify.verify(publicKeyPem, signature, 'base64url');
}

export function buildJwtMiddleware(jwksUrl: string) {
  return async function jwtMiddleware(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const authHeader = request.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      await reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Missing Bearer token' });
      return;
    }

    const token = authHeader.slice(7);

    try {
      const publicKey = await fetchPublicKey(jwksUrl);
      const { payload, raw, signature } = decodeJwt(token);

      if (!verifySignature(raw, signature, publicKey)) {
        await reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Invalid token signature' });
        return;
      }

      if (payload.exp < Math.floor(Date.now() / 1000)) {
        await reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Token expired' });
        return;
      }

      // Propagate identity to downstream services via headers
      request.headers['x-user-id'] = payload.sub;
      request.headers['x-user-roles'] = payload.roles.join(',');
      request.headers['x-session-id'] = payload.sessionId;
      request.headers['x-trace-id'] = (request.headers['x-trace-id'] as string) ?? crypto.randomUUID();
    } catch {
      await reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Invalid token' });
    }
  };
}
