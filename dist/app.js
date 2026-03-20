"use strict";
// src/app.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const fastify_1 = __importDefault(require("fastify"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const cors_1 = __importDefault(require("@fastify/cors"));
const supabase_1 = require("./config/supabase");
const redis_1 = require("./config/redis");
const routes_1 = require("./routes");
exports.app = (0, fastify_1.default)({
    logger: {
        level: process.env.LOG_LEVEL || 'info',
    },
    bodyLimit: 50 * 1024 * 1024,
});
/**
 * Plugins
 */
exports.app.register(multipart_1.default, {
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
});
exports.app.register(cors_1.default, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
});
/**
 * Décorateurs
 */
exports.app.decorate('supabase', (0, supabase_1.createSupabaseClient)());
exports.app.decorate('redis', (0, redis_1.createRedisClient)());
/**
 * Connexion Redis non bloquante
 */
exports.app.addHook('onReady', () => {
    setImmediate(async () => {
        try {
            await exports.app.redis.connect();
            exports.app.log.info('Redis connected');
        }
        catch (err) {
            exports.app.log.warn('Redis unavailable, continuing without cache');
        }
    });
});
/**
 * Hook unique pour tracking + rate limit
 */
// app.addHook('onRequest', async (request, reply) => {
//   const start = process.hrtime.bigint()
//   ;(request as any).startTime = start
//   const redis = app.redis
//   if (!redis?.isOpen) return
//   try {
//     const ip = request.ip
//     const key = `rate:${ip}`
//     const now = Date.now()
//     const windowMs = 60000
//     const max = 100
//     const requests = await redis.lRange(key, 0, -1)
//     const valid = requests
//       .map((t) => Number(t))
//       .filter((t) => now - t < windowMs)
//     if (valid.length >= max) {
//       return reply.code(429).send({
//         success: false,
//         error: 'Too many requests',
//       })
//     }
//     await redis.lPush(key, now.toString())
//     await redis.lTrim(key, 0, max)
//     await redis.pExpire(key, windowMs)
//   } catch (err) {
//     app.log.warn('Rate limit skipped')
//   }
// })
/**
 * Logging réponse
 */
exports.app.addHook('onResponse', (request, reply) => {
    const start = request.startTime;
    if (!start)
        return;
    const duration = Number(process.hrtime.bigint() - start) / 1000000;
    exports.app.log.info({
        endpoint: `${request.method} ${request.url}`,
        status: reply.statusCode,
        duration_ms: duration.toFixed(2),
        ip: request.ip,
    });
});
/**
 * Health check simple
 */
const healthCheck = async () => {
    const result = {
        service: 'ads-service',
        status: 'ok',
        database: 'unknown',
        redis: 'unknown',
        time: new Date().toISOString(),
    };
    try {
        const { error } = await exports.app.supabase
            .from('ads_campaigns')
            .select('id')
            .limit(1);
        result.database = error ? 'error' : 'connected';
    }
    catch {
        result.database = 'error';
    }
    try {
        if (exports.app.redis?.isOpen) {
            await exports.app.redis.ping();
            result.redis = 'connected';
        }
        else {
            result.redis = 'disconnected';
        }
    }
    catch {
        result.redis = 'error';
    }
    return result;
};
exports.app.get('/health', healthCheck);
exports.app.post('/health', healthCheck);
/**
 * Routes
 */
(0, routes_1.registerRoutes)(exports.app);
/**
 * Error handler
 */
exports.app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    reply.status(error.statusCode ?? 500).send({
        success: false,
        error: error.message ?? 'Internal Server Error',
    });
});
//# sourceMappingURL=app.js.map