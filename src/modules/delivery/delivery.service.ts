// src/modules/delivery/delivery.service.ts

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

export class DeliveryService {
  private readonly SUPABASE_TIMEOUT_MS = 5000; // 5 seconds timeout

  constructor(private supabase: SupabaseClient) {}

  /**
   * Filtre une campagne en fonction du profil utilisateur
   */
  private matchesUserProfile(campaign: any, userProfile: UserProfile): boolean {
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
  async getCarouselAds(userProfile: UserProfile = {}): Promise<CarouselAd[]> {
    try {
      // Query with timeout
      const queryPromise = this.supabase
        .from('ads_campaigns')
        .select('*')
        .eq('status', 'active')
        .eq('destination', 'carousel');

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Supabase timeout')), this.SUPABASE_TIMEOUT_MS)
      );

      const { data: campaigns, error } = await Promise.race([
        queryPromise,
        timeoutPromise,
      ]) as any;

      if (error) {
        throw error;
      }

      if (!campaigns || campaigns.length === 0) {
        return [];
      }

      // Filter by user profile
      const filteredCampaigns = (campaigns as any[]).filter((campaign: any) =>
        this.matchesUserProfile(campaign, userProfile)
      );

      // Map to CarouselAd interface
      const ads: CarouselAd[] = filteredCampaigns.map((campaign, index) => ({
        id: campaign.id,
        campaignId: campaign.id,
        title: campaign.title,
        mediaUrl: campaign.media_url || '',
        clickUrl: campaign.click_url || '',
        position: index,
        description: campaign.description,
      }));

      return ads;
    } catch (error) {
      throw new Error(`Failed to fetch carousel ads: ${(error as Error).message}`);
    }
  }

  /**
   * Récupère les annonces pour les shorts
   */
  async getShortsAds(userProfile: UserProfile = {}): Promise<ShortsAd[]> {
    try {
      // Query with timeout
      const queryPromise = this.supabase
        .from('ads_campaigns')
        .select('*')
        .eq('status', 'active')
        .eq('destination', 'shorts');

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Supabase timeout')), this.SUPABASE_TIMEOUT_MS)
      );

      const { data: campaigns, error } = await Promise.race([
        queryPromise,
        timeoutPromise,
      ]) as any;

      if (error) {
        throw error;
      }

      if (!campaigns || campaigns.length === 0) {
        return [];
      }

      // Filter by user profile
      const filteredCampaigns = (campaigns as any[]).filter((campaign: any) =>
        this.matchesUserProfile(campaign, userProfile)
      );

      // Map to ShortsAd interface
      const ads: ShortsAd[] = filteredCampaigns.map((campaign) => ({
        id: campaign.id,
        title: campaign.title,
        video: campaign.media_url || '',
        thumbnail:
          campaign.thumbnail_url ||
          `https://via.placeholder.com/300x200?text=${encodeURIComponent(campaign.title)}`,
        description: campaign.description,
      }));

      return ads;
    } catch (error) {
      throw new Error(`Failed to fetch shorts ads: ${(error as Error).message}`);
    }
  }
}