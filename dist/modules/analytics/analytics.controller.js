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
            const { adId, view_duration, user_id } = request.body;
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
        }
        catch (error) {
            const message = error.message;
            const statusCode = message.includes('not found') ? 404 : 500;
            reply.code(statusCode).send({ success: false, error: message });
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
    async getViews(request, reply) {
        try {
            const { adId } = request.params;
            const { page, limit } = request.query || {};
            const result = await this.analyticsService.getViews(adId, limit ? Number(limit) : 20, page ? Number(page) : 1);
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
        }
        catch (error) {
            reply.code(500).send({ success: false, error: error.message });
        }
    }
}
exports.AnalyticsController = AnalyticsController;
//# sourceMappingURL=analytics.controller.js.map