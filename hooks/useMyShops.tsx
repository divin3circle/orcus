import { mockShops } from "@/mocks";
import { useQuery } from "@tanstack/react-query";

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
  });
  return { data, isLoading, error };
};

async function getShopByID(id: string): Promise<MyShop | undefined> {
  const shop = mockShops.find((shop) => shop.id === id);
  return shop;
}
