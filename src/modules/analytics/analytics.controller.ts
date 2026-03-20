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
      const { adId } = request.body as { adId: string };
      await this.analyticsService.recordView(adId);
      reply.send({ success: true });
    } catch (error) {
      reply.code(500).send({ success: false, error: (error as Error).message });
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
}