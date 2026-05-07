import { Injectable, Inject } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { REDIS_CLIENT } from './redis.provider';
import type { ISessionStore, SessionData } from './session-store.interface';

const SESSION_TTL = 60 * 60 * 24 * 30; // 30 days
const MFA_PENDING_TTL = 60 * 5; // 5 minutes

@Injectable()
export class RedisSessionStore implements ISessionStore {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async save(session: SessionData): Promise<void> {
    const key = `session:${session.sessionId}`;
    const tokenKey = `rt:${session.refreshToken}`;
    const familyKey = `family:${session.familyId}`;

    const data = JSON.stringify(session);
    const ttl = Math.floor((session.expiresAt.getTime() - Date.now()) / 1000);

    await this.redis
      .multi()
      .set(key, data, 'EX', ttl)
      .set(tokenKey, session.sessionId, 'EX', ttl)
      .sadd(familyKey, session.sessionId)
      .expire(familyKey, ttl)
      .exec();
  }

  async findByRefreshToken(refreshToken: string): Promise<SessionData | null> {
    const sessionId = await this.redis.get(`rt:${refreshToken}`);
    if (!sessionId) return null;

    const data = await this.redis.get(`session:${sessionId}`);
    if (!data) return null;

    return JSON.parse(data) as SessionData;
  }

  async findFamilyByToken(refreshToken: string): Promise<string | null> {
    const sessionId = await this.redis.get(`rt:${refreshToken}`);
    if (!sessionId) return null;

    const data = await this.redis.get(`session:${sessionId}`);
    if (!data) return null;

    const session = JSON.parse(data) as SessionData;
    return session.familyId;
  }

  async invalidate(sessionId: string): Promise<void> {
    const data = await this.redis.get(`session:${sessionId}`);
    if (!data) return;

    const session = JSON.parse(data) as SessionData;
    await this.redis
      .multi()
      .del(`session:${sessionId}`)
      .del(`rt:${session.refreshToken}`)
      .exec();
  }

  async invalidateFamily(familyId: string): Promise<void> {
    const sessionIds = await this.redis.smembers(`family:${familyId}`);
    if (sessionIds.length === 0) return;

    const pipeline = this.redis.multi();
    for (const sessionId of sessionIds) {
      const data = await this.redis.get(`session:${sessionId}`);
      if (data) {
        const session = JSON.parse(data) as SessionData;
        pipeline.del(`session:${sessionId}`);
        pipeline.del(`rt:${session.refreshToken}`);
      }
    }
    pipeline.del(`family:${familyId}`);
    await pipeline.exec();
  }

  async invalidateAllForUser(userId: string): Promise<void> {
    const pattern = `session:*`;
    const keys = await this.redis.keys(pattern);
    
    const pipeline = this.redis.multi();
    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data) {
        const session = JSON.parse(data) as SessionData;
        if (session.userId === userId) {
          pipeline.del(key);
          pipeline.del(`rt:${session.refreshToken}`);
        }
      }
    }
    await pipeline.exec();
  }

  async storePendingMfaSecret(userId: string, secret: string): Promise<void> {
    await this.redis.set(`mfa:pending:${userId}`, secret, 'EX', MFA_PENDING_TTL);
  }

  async getPendingMfaSecret(userId: string): Promise<string | null> {
    return this.redis.get(`mfa:pending:${userId}`);
  }

  async deletePendingMfaSecret(userId: string): Promise<void> {
    await this.redis.del(`mfa:pending:${userId}`);
  }
}
