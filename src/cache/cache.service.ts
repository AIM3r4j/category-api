import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private readonly redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    });
  }

  async get(key: string): Promise<any> {
    const cachedData = await this.redisClient.get(key);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    return null;
  }

  async set(key: string, data: any, ttlSeconds: number): Promise<void> {
    await this.redisClient.setex(key, ttlSeconds, JSON.stringify(data));
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async flushall(): Promise<void> {
    await this.redisClient.flushall();
  }
}
