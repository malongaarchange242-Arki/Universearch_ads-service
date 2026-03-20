"use strict";
// src/modules/analytics/analytics.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
class AnalyticsService {
    constructor(supabase) {
        this.supabase = supabase;
    }
    async recordImpression(adId) {
        await this.incrementStat(adId, 'impressions');
    }
    async recordClick(adId) {
        await this.incrementStat(adId, 'clicks');
    }
    async recordView(adId) {
        await this.incrementStat(adId, 'views');
    }
    async incrementStat(adId, statType) {
        // First, try to find existing stats for today
        const today = new Date().toISOString().split('T')[0];
        const { data: existingStats } = await this.supabase
            .from('ads_stats')
            .select('*')
            .eq('ad_id', adId)
            .gte('created_at', `${today}T00:00:00.000Z`)
            .lte('created_at', `${today}T23:59:59.999Z`)
            .single();
        if (existingStats) {
            // Update existing
            const { error } = await this.supabase
                .from('ads_stats')
                .update({
                [statType]: existingStats[statType] + 1,
            })
                .eq('id', existingStats.id);
            if (error)
                throw error;
        }
        else {
            // Create new
            const { error } = await this.supabase
                .from('ads_stats')
                .insert({
                ad_id: adId,
                [statType]: 1,
            });
            if (error)
                throw error;
        }
    }
    async getStats(adId) {
        const { data, error } = await this.supabase
            .from('ads_stats')
            .select('*')
            .eq('ad_id', adId)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data;
    }
    async getAggregatedStats(adId) {
        const { data, error } = await this.supabase
            .from('ads_stats')
            .select('impressions, clicks, views')
            .eq('ad_id', adId);
        if (error)
            throw error;
        return data.reduce((acc, stat) => ({
            impressions: acc.impressions + stat.impressions,
            clicks: acc.clicks + stat.clicks,
            views: acc.views + stat.views,
        }), { impressions: 0, clicks: 0, views: 0 });
    }
}
exports.AnalyticsService = AnalyticsService;
//# sourceMappingURL=analytics.service.js.map