import { useAuth } from "@/contexts/AuthContext";
import { authAxios } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

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

export const useMyCampaigns = () => {
  const { merchantId } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["myCampaigns"],
    queryFn: () => getMyCampaigns(merchantId),
    enabled: !!merchantId,
  });
  return { data, isLoading, error };
};

async function getMyCampaigns(
  merchantId: string | null
): Promise<Campaign[] | undefined> {
  if (!merchantId) {
    throw new Error("Merchant ID is required");
  }
  const response = await authAxios.get(`/my-campaigns/${merchantId}`);
  if (response.status === 200 && !response.data.campaigns) {
    return [];
  }
  return response.data.campaigns;
}

export const useShopCampaigns = (shopId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["shopCampaigns", shopId],
    queryFn: () => getShopCampaigns(shopId),
    enabled: !!shopId,
  });
  return { data, isLoading, error };
};

async function getShopCampaigns(
  shopId: string
): Promise<Campaign[] | undefined> {
  const response = await authAxios.get(`/shops/campaigns/${shopId}`);
  if (response.status === 200 && !response.data.campaigns) {
    return [];
  }
  return response.data.campaigns;
}

export const useUserCampaignsEntryByShopID = (shopId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["userCampaignsEntryByShopID", shopId],
    queryFn: () => getUserCampaignsEntryByShopID(shopId),
    enabled: !!shopId,
  });
  return { data, isLoading, error };
};

async function getUserCampaignsEntryByShopID(
  shopId: string
): Promise<Campaign[] | undefined> {
  const response = await authAxios.get(`/shops/campaigns/entries/${shopId}`);
  if (response.status === 200 && !response.data.campaigns) {
    return [];
  }
  return response.data.campaigns;
}
