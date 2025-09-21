"use client";
import { Transaction } from "@/hooks/useTransactions";
import { useGetShopByID } from "@/hooks/useMyShops";
import React from "react";
import Link from "next/link";

function RecentTransaction({ txn }: { txn: Transaction }) {
  const { data: shop } = useGetShopByID(txn.shop_id);
  if (!shop) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Link
      href={`/transactions/${txn.id}`}
      className="flex items-start justify-between p-2 rounded-lg hover:bg-foreground/5 transition-all duration-300"
    >
      <div className="flex items-center gap-2">
        <img
          src={shop.profile_image_url}
          alt={shop.name}
          className="size-10 rounded-full"
        />
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold">{shop?.name}</h1>
          <h1 className="text-sm text-foreground/80">
            {formatDate(txn.created_at)}
          </h1>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1">
          <h1 className="text-sm font-semibold">KES</h1>
          <p className="text-sm font-semibold">{txn.amount.toLocaleString()}</p>
        </div>
        <p className="text-xs text-foreground/80">
          {txn.id.slice(0, 4)}...{txn.id.slice(-4)}
        </p>
      </div>
    </Link>
  );
}

export default RecentTransaction;
