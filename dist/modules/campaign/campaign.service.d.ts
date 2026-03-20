import { SupabaseClient } from '@supabase/supabase-js';
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
    location?: string;
    status?: 'active' | 'inactive';
    created_at?: string;
}
export declare class CampaignService {
    private supabase;
    constructor(supabase: SupabaseClient);
    createCampaign(campaign: Omit<Campaign, 'id' | 'created_at'>): Promise<Campaign>;
    getCampaigns(limit?: number, offset?: number): Promise<{
        campaigns: Campaign[];
        total: number;
    }>;
    getCampaignById(id: string): Promise<Campaign | null>;
    updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign>;
    deleteCampaign(id: string): Promise<void>;
}
//# sourceMappingURL=campaign.service.d.ts.map