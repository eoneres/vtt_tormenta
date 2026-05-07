import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import type Redis from 'ioredis';
import type { TableGameState } from '@vtt/shared-types';

const STATE_TTL_SECONDS = 60 * 60 * 8; // 8 hours (active session)
const KEY = (tableId: string) => `table:state:${tableId}`;

@Injectable()
export class TableStateCache {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async get(tableId: string): Promise<TableGameState | null> {
    const raw = await this.redis.get(KEY(tableId));
    if (!raw) return null;
    return JSON.parse(raw) as TableGameState;
  }

  async set(state: TableGameState): Promise<void> {
    await this.redis.setex(KEY(state.tableId), STATE_TTL_SECONDS, JSON.stringify(state));
  }

  async invalidate(tableId: string): Promise<void> {
    await this.redis.del(KEY(tableId));
  }

  async exists(tableId: string): Promise<boolean> {
    return (await this.redis.exists(KEY(tableId))) === 1;
  }
}
