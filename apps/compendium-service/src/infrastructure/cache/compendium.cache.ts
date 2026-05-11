import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { GameSystem } from '../../domain/entry/entry.entity';
import type { EntryDto } from '../../application/commands/compendium.use-cases';

const ENTRY_TTL = 300; // 5 min
const SYSTEM_TAG_PREFIX = 'sys:';
const ENTRY_PREFIX = 'entry:';

@Injectable()
export class CompendiumCacheService {
  private readonly logger = new Logger(CompendiumCacheService.name);

  constructor(@InjectRedis() private readonly redis: Redis) {}

  async getEntry(id: string): Promise<EntryDto | null> {
    try {
      const raw = await this.redis.get(`${ENTRY_PREFIX}${id}`);
      return raw ? (JSON.parse(raw) as EntryDto) : null;
    } catch (err) {
      this.logger.warn(`Cache miss/error for entry ${id}`, err);
      return null;
    }
  }

  async setEntry(id: string, dto: EntryDto): Promise<void> {
    try {
      await this.redis.setex(`${ENTRY_PREFIX}${id}`, ENTRY_TTL, JSON.stringify(dto));
    } catch (err) {
      this.logger.warn(`Failed to cache entry ${id}`, err);
    }
  }

  async invalidateEntry(id: string): Promise<void> {
    try {
      await this.redis.del(`${ENTRY_PREFIX}${id}`);
    } catch (err) {
      this.logger.warn(`Failed to invalidate entry ${id}`, err);
    }
  }

  async invalidateSystem(system: GameSystem): Promise<void> {
    try {
      const pattern = `${SYSTEM_TAG_PREFIX}${system}:*`;
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (err) {
      this.logger.warn(`Failed to invalidate system cache for ${system}`, err);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redis.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttl: number): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch {
      // cache is best-effort
    }
  }
}
