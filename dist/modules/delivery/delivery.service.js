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
     * Récupère les annonces pour le carousel (limité à 3 APRÈS filtrage)
     * ✅ CORRECT: FETCH → FILTER → LIMIT
     */
    async getCarouselAds(userProfile = {}) {
        try {
            // 1️⃣ FETCH: Récupérer TOUTES les annonces
            const queryPromise = this.supabase
                .from('ads_campaigns')
                .select('*')
                .eq('status', 'active')
                .eq('destination', 'carousel')
                .order('created_at', { ascending: false }); // Plus récentes d'abord
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
            // 2️⃣ FILTER: Filtrer selon le profil utilisateur
            const filteredCampaigns = campaigns.filter((campaign) => this.matchesUserProfile(campaign, userProfile));
            // 3️⃣ LIMIT: Limiter à 3 résultats APRÈS filtrage
            const limitedCampaigns = filteredCampaigns.slice(0, 3);
            // Map to CarouselAd interface
            const ads = limitedCampaigns.map((campaign, index) => ({
                id: campaign.id,
                campaignId: campaign.id,
                title: campaign.title,
                mediaUrl: campaign.media_url || '',
                clickUrl: campaign.click_url || '',
                position: index,
                description: campaign.description,
            }));
            return ads;
        }
        catch (error) {
            throw new Error(`Failed to fetch carousel ads: ${error.message}`);
        }
    }
    /**
     * Récupère les annonces pour les shorts (limité à 3 APRÈS filtrage)
     * ✅ CORRECT: FETCH → FILTER → LIMIT
     */
    async getShortsAds(userProfile = {}) {
        try {
            // 1️⃣ FETCH: Récupérer TOUTES les annonces
            const queryPromise = this.supabase
                .from('ads_campaigns')
                .select('*')
                .eq('status', 'active')
                .eq('destination', 'shorts')
                .order('created_at', { ascending: false }); // Plus récentes d'abord
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
            // 2️⃣ FILTER: Filtrer selon le profil utilisateur
            const filteredCampaigns = campaigns.filter((campaign) => this.matchesUserProfile(campaign, userProfile));
            // 3️⃣ LIMIT: Limiter à 3 résultats APRÈS filtrage
            const limitedCampaigns = filteredCampaigns.slice(0, 3);
            // Map to ShortsAd interface
            const ads = limitedCampaigns.map((campaign) => ({
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