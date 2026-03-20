"use strict";
// src/modules/delivery/delivery.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryService = void 0;
class DeliveryService {
    constructor(supabase, redis // Simplified type to avoid Redis type issues
    ) {
        this.supabase = supabase;
        this.redis = redis;
        this.CACHE_TTL = 300; // 5 minutes
    }
    matchesUserProfile(campaign, userProfile) {
        // Check specific user targeting first
        if (campaign.target_users && campaign.target_users.length > 0) {
            if (!userProfile.user_id || !campaign.target_users.includes(userProfile.user_id)) {
                return false;
            }
        }
        // Gender matching
        if (campaign.target_gender && campaign.target_gender !== userProfile.gender) {
            return false;
        }
        // User type matching (bachelier / etudiant / parent)
        if (campaign.target_user_type && campaign.target_user_type !== userProfile.user_type) {
            return false;
        }
        // Age matching
        if (campaign.min_age && userProfile.age && userProfile.age < campaign.min_age) {
            return false;
        }
        // Location matching
        if (campaign.target_location && campaign.target_location !== userProfile.location) {
            return false;
        }
        return true;
    }
    async getCarouselAds(userProfile = {}) {
        const cacheKey = 'carousel_ads';
        // Try cache first if Redis is connected
        try {
            if (this.redis.isOpen) {
                const cached = await this.redis.get(cacheKey);
                if (cached) {
                    const ads = JSON.parse(cached);
                    return ads.filter((ad) => this.matchesUserProfile(ad, userProfile));
                }
            }
        }
        catch (error) {
            console.warn('Redis cache read failed:', error.message);
        }
        // Fetch from DB with targeting fields
        const { data, error } = await this.supabase
            .from('campaigns')
            .select(`
        id,
        name,
        description,
        target_gender,
        target_user_type,
        target_users,
        min_age,
        target_location,
        is_active,
        medias (
          id,
          filename,
          url,
          type,
          created_at
        )
      `)
            .eq('is_active', true)
            .eq('type', 'carousel');
        if (error)
            throw error;
        // Filter by user profile
        const filteredCampaigns = data.filter((campaign) => this.matchesUserProfile(campaign, userProfile));
        const ads = filteredCampaigns.map(campaign => ({
            id: campaign.id,
            title: campaign.name,
            image: campaign.medias?.[0]?.url || '',
            description: campaign.description,
        }));
        // Cache the result if Redis is available
        try {
            if (this.redis.isOpen) {
                await this.redis.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(ads));
            }
        }
        catch (error) {
            console.warn('Redis cache write failed:', error.message);
        }
        return ads;
    }
    async getShortsAds(userProfile = {}) {
        const cacheKey = 'shorts_ads';
        // Try cache first if Redis is connected
        try {
            if (this.redis.isOpen) {
                const cached = await this.redis.get(cacheKey);
                if (cached) {
                    const ads = JSON.parse(cached);
                    return ads.filter((ad) => this.matchesUserProfile(ad, userProfile));
                }
            }
        }
        catch (error) {
            console.warn('Redis cache read failed:', error.message);
        }
        // Fetch from DB with targeting fields
        const { data, error } = await this.supabase
            .from('campaigns')
            .select(`
        id,
        name,
        description,
        target_gender,
        target_user_type,
        target_users,
        min_age,
        target_location,
        is_active,
        medias (
          id,
          filename,
          url,
          type,
          created_at
        )
      `)
            .eq('is_active', true)
            .eq('type', 'shorts');
        if (error)
            throw error;
        // Filter by user profile
        const filteredCampaigns = data.filter((campaign) => this.matchesUserProfile(campaign, userProfile));
        const ads = filteredCampaigns.map(campaign => ({
            id: campaign.id,
            title: campaign.name,
            video: campaign.medias?.[0]?.url || '',
            thumbnail: `https://via.placeholder.com/300x200?text=${encodeURIComponent(campaign.name)}`, // Placeholder
            description: campaign.description,
        }));
        // Cache the result if Redis is available
        try {
            if (this.redis.isOpen) {
                await this.redis.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(ads));
            }
        }
        catch (error) {
            console.warn('Redis cache write failed:', error.message);
        }
        return ads;
    }
    async invalidateCache() {
        try {
            if (this.redis.isOpen) {
                await Promise.all([
                    this.redis.del('carousel_ads'),
                    this.redis.del('shorts_ads'),
                ]);
            }
        }
        catch (error) {
            console.warn('Redis cache invalidation failed:', error.message);
        }
    }
}
exports.DeliveryService = DeliveryService;
//# sourceMappingURL=delivery.service.js.map