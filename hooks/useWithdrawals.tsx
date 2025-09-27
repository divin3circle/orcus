import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { authAxios } from "@/lib/auth";

export interface Withdrawal {
  id: string;
  merchant_id: string;
  amount: number;
  fee: number;
  receiver: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Withdrawals extends Array<Withdrawal> {}

export const useWithdrawals = () => {
  const { merchantId } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["withdrawals", merchantId],
    queryFn: () => getWithdrawals(merchantId),
    enabled: !!merchantId,
  });

  return { data, isLoading, error };
};

async function getWithdrawals(merchantId: string | null): Promise<Withdrawals> {
  if (!merchantId) {
    throw new Error("Merchant ID is required");
  }

  const response = await authAxios.get(`/withdrawals`);
  if (response.status === 200 && !response.data.withdrawals) {
    return [];
  }
  return response.data.withdrawals;
}

export const useTotalWithdrawals = () => {
  const { data: withdrawals } = useWithdrawals();
  const {
    data: totalWithdrawals,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["totalWithdrawals", withdrawals],
    queryFn: () => getTotalWithdrawals(withdrawals),
    enabled: !!withdrawals,
  });
  return { data: totalWithdrawals, isLoading, error };
};

async function getTotalWithdrawals(
  withdrawals: Withdrawals | undefined
): Promise<number> {
  if (!withdrawals) {
    return 0;
  }
  return withdrawals.reduce((acc, withdrawal) => acc + withdrawal.amount, 0);
}
