// src/app.ts

import Fastify, { FastifyInstance } from 'fastify'
import multipart from '@fastify/multipart'
import cors from '@fastify/cors'
import { createSupabaseClient } from './config/supabase'
import { registerRoutes } from './routes'

export const app: FastifyInstance = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
  bodyLimit: 50 * 1024 * 1024,
})

/**
 * Plugins
 */
app.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
})

app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
})

/**
 * Décorateurs
 */
app.decorate('supabase', createSupabaseClient())

/**
 * Logging réponse
 */
app.addHook('onResponse', (request, reply) => {
  const start = (request as any).startTime

  if (!start) return

  const duration =
    Number(process.hrtime.bigint() - start) / 1_000_000

  app.log.info({
    endpoint: `${request.method} ${request.url}`,
    status: reply.statusCode,
    duration_ms: duration.toFixed(2),
    ip: request.ip,
  })
})

/**
 * Health check - Timeout config pour Render
 */
const healthCheck = async () => {
  const result = {
    service: 'ads-service',
    status: 'ok',
    database: 'checking',
    time: new Date().toISOString(),
  }

  // Vérifier Supabase AVEC TIMEOUT LONG (10s pour Render)
  try {
    const dbPromise = app.supabase
      .from('ads_campaigns')
      .select('id')
      .limit(1)

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Database timeout')), 10000)
    )

    try {
      const response = await Promise.race([dbPromise, timeoutPromise])
      const { error } = response as any
      result.database = error ? 'error' : 'connected'
    } catch (raceError) {
      result.database = 'timeout'
    }
  } catch (err) {
    result.database = 'error'
  }

  // ✅ Retourner immédiatement, même si DB est en erreur
  return result
}

app.get('/health', healthCheck)
app.post('/health', healthCheck)

/**
 * Routes
 */
registerRoutes(app)

/**
 * Error handler
 */
app.setErrorHandler((error, request, reply) => {
  request.log.error(error)

  reply.status(error.statusCode ?? 500).send({
    success: false,
    error: error.message ?? 'Internal Server Error',
  })
})

/**
 * Types
 */
declare module 'fastify' {
  interface FastifyInstance {
    supabase: ReturnType<typeof createSupabaseClient>
  }
}