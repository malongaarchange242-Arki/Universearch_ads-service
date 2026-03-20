import { SupabaseClient } from '@supabase/supabase-js';
export interface AdStats {
    id: string;
    ad_id: string;
    impressions: number;
    clicks: number;
    views: number;
    created_at: string;
}
export declare class AnalyticsService {
    private supabase;
    constructor(supabase: SupabaseClient);
    recordImpression(adId: string): Promise<void>;
    recordClick(adId: string): Promise<void>;
    recordView(adId: string): Promise<void>;
    private incrementStat;
    getStats(adId: string): Promise<AdStats[]>;
    getAggregatedStats(adId: string): Promise<{
        impressions: number;
        clicks: number;
        views: number;
    }>;
}
//# sourceMappingURL=analytics.service.d.ts.map