"use strict";
// src/config/redis.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRedisClient = void 0;
const redis_1 = require("redis");
const createRedisClient = () => {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const client = (0, redis_1.createClient)({
        url: redisUrl,
    });
    client.on('error', (err) => {
        // Suppress Redis connection errors - service works without cache
    });
    // Don't connect immediately, let the app handle it
    return client;
};
exports.createRedisClient = createRedisClient;
//# sourceMappingURL=redis.js.map