import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAxios } from "@/lib/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

export interface CreateShopRequest {
  name: string;
  profile_image_url: string;
  theme: string;
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
  const response = await authAxios.get(`/shops/merchant/${merchantId}`);
  if (response.status === 200 && !response.data.shops) {
    return [];
  }
  return response.data.shops;
}

export const useCreateShop = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (shopData: CreateShopRequest) => createShop(shopData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["myShops"] });
      toast.success("Shop created successfully!", {
        descriptionClassName: "text-black",
      });
      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast.error("Failed to create shop", {
        description: error.response?.data?.error || "Something went wrong",
        descriptionClassName: "text-black",
      });
    },
  });
};

async function createShop(shopData: CreateShopRequest): Promise<MyShop> {
  const response = await authAxios.post("/shops", {
    name: shopData.name,
    profile_image_url: shopData.profile_image_url,
    theme: shopData.theme,
    campaigns: [],
  });
  return response.data.shop;
}
