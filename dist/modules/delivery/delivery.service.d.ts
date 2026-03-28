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
    /**
     * Filtre une campagne en fonction du profil utilisateur
     */
    private matchesUserProfile;
    /**
     * Récupère les annonces pour le carousel
     */
    getCarouselAds(userProfile?: UserProfile): Promise<CarouselAd[]>;
    /**
     * Récupère les annonces pour les shorts
     */
    getShortsAds(userProfile?: UserProfile): Promise<ShortsAd[]>;
}
export {};
//# sourceMappingURL=delivery.service.d.ts.map