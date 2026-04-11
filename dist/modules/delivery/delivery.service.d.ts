import { SupabaseClient } from '@supabase/supabase-js';
export interface CarouselAd {
    id: string;
    campaignId: string;
    title: string;
    mediaUrl: string;
    clickUrl: string;
    position?: number;
    description?: string;
}
export interface ShortsAd {
    id: string;
    video: string;
    thumbnail: string;
    title: string;
    description?: string;
    views_count?: number;
}
interface UserProfile {
    gender?: string;
    user_type?: string;
    user_id?: string;
    age?: number;
    location?: string;
}
export declare class DeliveryService {
    private supabase;
    private readonly SUPABASE_TIMEOUT_MS;
    constructor(supabase: SupabaseClient);
    private applyLimit;
    private normalizeGender;
    private normalizeUserType;
    private sanitizeUserProfile;
    private enrichUserProfile;
    private getAdViewsCount;
    /**
     * Ignore les placeholders et les URLs non exploitables pour le carousel.
     */
    private hasUsableCarouselImage;
    /**
     * Filtre une campagne en fonction du profil utilisateur
     */
    private matchesUserProfile;
    /**
     * Récupère les annonces pour le carousel (limité à 3 APRÈS filtrage)
     * ✅ CORRECT: FETCH → FILTER → LIMIT
     */
    getCarouselAds(userProfile?: UserProfile): Promise<CarouselAd[]>;
    /**
     * Récupère les annonces pour les shorts (limité à 3 APRÈS filtrage)
     * ✅ CORRECT: FETCH → FILTER → LIMIT
     */
    getShortsAds(userProfile?: UserProfile, limit?: number | null): Promise<ShortsAd[]>;
}
export {};
//# sourceMappingURL=delivery.service.d.ts.map