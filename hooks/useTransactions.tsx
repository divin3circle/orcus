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
