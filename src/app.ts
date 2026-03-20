// src/app.ts

import Fastify, { FastifyInstance } from 'fastify'
import multipart from '@fastify/multipart'
import cors from '@fastify/cors'
import { createSupabaseClient } from './config/supabase'
import { createRedisClient } from './config/redis'
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
app.decorate('redis', createRedisClient())

/**
 * Connexion Redis non bloquante
 */
app.addHook('onReady', () => {
  setImmediate(async () => {
    try {
      await app.redis.connect()
      app.log.info('Redis connected')
    } catch (err) {
      app.log.warn('Redis unavailable, continuing without cache')
    }
  })
})

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
 * Health check simple
 */
const healthCheck = async () => {
  const result = {
    service: 'ads-service',
    status: 'ok',
    database: 'unknown',
    redis: 'unknown',
    time: new Date().toISOString(),
  }

  try {
    const { error } = await app.supabase
      .from('ads_campaigns')
      .select('id')
      .limit(1)

    result.database = error ? 'error' : 'connected'
  } catch {
    result.database = 'error'
  }

  try {
    if (app.redis?.isOpen) {
      await app.redis.ping()
      result.redis = 'connected'
    } else {
      result.redis = 'disconnected'
    }
  } catch {
    result.redis = 'error'
  }

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
    redis: ReturnType<typeof createRedisClient>
  }
}