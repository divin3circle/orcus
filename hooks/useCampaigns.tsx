import { useAuth } from "@/contexts/AuthContext";
import { authAxios } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { BASE_URL } from "@/lib/utils";

export interface Campaign {
  id: string;
  shop_id: string;
  name: string;
  token_id: string;
  description: string;
  target: number;
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

export interface CreateCampaignRequest {
  name: string;
  token_id: string;
  description: string;
  target: number;
  distributed: number;
  ended: number;
  icon: string;
  banner_image_url: string;
}

export interface CreateCampaignResponse {
  response: {
    shop: {
      id: string;
      merchant_id: string;
      name: string;
      theme: string;
      payment_id: string;
      profile_image_url: string;
      campaigns: Campaign[];
    };
    transaction_response: {
      hash: string;
      nodeID: string;
      transactionID: string;
    };
  };
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

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      shopId,
      campaignData,
    }: {
      shopId: string;
      campaignData: CreateCampaignRequest;
    }) => createCampaign(shopId, campaignData),
    onSuccess: (data) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["myCampaigns"] });
      queryClient.invalidateQueries({ queryKey: ["shopCampaigns"] });
      queryClient.invalidateQueries({
        queryKey: ["userCampaignsEntryByShopID"],
      });

      toast.success("Campaign created successfully!", {
        description: "Your campaign has been created and is now active.",
        descriptionClassName: "text-black",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to create campaign", {
        description: error.response?.data?.error || "Something went wrong",
        descriptionClassName: "text-black",
      });
    },
  });
};

async function createCampaign(
  shopId: string,
  campaignData: CreateCampaignRequest
): Promise<CreateCampaignResponse> {
  const response = await authAxios.put(`${BASE_URL}/shops/${shopId}`, {
    campaigns: [campaignData],
  });
  return response.data;
}
