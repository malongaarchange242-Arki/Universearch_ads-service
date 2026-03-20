// src/modules/delivery/delivery.service.ts

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

export class DeliveryService {
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    private supabase: SupabaseClient,
    private redis: any // Simplified type to avoid Redis type issues
  ) {}

  private matchesUserProfile(campaign: any, userProfile: UserProfile): boolean {
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

  async getCarouselAds(userProfile: UserProfile = {}): Promise<CarouselAd[]> {
    const cacheKey = 'carousel_ads';

    // Try cache first if Redis is connected
    try {
      if (this.redis.isOpen) {
        const cached = await this.redis.get(cacheKey);
        if (cached) {
          const ads = JSON.parse(cached);
          return ads.filter((ad: any) => this.matchesUserProfile(ad, userProfile));
        }
      }
    } catch (error) {
      console.warn('Redis cache read failed:', (error as Error).message);
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

    if (error) throw error;

    // Filter by user profile
    const filteredCampaigns = data.filter((campaign: any) =>
      this.matchesUserProfile(campaign, userProfile)
    );

    const ads: CarouselAd[] = filteredCampaigns.map(campaign => ({
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
    } catch (error) {
      console.warn('Redis cache write failed:', (error as Error).message);
    }

    return ads;
  }

  async getShortsAds(userProfile: UserProfile = {}): Promise<ShortsAd[]> {
    const cacheKey = 'shorts_ads';

    // Try cache first if Redis is connected
    try {
      if (this.redis.isOpen) {
        const cached = await this.redis.get(cacheKey);
        if (cached) {
          const ads = JSON.parse(cached);
          return ads.filter((ad: any) => this.matchesUserProfile(ad, userProfile));
        }
      }
    } catch (error) {
      console.warn('Redis cache read failed:', (error as Error).message);
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

    if (error) throw error;

    // Filter by user profile
    const filteredCampaigns = data.filter((campaign: any) =>
      this.matchesUserProfile(campaign, userProfile)
    );

    const ads: ShortsAd[] = filteredCampaigns.map(campaign => ({
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
    } catch (error) {
      console.warn('Redis cache write failed:', (error as Error).message);
    }

    return ads;
  }

  async invalidateCache(): Promise<void> {
    try {
      if (this.redis.isOpen) {
        await Promise.all([
          this.redis.del('carousel_ads'),
          this.redis.del('shorts_ads'),
        ]);
      }
    } catch (error) {
      console.warn('Redis cache invalidation failed:', (error as Error).message);
    }
  }
}