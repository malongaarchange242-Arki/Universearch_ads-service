// src/modules/campaign/campaign.service.ts

import { SupabaseClient } from '@supabase/supabase-js';
import {
  broadcastCampaignNotifications,
  getTargetUsers,
  getInstitutionInfo,
} from './campaign.notifications';

export interface Campaign {
  id?: string;
  title: string;
  description?: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  destination?: 'carousel' | 'shorts';
  target_gender?: string;
  target_user_type?: string;
  target_users?: string[];
  min_age?: number;
  max_age?: number;
  target_age?: number;
  age_tolerance?: number;
  location?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  institution_id?: string;
  institution_type?: 'universite' | 'centre_formation';
  send_notifications?: boolean;
  notification_message?: string;
}

export class CampaignService {
  constructor(private supabase: SupabaseClient) {}

  async createCampaign(campaign: Omit<Campaign, 'id' | 'created_at'>): Promise<Campaign> {
    const { data, error } = await this.supabase
      .from('ads_campaigns')
      .insert(campaign)
      .select()
      .single();

    if (error) {
      throw error;
    }

    const createdCampaign = data as Campaign;

    // 📢 Envoyer les notifications (asynchrone, ne pas attendre)
    if (campaign.send_notifications) {
      try {
        void this.notifyCampaignLaunch(createdCampaign, campaign);
      } catch (err) {
        console.error('Error in campaign notification flow:', err);
        // Continue même si les notifications échouent
      }
    }

    return createdCampaign;
  }

  /**
   * Envoyer les notifications pour une campagne lancée
   */
  private async notifyCampaignLaunch(
    campaign: Campaign,
    campaignInput: Omit<Campaign, 'id' | 'created_at'>
  ): Promise<void> {
    try {
      // Déterminer les utilisateurs à notifier
      let targetUserIds: string[] = [];

      if (campaignInput.target_users && campaignInput.target_users.length > 0) {
        // Utilisateurs spécifiquement sélectionnés
        targetUserIds = campaignInput.target_users;
      } else if (campaign.institution_id) {
        // Followers de l'institution
        targetUserIds = await getTargetUsers(
          this.supabase,
          'followers',
          campaign.institution_id,
          {
            minAge: campaignInput.min_age,
            maxAge: campaignInput.max_age,
          }
        );
      } else {
        // Tous les utilisateurs (avec filtres d'âge si fournis)
        targetUserIds = await getTargetUsers(
          this.supabase,
          'all',
          undefined,
          {
            minAge: campaignInput.min_age,
            maxAge: campaignInput.max_age,
          }
        );
      }

      if (targetUserIds.length === 0) {
        console.warn('No target users for campaign notification');
        return;
      }

      // Récupérer infos de l'institution
      let institutionName = 'Nouvelle Campagne';
      if (campaign.institution_id && campaign.institution_type) {
        const institutionInfo = await getInstitutionInfo(
          this.supabase,
          campaign.institution_id,
          campaign.institution_type
        );
        if (institutionInfo) {
          institutionName = institutionInfo.sigle || institutionInfo.name;
        }
      }

      // Envoyer les notifications
      const result = await broadcastCampaignNotifications(
        targetUserIds,
        campaign.id || '',
        institutionName,
        campaign.title,
        campaign.description || '',
        campaign.media_url,
        campaignInput.notification_message
      );

      console.log(`Campaign notifications sent: ${result.deliveredCount}/${targetUserIds.length}`);
    } catch (err) {
      console.error('Error notifying campaign launch:', err);
    }
  }

  async getCampaigns(limit: number = 50, offset: number = 0): Promise<{ campaigns: Campaign[]; total: number }> {
    // Get total count
    const { count } = await this.supabase
      .from('ads_campaigns')
      .select('*', { count: 'exact', head: true });

    // Get paginated results
    const { data, error } = await this.supabase
      .from('ads_campaigns')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      campaigns: data,
      total: count || 0,
    };
  }

  async getCampaignById(id: string): Promise<Campaign | null> {
    const { data, error } = await this.supabase
      .from('ads_campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const { data, error } = await this.supabase
      .from('ads_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async deleteCampaign(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('ads_campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Envoyer les notifications manuellement pour une campagne existante
   * Utile pour tester ou renvoyer les notifications
   */
  async sendCampaignNotifications(campaignId: string): Promise<{ success: boolean; deliveredCount: number; message: string }> {
    try {
      // Récupérer la campagne
      const campaign = await this.getCampaignById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      console.log(`📢 [DEBUG] Envoi des notifications pour campagne: ${campaign.title}`);

      // Récupérer les utilisateurs à notifier
      const targetUserIds = await getTargetUsers(
        this.supabase,
        'all' // Par défaut envoyer à tous
      );

      if (targetUserIds.length === 0) {
        return {
          success: true,
          deliveredCount: 0,
          message: 'No users to notify'
        };
      }

      console.log(`📢 [DEBUG] Ciblage: ${targetUserIds.length} utilisateurs`);

      // Récupérer le nom de l'institution
      let institutionName = 'Nouvelle Campagne';
      if (campaign.institution_id && campaign.institution_type) {
        const institutionInfo = await getInstitutionInfo(
          this.supabase,
          campaign.institution_id,
          campaign.institution_type
        );
        if (institutionInfo) {
          institutionName = institutionInfo.sigle || institutionInfo.name;
        }
      }

      // Envoyer les notifications
      const result = await broadcastCampaignNotifications(
        targetUserIds,
        campaign.id || '',
        institutionName,
        campaign.title,
        campaign.description || '',
        campaign.media_url,
        campaign.notification_message
      );

      console.log(`✅ [DEBUG] Notifications envoyées: ${result.deliveredCount}/${targetUserIds.length}`);

      // Mettre à jour le flag pour indiquer que les notifications ont été envoyées
      await this.supabase
        .from('ads_campaigns')
        .update({ send_notifications: true, updated_at: new Date().toISOString() })
        .eq('id', campaignId);

      return {
        success: true,
        deliveredCount: result.deliveredCount,
        message: `Notifications envoyées à ${result.deliveredCount}/${targetUserIds.length} utilisateurs`
      };
    } catch (err) {
      console.error('Error sending campaign notifications:', err);
      throw err;
    }
  }
}
