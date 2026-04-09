import { SupabaseClient } from '@supabase/supabase-js';
export interface AdStats {
    id: string;
    ad_id: string;
    impressions: number;
    clicks: number;
    views: number;
    created_at: string;
}
export interface AdViewPayload {
    view_duration?: number | null;
    user_id?: string | null;
}
export interface AdView {
    id: string;
    ad_id: string;
    user_id: string | null;
    view_duration: number | null;
    date_view: string;
}
export declare class AnalyticsService {
    private supabase;
    constructor(supabase: SupabaseClient);
    recordImpression(adId: string): Promise<void>;
    recordClick(adId: string): Promise<void>;
    recordView(adId: string, payload?: AdViewPayload): Promise<AdView>;
    private incrementStat;
    getStats(adId: string): Promise<AdStats[]>;
    getAggregatedStats(adId: string): Promise<{
        impressions: number;
        clicks: number;
        views: number;
    }>;
    getViews(adId: string, limit?: number, page?: number): Promise<{
        data: AdView[];
        total: number;
        page: number;
        limit: number;
    }>;
    private ensureCampaignExists;
}
//# sourceMappingURL=analytics.service.d.ts.map