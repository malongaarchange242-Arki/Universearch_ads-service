// src/modules/campaign/campaign.service.ts

import { SupabaseClient } from '@supabase/supabase-js';

export interface Campaign {
  id?: string;
  title: string;
  description?: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  destination?: 'carousel' | 'shorts';
  target_gender?: string;
  target_user_type?: string;
  target_users?: string[];
  min_age?: number;
  location?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
}

export class CampaignService {
  constructor(
    private supabase: SupabaseClient,
    private redis?: any // Optional Redis
  ) {}

  async createCampaign(campaign: Omit<Campaign, 'id' | 'created_at'>): Promise<Campaign> {
    console.log('Inserting campaign into ads_campaigns:', campaign);
    const { data, error } = await this.supabase
      .from('ads_campaigns')
      .insert(campaign)
      .select()
      .single();

    if (error) {
      console.error('Error inserting campaign:', error);
      throw error;
    }

    console.log('Inserted campaign:', data);

    // Invalidate cache
    await this.invalidateAdCache();

    return data;
  }

  async getCampaigns(limit: number = 50, offset: number = 0): Promise<{ campaigns: Campaign[]; total: number }> {
    // Get total count
    const { count } = await this.supabase
      .from('ads_campaigns')
      .select('*', { count: 'exact', head: true });

    // Get paginated results
    const { data, error } = await this.supabase
      .from('ads_campaigns')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      campaigns: data,
      total: count || 0,
    };
  }

  async getCampaignById(id: string): Promise<Campaign | null> {
    const { data, error } = await this.supabase
      .from('ads_campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const { data, error } = await this.supabase
      .from('ads_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    await this.invalidateAdCache();

    return data;
  }

  async deleteCampaign(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('ads_campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Invalidate cache
    await this.invalidateAdCache();
  }

  private async invalidateAdCache(): Promise<void> {
    if (!this.redis?.isOpen) return

    try {
      await Promise.all([
        this.redis.del('carousel_ads'),
        this.redis.del('shorts_ads'),
      ]);
    } catch (error) {
      console.warn('Redis cache invalidation failed:', (error as Error).message);
    }
  }
}