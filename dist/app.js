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
 * Health check - Instantané (zéro dépendance)
 */
exports.app.get('/health', async () => {
    return {
        service: 'ads-service',
        status: 'ok',
        time: new Date().toISOString(),
    };
});
exports.app.post('/health', async () => {
    return {
        service: 'ads-service',
        status: 'ok',
        time: new Date().toISOString(),
    };
});
/**
 * Health check détaillé - Pour monitoring (avec DB)
 */
exports.app.get('/health/db', async () => {
    try {
        await Promise.race([
            exports.app.supabase.from('ads_campaigns').select('id').limit(1),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 5000)),
        ]);
        return { database: 'connected' };
    }
    catch {
        return { database: 'error' };
    }
});
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