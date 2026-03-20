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
  private readonly USE_REDIS = false; // 🔥 TEMPORARY: Disable Redis for debugging

  constructor(
    private supabase: SupabaseClient,
    private redis: any // Simplified type to avoid Redis type issues
  ) {
    console.log('[DeliveryService] Initialized - USE_REDIS:', this.USE_REDIS);
  }

  private matchesUserProfile(campaign: any, userProfile: UserProfile, debug: boolean = false): boolean {
    // Check specific user targeting first
    if (campaign.target_users && campaign.target_users.length > 0) {
      if (!userProfile.user_id || !campaign.target_users.includes(userProfile.user_id)) {
        if (debug) console.log(`  ❌ Campaign "${campaign.title}" - specific user targeting mismatch`);
        return false;
      }
    }

    // Gender matching
    if (campaign.target_gender && campaign.target_gender !== userProfile.gender) {
      if (debug) console.log(`  ❌ Campaign "${campaign.title}" - gender="${campaign.target_gender}" but user gender="${userProfile.gender}"`);
      return false;
    }

    // User type matching (bachelier / etudiant / parent)
    if (campaign.target_user_type && campaign.target_user_type !== userProfile.user_type) {
      if (debug) console.log(`  ❌ Campaign "${campaign.title}" - userType="${campaign.target_user_type}" but user type="${userProfile.user_type}"`);
      return false;
    }

    // Age matching
    if (campaign.min_age && userProfile.age && userProfile.age < campaign.min_age) {
      if (debug) console.log(`  ❌ Campaign "${campaign.title}" - minAge=${campaign.min_age} but user age=${userProfile.age}`);
      return false;
    }

    // Location matching
    if (campaign.location && campaign.location !== userProfile.location) {
      if (debug) console.log(`  ❌ Campaign "${campaign.title}" - location="${campaign.location}" but user location="${userProfile.location}"`);
      return false;
    }

    if (debug) console.log(`  ✅ Campaign "${campaign.title}" - MATCHES all targeting criteria`);
    return true;
  }

  async getCarouselAds(userProfile: UserProfile = {}): Promise<CarouselAd[]> {
    console.log('[getCarouselAds] STEP 1 - Starting', { userProfile });
    const cacheKey = 'carousel_ads';

    // Try cache first if Redis is connected (DISABLED FOR DEBUGGING)
    if (this.USE_REDIS) {
      try {
        console.log('[getCarouselAds] STEP 2 - Checking Redis');
        if (this.redis && this.redis.isOpen) {
          // Add timeout for Redis operations
          const cacheTimeout = new Promise<string | null>((_, reject) =>
            setTimeout(() => reject(new Error('Redis timeout')), 2000)
          );
          const cachePromise = this.redis.get(cacheKey);
          
          const cached = await Promise.race([cachePromise, cacheTimeout]);
          if (cached) {
            console.log('[getCarouselAds] STEP 3 - Cache hit');
            const ads = JSON.parse(cached);
            return ads.filter((ad: any) => this.matchesUserProfile(ad, userProfile));
          }
        }
      } catch (error) {
        console.warn('[getCarouselAds] Redis cache read failed:', (error as Error).message);
      }
    } else {
      console.log('[getCarouselAds] STEP 2 - Skipping Redis (USE_REDIS=false)');
    }

    // Fetch campaigns from DB (SAFE - manual join)
    console.log('[getCarouselAds] STEP 3 - Fetching campaigns from Supabase');
    
    const { data: campaigns, error: campaignsError } = await this.supabase
      .from('ads_campaigns')
      .select('*')
      .eq('status', 'active')
      .eq('destination', 'carousel');

    if (campaignsError) {
      console.error('[getCarouselAds] Campaigns fetch error:', campaignsError);
      throw campaignsError;
    }

    console.log('[getCarouselAds] STEP 4 - Got campaigns, count:', (campaigns as any[])?.length);
    if (campaigns && (campaigns as any[]).length > 0) {
      console.log('[getCarouselAds] First campaign structure:', JSON.stringify((campaigns as any[])[0], null, 2));
    }

    // Manual JOIN and filter by user profile
    console.log(`[getCarouselAds] STEP 5 - Filtering ${(campaigns as any[])?.length} campaigns for user:`, 
      Object.keys(userProfile).length > 0 ? userProfile : '(no targeting applied)');
    
    const filteredCampaigns = (campaigns as any[]).filter((campaign: any) =>
      this.matchesUserProfile(campaign, userProfile, true)
    );

    console.log('[getCarouselAds] STEP 6 - Filtered campaigns, count:', filteredCampaigns.length);

    const ads: CarouselAd[] = filteredCampaigns.map(campaign => ({
      id: campaign.id,
      title: campaign.title,
      image: campaign.media_url || '',
      description: campaign.description,
    }));

    // Cache the result if Redis is available
    if (this.USE_REDIS) {
      try {
        console.log('[getCarouselAds] STEP 7 - Caching to Redis');
        if (this.redis && this.redis.isOpen) {
          const cacheTimeout = new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error('Redis timeout')), 2000)
          );
          const cachePromise = this.redis.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(ads));
          
          await Promise.race([cachePromise, cacheTimeout]);
        }
      } catch (error) {
        console.warn('[getCarouselAds] Redis cache write failed:', (error as Error).message);
      }
    }

    console.log('[getCarouselAds] STEP 8 - Complete, returning', ads.length, 'ads');
    return ads;
  }

  async getShortsAds(userProfile: UserProfile = {}): Promise<ShortsAd[]> {
    console.log('[getShortsAds] STEP 1 - Starting', { userProfile });
    const cacheKey = 'shorts_ads';

    // Try cache first if Redis is connected (DISABLED FOR DEBUGGING)
    if (this.USE_REDIS) {
      try {
        console.log('[getShortsAds] STEP 2 - Checking Redis');
        if (this.redis && this.redis.isOpen) {
          // Add timeout for Redis operations
          const cacheTimeout = new Promise<string | null>((_, reject) =>
            setTimeout(() => reject(new Error('Redis timeout')), 2000)
          );
          const cachePromise = this.redis.get(cacheKey);
          
          const cached = await Promise.race([cachePromise, cacheTimeout]);
          if (cached) {
            console.log('[getShortsAds] STEP 3 - Cache hit');
            const ads = JSON.parse(cached);
            return ads.filter((ad: any) => this.matchesUserProfile(ad, userProfile));
          }
        }
      } catch (error) {
        console.warn('[getShortsAds] Redis cache read failed:', (error as Error).message);
      }
    } else {
      console.log('[getShortsAds] STEP 2 - Skipping Redis (USE_REDIS=false)');
    }

    // Fetch campaigns from DB (SAFE - manual join)
    console.log('[getShortsAds] STEP 3 - Fetching campaigns from Supabase');
    
    const { data: campaigns, error: campaignsError } = await this.supabase
      .from('ads_campaigns')
      .select('*')
      .eq('status', 'active')
      .eq('destination', 'shorts');

    if (campaignsError) {
      console.error('[getShortsAds] Campaigns fetch error:', campaignsError);
      throw campaignsError;
    }

    console.log('[getShortsAds] STEP 4 - Got campaigns, count:', (campaigns as any[])?.length);
    if (campaigns && (campaigns as any[]).length > 0) {
      console.log('[getShortsAds] First campaign structure:', JSON.stringify((campaigns as any[])[0], null, 2));
    }

    // Manual JOIN and filter by user profile
    console.log(`[getShortsAds] STEP 5 - Filtering ${(campaigns as any[])?.length} campaigns for user:`, 
      Object.keys(userProfile).length > 0 ? userProfile : '(no targeting applied)');
    
    const filteredCampaigns = (campaigns as any[]).filter((campaign: any) =>
      this.matchesUserProfile(campaign, userProfile, true)
    );

    console.log('[getShortsAds] STEP 6 - Filtered campaigns, count:', filteredCampaigns.length);

    const ads: ShortsAd[] = filteredCampaigns.map(campaign => ({
      id: campaign.id,
      title: campaign.title,
      video: campaign.media_url || '',
      thumbnail: campaign.thumbnail_url || `https://via.placeholder.com/300x200?text=${encodeURIComponent(campaign.title)}`,
      description: campaign.description,
    }));

    // Cache the result if Redis is available
    if (this.USE_REDIS) {
      try {
        console.log('[getShortsAds] STEP 7 - Caching to Redis');
        if (this.redis && this.redis.isOpen) {
          const cacheTimeout = new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error('Redis timeout')), 2000)
          );
          const cachePromise = this.redis.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(ads));
          
          await Promise.race([cachePromise, cacheTimeout]);
        }
      } catch (error) {
        console.warn('[getShortsAds] Redis cache write failed:', (error as Error).message);
      }
    }

    console.log('[getShortsAds] STEP 8 - Complete, returning', ads.length, 'ads');
    return ads;
  }

  async invalidateCache(): Promise<void> {
    try {
      if (this.redis && this.redis.isOpen) {
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