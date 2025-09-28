import { useAuth } from "@/contexts/AuthContext";
import { authAxios } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useGetShopByID, useMyShops } from "./useMyShops";

export interface Transaction {
  id: string;
  shop_id: string;
  user_id: string;
  merchant_id: string;
  amount: number;
  fee: number;
  status: "pending" | "completed" | "failed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface TransactionFilters {
  shop_id?: string;
  user_id?: string;
  merchant_id?: string;
  status?: Transaction["status"];
  start_date?: string;
  end_date?: string;
}

export interface TransactionStats {
  total_amount: number;
  total_fee: number;
  total_transactions: number;
  pending_transactions: number;
  completed_transactions: number;
  failed_transactions: number;
}

export const useTransactions = () => {
  const { merchantId } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactions(merchantId),
    enabled: !!merchantId,
  });

  return { data, isLoading, error };
};

async function getTransactions(
  merchantId: string | null
): Promise<Transaction[]> {
  if (!merchantId) {
    throw new Error("Merchant ID is required");
  }
  const response = await authAxios.get(`/transactions/merchant/${merchantId}`);
  if (response.status === 200 && !response.data.transactions) {
    return [];
  }
  return response.data.transactions;
}

export const useTotalIncome = () => {
  const { data: transactions } = useTransactions();
  const {
    data: totalIncome,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["totalIncome", transactions],
    queryFn: () => getTotalIncome(transactions),
    enabled: !!transactions,
  });
  return { data: totalIncome, isLoading, error };
};

export const useCompletedTransactions = () => {
  const { data: transactions } = useTransactions();
  const {
    data: completedTransactions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["completedTransactions", transactions],
    queryFn: () => getCompletedTransactions(transactions),
    enabled: !!transactions,
  });
  return { data: completedTransactions, isLoading, error };
};

export const useTransactionStats = () => {
  const { data: transactions } = useTransactions();
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["transactionStats", transactions],
    queryFn: () => getTransactionStats(transactions),
    enabled: !!transactions,
  });
  return { data: stats, isLoading, error };
};

async function getTotalIncome(
  transactions: Transaction[] | undefined
): Promise<number> {
  if (!transactions) {
    return 0;
  }
  return transactions
    .filter((txn) => txn.status === "completed")
    .reduce((acc, txn) => acc + txn.amount, 0);
}

async function getCompletedTransactions(
  transactions: Transaction[] | undefined
): Promise<Transaction[]> {
  if (!transactions) {
    return [];
  }
  return transactions.filter((txn) => txn.status === "completed");
}

async function getTransactionStats(
  transactions: Transaction[] | undefined
): Promise<TransactionStats> {
  if (!transactions) {
    return {
      total_amount: 0,
      total_fee: 0,
      total_transactions: 0,
      pending_transactions: 0,
      completed_transactions: 0,
      failed_transactions: 0,
    };
  }

  const completed = transactions.filter((txn) => txn.status === "completed");
  const pending = transactions.filter((txn) => txn.status === "pending");
  const failed = transactions.filter((txn) => txn.status === "failed");

  return {
    total_amount: completed.reduce((acc, txn) => acc + txn.amount, 0),
    total_fee: transactions.reduce((acc, txn) => acc + txn.fee, 0),
    total_transactions: transactions.length,
    pending_transactions: pending.length,
    completed_transactions: completed.length,
    failed_transactions: failed.length,
  };
}

export const formatCurrency = (amount: number | undefined): string => {
  if (!amount) {
    return "0.00";
  }
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
  }).format(amount / 100); // Assuming amount is in cents
};

export interface ShopPerformance {
  id: string;
  name: string;
  totalEarnings: number;
  transactionCount: number;
  averageTransaction: number;
  fill: string;
}

export interface ShopPerformances extends Array<ShopPerformance> {}

export const useShopPerformance = () => {
  const { data: shops } = useMyShops();
  const { data: transactions } = useCompletedTransactions();

  const {
    data: shopPerformance,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["shopPerformance", shops, transactions],
    queryFn: () => getShopPerformance(shops, transactions),
    enabled: !!(shops && transactions),
  });

  return { data: shopPerformance, isLoading, error };
};

async function getShopPerformance(
  shops: any[] | undefined,
  transactions: Transaction[] | undefined
): Promise<ShopPerformances> {
  if (!shops || !transactions) {
    return [];
  }

  return shops.map((shop, index) => {
    const shopTransactions = transactions.filter(
      (txn) => txn.shop_id === shop.id
    );

    const totalEarnings = shopTransactions.reduce(
      (acc, txn) => acc + txn.amount,
      0
    );

    const transactionCount = shopTransactions.length;
    const averageTransaction =
      transactionCount > 0 ? totalEarnings / transactionCount : 0;

    const shopColors = [
      "#FF6B6B", // Red
      "#4ECDC4", // Teal
      "#45B7D1", // Blue
      "#96CEB4", // Green
      "#FFEAA7", // Yellow
      "#DDA0DD", // Plum
      "#98D8C8", // Mint
    ];

    return {
      id: shop.id,
      name: shop.name,
      totalEarnings,
      transactionCount,
      averageTransaction,
      fill: shopColors[index % shopColors.length],
    };
  });
}

export const useShopTransactions = (shopId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["shopTransactions", shopId],
    queryFn: () => getShopTransactions(shopId),
    enabled: !!shopId,
  });
  return { data, isLoading, error };
};

async function getShopTransactions(shopId: string): Promise<Transaction[]> {
  if (!shopId) {
    throw new Error("Shop ID is required");
  }
  const response = await authAxios.get(`/transactions/shop/${shopId}`);
  if (response.status === 200 && !response.data.transactions) {
    return [];
  }
  return response.data.transactions;
}

export const useSingleShopPerformance = (shopId: string) => {
  const { data: transactions } = useCompletedTransactions();
  const { data: shop } = useGetShopByID(shopId);
  const {
    data: shopPerformance,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["shopPerformance", shopId, transactions],
    queryFn: () => getSingleShopPerformance(shop, transactions),
    enabled: !!(shop && transactions),
  });
  return { data: shopPerformance, isLoading, error };
};

async function getSingleShopPerformance(
  shop: any | undefined,
  transactions: Transaction[] | undefined
): Promise<ShopPerformance> {
  if (!shop || !transactions) {
    return {
      id: "",
      name: "",
      totalEarnings: 0,
      transactionCount: 0,
      averageTransaction: 0,
      fill: "",
    };
  }

  const shopTransactions = transactions.filter(
    (txn) => txn.shop_id === shop.id
  );

  const totalEarnings = shopTransactions.reduce(
    (acc, txn) => acc + txn.amount,
    0
  );

  const transactionCount = shopTransactions.length;
  const averageTransaction =
    transactionCount > 0 ? totalEarnings / transactionCount : 0;

  return {
    id: shop.id,
    name: shop.name,
    totalEarnings,
    transactionCount,
    averageTransaction,
    fill: shop.fill,
  };
}
