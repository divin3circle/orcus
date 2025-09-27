import { mockShops } from "@/mocks";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { authAxios } from "@/lib/auth";

export interface MyShop {
  id: string;
  merchant_id: string;
  name: string;
  theme: string;
  payment_id: string;
  profile_image_url: string;
  created_at: string;
  updated_at: string;
}

export const useGetShopByID = (id: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["shop", id],
    queryFn: () => getShopByID(id),
    enabled: !!id,
  });
  return { data, isLoading, error };
};

async function getShopByID(id: string): Promise<MyShop | undefined> {
  if (!id) {
    return undefined;
  }
  const response = await authAxios.get(`/shops/${id}`);
  if (response.status === 200 && !response.data.shop) {
    return undefined;
  }
  return response.data.shop;
}

export const useMyShops = () => {
  const { merchantId } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["myShops"],
    queryFn: () => getMyShops(merchantId),
    enabled: !!merchantId,
  });
  return { data, isLoading, error };
};

async function getMyShops(
  merchantId: string | null
): Promise<MyShop[] | undefined> {
  if (!merchantId) {
    throw new Error("Merchant ID is required");
  }
  const response = await authAxios.get(`/shops/${merchantId}`);
  if (response.status === 200 && !response.data.shops) {
    return [];
  }
  return response.data.shops;
}
