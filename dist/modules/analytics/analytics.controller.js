"use strict";
// src/modules/analytics/analytics.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async recordImpression(request, reply) {
        try {
            const { adId } = request.body;
            await this.analyticsService.recordImpression(adId);
            reply.send({ success: true });
        }
        catch (error) {
            reply.code(500).send({ success: false, error: error.message });
        }
    }
    async recordClick(request, reply) {
        try {
            const { adId } = request.body;
            await this.analyticsService.recordClick(adId);
            reply.send({ success: true });
        }
        catch (error) {
            reply.code(500).send({ success: false, error: error.message });
        }
    }
    async recordView(request, reply) {
        try {
            const { adId } = request.body;
            await this.analyticsService.recordView(adId);
            reply.send({ success: true });
        }
        catch (error) {
            reply.code(500).send({ success: false, error: error.message });
        }
    }
    async getStats(request, reply) {
        try {
            const { campaignId } = request.params;
            const stats = await this.analyticsService.getStats(campaignId);
            const aggregated = await this.analyticsService.getAggregatedStats(campaignId);
            reply.send({ success: true, data: { stats, aggregated } });
        }
        catch (error) {
            reply.code(500).send({ success: false, error: error.message });
        }
    }
}
exports.AnalyticsController = AnalyticsController;
//# sourceMappingURL=analytics.controller.js.map