// src/config/redis.ts

import { createClient } from 'redis';

export const createRedisClient = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  const client = createClient({
    url: redisUrl,
  });

  client.on('error', (err) => {
    // Suppress Redis connection errors - service works without cache
  });

  // Don't connect immediately, let the app handle it
  return client;
};