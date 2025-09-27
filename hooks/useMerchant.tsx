import { useAuth } from "@/contexts/AuthContext";
import { authAxios } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

export interface Merchant {
  id: string;
  username: string;
  mobile_number: string;
  account_id: string;
  profile_image_url: string;
  account_banner_image_url: string;
  auto_offramp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export const useMerchant = () => {
  const { merchantId } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: [merchantId],
    queryFn: async () => getMerchantByID(merchantId),
    enabled: !!merchantId,
  });

  return { data, isLoading, error };
};

async function getMerchantByID(merchantId: string | null): Promise<Merchant> {
  if (!merchantId) {
    throw new Error("Merchant ID is undefined: at getMerchantByID");
  }
  const data = await authAxios.get(`/merchants-id/${merchantId}`);
  return data.data.merchant;
}
