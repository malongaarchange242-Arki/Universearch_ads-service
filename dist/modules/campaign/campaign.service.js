"use strict";
// src/modules/campaign/campaign.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignService = void 0;
class CampaignService {
    constructor(supabase, redis // Optional Redis
    ) {
        this.supabase = supabase;
        this.redis = redis;
    }
    async createCampaign(campaign) {
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
    async getCampaigns(limit = 50, offset = 0) {
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
        if (error)
            throw error;
        return {
            campaigns: data,
            total: count || 0,
        };
    }
    async getCampaignById(id) {
        const { data, error } = await this.supabase
            .from('ads_campaigns')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null; // Not found
            throw error;
        }
        return data;
    }
    async updateCampaign(id, updates) {
        const { data, error } = await this.supabase
            .from('ads_campaigns')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        // Invalidate cache
        await this.invalidateAdCache();
        return data;
    }
    async deleteCampaign(id) {
        const { error } = await this.supabase
            .from('ads_campaigns')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        // Invalidate cache
        await this.invalidateAdCache();
    }
    async invalidateAdCache() {
        if (!this.redis?.isOpen)
            return;
        try {
            await Promise.all([
                this.redis.del('carousel_ads'),
                this.redis.del('shorts_ads'),
            ]);
        }
        catch (error) {
            console.warn('Redis cache invalidation failed:', error.message);
        }
    }
}
exports.CampaignService = CampaignService;
//# sourceMappingURL=campaign.service.js.map