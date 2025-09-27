"use client";
import Link from "next/link";
import React from "react";
import RecentTransaction from "./RecentTransaction";
import { useTransactions } from "@/hooks/useTransactions";
import { Loader2 } from "lucide-react";

function RecentTransactions() {
  const { data: transactions, isLoading, error } = useTransactions();

  if (isLoading) {
    return (
      <div className="border border-foreground/30 rounded-xl p-2 flex items-center justify-center h-[45%]">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }
  if (error) {
    return <div>Error: {error?.message}</div>;
  }

  if (transactions?.length === 0 || !transactions) {
    return (
      <div className="border border-foreground/30 rounded-xl p-2 flex items-center justify-center h-[45%]">
        <p className="text-sm text-foreground/50">No transactions found</p>
      </div>
    );
  }
  console.log("transactions", transactions);

  return (
    <div className="border border-foreground/30 rounded-xl p-2 h-auto md:h-[45%]">
      <div className="flex justify-between items-center mt-1 mb-2">
        <h1 className="text-base font-semibold">Recent Transactions</h1>
        <Link
          href="/transactions"
          className="text-sm hover:text-foreground/80 transition-all duration-300"
        >
          View All
        </Link>
      </div>
      <div className="flex flex-col gap-2 mt-4">
        {transactions.slice(0, 5).map((txn) => (
          <RecentTransaction key={txn.id} txn={txn} />
        ))}
      </div>
    </div>
  );
}

export default RecentTransactions;
