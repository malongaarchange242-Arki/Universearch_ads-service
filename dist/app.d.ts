import { FastifyInstance } from 'fastify';
import { createSupabaseClient } from './config/supabase';
import { createRedisClient } from './config/redis';
export declare const app: FastifyInstance;
/**
 * Types
 */
declare module 'fastify' {
    interface FastifyInstance {
        supabase: ReturnType<typeof createSupabaseClient>;
        redis: ReturnType<typeof createRedisClient>;
    }
}
//# sourceMappingURL=app.d.ts.map