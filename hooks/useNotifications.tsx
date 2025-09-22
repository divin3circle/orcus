import { mockNotifications } from "@/mocks";
import { useQuery } from "@tanstack/react-query";

export interface Notification {
  id: string;
  title: string;
  description: string;
  image: string;
}

export const useNotifications = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => mockNotifications,
  });

  return { data, isLoading, error };
};
