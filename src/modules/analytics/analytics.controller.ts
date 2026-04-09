// src/modules/analytics/analytics.controller.ts

import { FastifyRequest, FastifyReply } from 'fastify';
import { AnalyticsService } from './analytics.service';

export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  async recordImpression(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { adId } = request.body as { adId: string };
      await this.analyticsService.recordImpression(adId);
      reply.send({ success: true });
    } catch (error) {
      reply.code(500).send({ success: false, error: (error as Error).message });
    }
  }

  async recordClick(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { adId } = request.body as { adId: string };
      await this.analyticsService.recordClick(adId);
      reply.send({ success: true });
    } catch (error) {
      reply.code(500).send({ success: false, error: (error as Error).message });
    }
  }

  async recordView(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { adId, view_duration, user_id } = request.body as {
        adId: string;
        view_duration?: number;
        user_id?: string;
      };
      const view = await this.analyticsService.recordView(adId, {
        view_duration,
        user_id,
      });
      const latestViews = await this.analyticsService.getViews(adId, 1, 1);
      reply.send({
        success: true,
        data: view,
        views_count: latestViews.total,
      });
    } catch (error) {
      const message = (error as Error).message;
      const statusCode = message.includes('not found') ? 404 : 500;
      reply.code(statusCode).send({ success: false, error: message });
    }
  }

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { campaignId } = request.params as { campaignId: string };
      const stats = await this.analyticsService.getStats(campaignId);
      const aggregated = await this.analyticsService.getAggregatedStats(campaignId);
      reply.send({ success: true, data: { stats, aggregated } });
    } catch (error) {
      reply.code(500).send({ success: false, error: (error as Error).message });
    }
  }

  async getViews(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { adId } = request.params as { adId: string };
      const { page, limit } = (request.query as { page?: string; limit?: string }) || {};
      const result = await this.analyticsService.getViews(
        adId,
        limit ? Number(limit) : 20,
        page ? Number(page) : 1
      );

      reply.send({
        success: true,
        data: result.data,
        views_count: result.total,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
        },
      });
    } catch (error) {
      reply.code(500).send({ success: false, error: (error as Error).message });
    }
  }
}
