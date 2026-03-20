"use strict";
// src/modules/delivery/delivery.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryService = void 0;
class DeliveryService {
    constructor(supabase) {
        this.supabase = supabase;
        this.SUPABASE_TIMEOUT_MS = 5000; // 5 seconds timeout
    }
    /**
     * Filtre une campagne en fonction du profil utilisateur
     */
    matchesUserProfile(campaign, userProfile) {
        // Check specific user targeting first
        if (campaign.target_users && Array.isArray(campaign.target_users) && campaign.target_users.length > 0) {
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
        if (campaign.location && campaign.location !== userProfile.location) {
            return false;
        }
        return true;
    }
    /**
     * Récupère les annonces pour le carousel
     */
    async getCarouselAds(userProfile = {}) {
        try {
            // Query with timeout
            const queryPromise = this.supabase
                .from('ads_campaigns')
                .select('*')
                .eq('status', 'active')
                .eq('destination', 'carousel');
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), this.SUPABASE_TIMEOUT_MS));
            const { data: campaigns, error } = await Promise.race([
                queryPromise,
                timeoutPromise,
            ]);
            if (error) {
                throw error;
            }
            if (!campaigns || campaigns.length === 0) {
                return [];
            }
            // Filter by user profile
            const filteredCampaigns = campaigns.filter((campaign) => this.matchesUserProfile(campaign, userProfile));
            // Map to CarouselAd interface
            const ads = filteredCampaigns.map((campaign) => ({
                id: campaign.id,
                title: campaign.title,
                image: campaign.media_url || '',
                description: campaign.description,
            }));
            return ads;
        }
        catch (error) {
            throw new Error(`Failed to fetch carousel ads: ${error.message}`);
        }
    }
    /**
     * Récupère les annonces pour les shorts
     */
    async getShortsAds(userProfile = {}) {
        try {
            // Query with timeout
            const queryPromise = this.supabase
                .from('ads_campaigns')
                .select('*')
                .eq('status', 'active')
                .eq('destination', 'shorts');
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), this.SUPABASE_TIMEOUT_MS));
            const { data: campaigns, error } = await Promise.race([
                queryPromise,
                timeoutPromise,
            ]);
            if (error) {
                throw error;
            }
            if (!campaigns || campaigns.length === 0) {
                return [];
            }
            // Filter by user profile
            const filteredCampaigns = campaigns.filter((campaign) => this.matchesUserProfile(campaign, userProfile));
            // Map to ShortsAd interface
            const ads = filteredCampaigns.map((campaign) => ({
                id: campaign.id,
                title: campaign.title,
                video: campaign.media_url || '',
                thumbnail: campaign.thumbnail_url ||
                    `https://via.placeholder.com/300x200?text=${encodeURIComponent(campaign.title)}`,
                description: campaign.description,
            }));
            return ads;
        }
        catch (error) {
            throw new Error(`Failed to fetch shorts ads: ${error.message}`);
        }
    }
}
exports.DeliveryService = DeliveryService;
//# sourceMappingURL=delivery.service.js.map