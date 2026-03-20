// src/modules/analytics/analytics.service.ts

import { SupabaseClient } from '@supabase/supabase-js';

export interface AdStats {
  id: string;
  ad_id: string;
  impressions: number;
  clicks: number;
  views: number;
  created_at: string;
}

export class AnalyticsService {
  constructor(private supabase: SupabaseClient) {}

  async recordImpression(adId: string): Promise<void> {
    await this.incrementStat(adId, 'impressions');
  }

  async recordClick(adId: string): Promise<void> {
    await this.incrementStat(adId, 'clicks');
  }

  async recordView(adId: string): Promise<void> {
    await this.incrementStat(adId, 'views');
  }

  private async incrementStat(adId: string, statType: 'impressions' | 'clicks' | 'views'): Promise<void> {
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

      if (error) throw error;
    } else {
      // Create new
      const { error } = await this.supabase
        .from('ads_stats')
        .insert({
          ad_id: adId,
          [statType]: 1,
        });

      if (error) throw error;
    }
  }

  async getStats(adId: string): Promise<AdStats[]> {
    const { data, error } = await this.supabase
      .from('ads_stats')
      .select('*')
      .eq('ad_id', adId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getAggregatedStats(adId: string): Promise<{ impressions: number; clicks: number; views: number }> {
    const { data, error } = await this.supabase
      .from('ads_stats')
      .select('impressions, clicks, views')
      .eq('ad_id', adId);

    if (error) throw error;

    return data.reduce(
      (acc, stat) => ({
        impressions: acc.impressions + stat.impressions,
        clicks: acc.clicks + stat.clicks,
        views: acc.views + stat.views,
      }),
      { impressions: 0, clicks: 0, views: 0 }
    );
  }
}