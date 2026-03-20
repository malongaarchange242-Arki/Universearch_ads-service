import { SupabaseClient } from '@supabase/supabase-js';
export interface CarouselAd {
    id: string;
    title: string;
    image: string;
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
    private redis;
    private readonly CACHE_TTL;
    constructor(supabase: SupabaseClient, redis: any);
    private matchesUserProfile;
    getCarouselAds(userProfile?: UserProfile): Promise<CarouselAd[]>;
    getShortsAds(userProfile?: UserProfile): Promise<ShortsAd[]>;
    invalidateCache(): Promise<void>;
}
export {};
//# sourceMappingURL=delivery.service.d.ts.map