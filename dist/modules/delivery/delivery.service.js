"use strict";
// src/modules/delivery/delivery.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryService = void 0;
class DeliveryService {
    constructor(supabase) {
        this.supabase = supabase;
        this.SUPABASE_TIMEOUT_MS = 5000; // 5 seconds timeout
    }
    applyLimit(items, limit) {
        if (typeof limit !== 'number' || !Number.isFinite(limit) || limit <= 0) {
            return items;
        }
        return items.slice(0, limit);
    }
    normalizeGender(value) {
        if (!value)
            return undefined;
        const normalized = String(value).trim().toLowerCase();
        const genderMap = {
            homme: 'men',
            femme: 'women',
            male: 'men',
            female: 'women',
            men: 'men',
            women: 'women',
        };
        return genderMap[normalized] || normalized;
    }
    normalizeUserType(value) {
        if (!value)
            return undefined;
        const normalized = String(value).trim().toLowerCase();
        return normalized || undefined;
    }
    calculateAge(dateNaissance) {
        if (!dateNaissance)
            return undefined;
        const birthDate = new Date(dateNaissance);
        if (Number.isNaN(birthDate.getTime())) {
            return undefined;
        }
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDelta = today.getMonth() - birthDate.getMonth();
        if (monthDelta < 0 ||
            (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 0 || age > 120) {
            return undefined;
        }
        return age;
    }
    resolveNumericValue(value) {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }
        if (typeof value === 'string' && value.trim() !== '') {
            const parsed = Number(value);
            if (Number.isFinite(parsed)) {
                return parsed;
            }
        }
        return undefined;
    }
    matchesAgeTargeting(campaign, userProfile) {
        const userAge = this.resolveNumericValue(userProfile.age);
        const minAge = this.resolveNumericValue(campaign.min_age);
        const maxAge = this.resolveNumericValue(campaign.max_age);
        const targetAge = this.resolveNumericValue(campaign.target_age);
        const ageTolerance = this.resolveNumericValue(campaign.age_tolerance);
        const hasRangeTargeting = minAge !== undefined || maxAge !== undefined;
        const hasToleranceTargeting = targetAge !== undefined && ageTolerance !== undefined;
        if (!hasRangeTargeting && !hasToleranceTargeting) {
            return true;
        }
        if (userAge === undefined) {
            const targetingDescription = hasRangeTargeting
                ? `min_age=${minAge ?? '-'}, max_age=${maxAge ?? '-'}`
                : `target_age=${targetAge}, age_tolerance=${ageTolerance}`;
            console.log(`[matchesUserProfile] Ad ${campaign.id} filtered: missing user age for ${targetingDescription}`);
            return false;
        }
        if (hasRangeTargeting) {
            if (minAge !== undefined && userAge < minAge) {
                console.log(`[matchesUserProfile] Ad ${campaign.id} filtered: age below minimum (min_age=${minAge}, user_age=${userAge})`);
                return false;
            }
            if (maxAge !== undefined && userAge > maxAge) {
                console.log(`[matchesUserProfile] Ad ${campaign.id} filtered: age above maximum (max_age=${maxAge}, user_age=${userAge})`);
                return false;
            }
            return true;
        }
        const toleratedMinAge = targetAge - ageTolerance;
        const toleratedMaxAge = targetAge + ageTolerance;
        if (userAge < toleratedMinAge || userAge > toleratedMaxAge) {
            console.log(`[matchesUserProfile] Ad ${campaign.id} filtered: target age mismatch (target_age=${targetAge}, age_tolerance=${ageTolerance}, user_age=${userAge})`);
            return false;
        }
        return true;
    }
    sanitizeUserProfile(userProfile) {
        return Object.fromEntries(Object.entries(userProfile).filter(([, value]) => value !== undefined && value !== null && value !== ''));
    }
    async enrichUserProfile(userProfile) {
        if (!userProfile.user_id) {
            return this.sanitizeUserProfile(userProfile);
        }
        const enrichedProfile = { ...userProfile };
        try {
            const { data: profileData, error: profileError } = await this.supabase
                .from('profiles')
                .select('profile_type, genre, date_naissance')
                .eq('id', userProfile.user_id)
                .maybeSingle();
            if (profileError) {
                console.warn(`[enrichUserProfile] Failed to fetch profile ${userProfile.user_id}: ${profileError.message}`);
                return this.sanitizeUserProfile(enrichedProfile);
            }
            if (!enrichedProfile.gender) {
                enrichedProfile.gender = this.normalizeGender(profileData?.genre);
            }
            if (typeof enrichedProfile.age !== 'number') {
                enrichedProfile.age = this.calculateAge(profileData?.date_naissance);
            }
            if (!enrichedProfile.user_type && profileData?.profile_type === 'utilisateur') {
                const { data: userData, error: userError } = await this.supabase
                    .from('utilisateurs')
                    .select('user_type')
                    .eq('id', userProfile.user_id)
                    .maybeSingle();
                if (userError) {
                    console.warn(`[enrichUserProfile] Failed to fetch user_type ${userProfile.user_id}: ${userError.message}`);
                    return this.sanitizeUserProfile(enrichedProfile);
                }
                enrichedProfile.user_type = this.normalizeUserType(userData?.user_type);
            }
        }
        catch (error) {
            console.warn(`[enrichUserProfile] Unexpected enrichment error for ${userProfile.user_id}: ${error.message}`);
        }
        return this.sanitizeUserProfile(enrichedProfile);
    }
    async getAdViewsCount(adId) {
        try {
            const { count, error } = await this.supabase
                .from('ads_views')
                .select('id', { count: 'exact', head: true })
                .eq('ad_id', adId);
            if (error) {
                console.warn(`Failed to fetch ad views count for ${adId}: ${error.message}`);
                return 0;
            }
            return count || 0;
        }
        catch (error) {
            console.warn(`Failed to fetch ad views count for ${adId}: ${error.message}`);
            return 0;
        }
    }
    /**
     * Ignore les placeholders et les URLs non exploitables pour le carousel.
     */
    hasUsableCarouselImage(campaign) {
        const mediaUrl = String(campaign?.media_url || '').trim();
        const mediaType = String(campaign?.media_type || '').trim().toLowerCase();
        if (!mediaUrl) {
            return false;
        }
        if (mediaType && mediaType !== 'image') {
            return false;
        }
        if (mediaUrl.includes('via.placeholder.com')) {
            return false;
        }
        return true;
    }
    /**
     * Filtre une campagne en fonction du profil utilisateur
     */
    matchesUserProfile(campaign, userProfile) {
        // Check specific user targeting first
        if (campaign.target_users && Array.isArray(campaign.target_users) && campaign.target_users.length > 0) {
            if (!userProfile.user_id || !campaign.target_users.includes(userProfile.user_id)) {
                console.log(`[matchesUserProfile] Ad ${campaign.id} filtered: specific user targeting mismatch`);
                return false;
            }
        }
        // Gender matching
        if (campaign.target_gender && campaign.target_gender !== userProfile.gender) {
            console.log(`[matchesUserProfile] Ad ${campaign.id} filtered: gender mismatch (ad="${campaign.target_gender}", user="${userProfile.gender}")`);
            return false;
        }
        // User type matching (bachelier / etudiant / parent)
        if (campaign.target_user_type && campaign.target_user_type !== userProfile.user_type) {
            console.log(`[matchesUserProfile] Ad ${campaign.id} filtered: user_type mismatch (ad="${campaign.target_user_type}", user="${userProfile.user_type}")`);
            return false;
        }
        // Age matching
        if (!this.matchesAgeTargeting(campaign, userProfile)) {
            return false;
        }
        // Location matching
        if (campaign.location && campaign.location !== userProfile.location) {
            console.log(`[matchesUserProfile] Ad ${campaign.id} filtered: location mismatch`);
            return false;
        }
        console.log(`[matchesUserProfile] Ad ${campaign.id} PASSED filtering`);
        return true;
    }
    /**
     * Récupère les annonces pour le carousel (limité à 3 APRÈS filtrage)
     * ✅ CORRECT: FETCH → FILTER → LIMIT
     */
    async getCarouselAds(userProfile = {}) {
        try {
            const resolvedUserProfile = await this.enrichUserProfile(userProfile);
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
            // 2️⃣ FILTER: Filtrer selon le profil utilisateur et la qualité media
            console.log(`[getCarouselAds] Total ads fetched: ${campaigns.length}`);
            console.log(`[getCarouselAds] User profile for filtering:`, resolvedUserProfile);
            const filteredCampaigns = campaigns.filter((campaign) => this.matchesUserProfile(campaign, resolvedUserProfile) &&
                this.hasUsableCarouselImage(campaign));
            console.log(`[getCarouselAds] Ads after filtering: ${filteredCampaigns.length}`);
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
    async getShortsAds(userProfile = {}, limit = 3) {
        try {
            const resolvedUserProfile = await this.enrichUserProfile(userProfile);
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
            console.log(`[getShortsAds] Total ads fetched: ${campaigns.length}`);
            console.log(`[getShortsAds] User profile for filtering:`, resolvedUserProfile);
            const filteredCampaigns = campaigns.filter((campaign) => this.matchesUserProfile(campaign, resolvedUserProfile));
            console.log(`[getShortsAds] Ads after filtering: ${filteredCampaigns.length}, requested limit: ${limit}`);
            // 3️⃣ LIMIT: Limiter à 3 résultats APRÈS filtrage
            const limitedCampaigns = this.applyLimit(filteredCampaigns, limit);
            // Map to ShortsAd interface
            const ads = await Promise.all(limitedCampaigns.map(async (campaign) => ({
                id: campaign.id,
                title: campaign.title,
                video: campaign.media_url || '',
                thumbnail: campaign.thumbnail_url ||
                    `https://via.placeholder.com/300x200?text=${encodeURIComponent(campaign.title)}`,
                description: campaign.description,
                views_count: await this.getAdViewsCount(campaign.id),
            })));
            return ads;
        }
        catch (error) {
            throw new Error(`Failed to fetch shorts ads: ${error.message}`);
        }
    }
}
exports.DeliveryService = DeliveryService;
//# sourceMappingURL=delivery.service.js.map