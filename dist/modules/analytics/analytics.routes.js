"use strict";
// src/modules/analytics/analytics.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRoutes = analyticsRoutes;
const analytics_controller_1 = require("./analytics.controller");
const analytics_service_1 = require("./analytics.service");
async function analyticsRoutes(app) {
    const analyticsService = new analytics_service_1.AnalyticsService(app.supabase);
    const analyticsController = new analytics_controller_1.AnalyticsController(analyticsService);
    // POST /ads/impression
    app.post('/impression', analyticsController.recordImpression.bind(analyticsController));
    // POST /ads/click
    app.post('/click', analyticsController.recordClick.bind(analyticsController));
    // POST /ads/view
    app.post('/view', analyticsController.recordView.bind(analyticsController));
    // GET /ads/stats/:campaignId
    app.get('/stats/:campaignId', analyticsController.getStats.bind(analyticsController));
}
//# sourceMappingURL=analytics.routes.js.map