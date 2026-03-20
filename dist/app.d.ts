import { FastifyInstance } from 'fastify';
import { createSupabaseClient } from './config/supabase';
export declare const app: FastifyInstance;
/**
 * Types
 */
declare module 'fastify' {
    interface FastifyInstance {
        supabase: ReturnType<typeof createSupabaseClient>;
    }
}
//# sourceMappingURL=app.d.ts.map