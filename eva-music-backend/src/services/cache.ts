import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient: Redis | null = null;
const memoryCache = new Map<string, { value: string; expiresAt: number }>();

if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
    redisClient.connect().catch(err => {
      console.warn('[Cache] Redis connection failed, using in-memory fallback:', err.message);
      redisClient = null;
    });
  } catch (err) {
    console.warn('[Cache] Could not initialize Redis client, using in-memory fallback');
  }
}

export async function getCache(key: string): Promise<string | null> {
  if (redisClient) {
    try {
      return await redisClient.get(key);
    } catch {
      // Fall through to memory
    }
  }

  const cached = memoryCache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return cached.value;
}

export async function setCache(key: string, value: string, ttlSeconds: number = 600): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.set(key, value, 'EX', ttlSeconds);
      return;
    } catch {
      // Fall through to memory
    }
  }

  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}
