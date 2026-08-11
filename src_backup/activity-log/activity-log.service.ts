import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class ActivityLogService {
  constructor(@Inject('REDIS_CLIENT') private redis: Redis) {}

  async logActivity(userId: string, action: string) {
    const key = `activity:${userId}`;
    const entry = JSON.stringify({
      action,
      timestamp: new Date().toISOString(),
    });

    await this.redis.lpush(key, entry);
    await this.redis.ltrim(key, 0, 4);
  }

  async getRecentActivity(userId: string) {
    const key = `activity:${userId}`;
    const entries = await this.redis.lrange(key, 0, -1);
    return entries.map((e) => JSON.parse(e));
  }
}
