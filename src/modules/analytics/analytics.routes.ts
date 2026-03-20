// src/modules/analytics/analytics.routes.ts

import { FastifyInstance } from 'fastify';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

export async function analyticsRoutes(app: FastifyInstance) {
  const analyticsService = new AnalyticsService(app.supabase);
  const analyticsController = new AnalyticsController(analyticsService);

  // POST /ads/impression
  app.post('/impression', analyticsController.recordImpression.bind(analyticsController));

  // POST /ads/click
  app.post('/click', analyticsController.recordClick.bind(analyticsController));

  // POST /ads/view
  app.post('/view', analyticsController.recordView.bind(analyticsController));

  // GET /ads/stats/:campaignId
  app.get('/stats/:campaignId', analyticsController.getStats.bind(analyticsController));
}