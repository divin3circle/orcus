export interface Campaign {
  id: string;
  shop_id: string;
  name: string;
  token_id: string;
  description: string;
  target_tokens: number;
  distributed: number;
  icon: string;
  banner_image_url: string;
  ended: number; // 0 = active, 1 = ended
  created_at: string;
  updated_at: string;
}

export interface CampaignFilters {
  shop_id?: string;
  ended?: number;
  search?: string;
}

export interface CampaignStats {
  total_campaigns: number;
  active_campaigns: number;
  ended_campaigns: number;
  total_target_tokens: number;
  total_distributed_tokens: number;
  completion_rate: number;
}
