import Link from "next/link";
import React from "react";
import RecentTransaction from "./RecentTransaction";
import { mockTransactions } from "@/mocks";

function RecentTransactions() {
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
        {mockTransactions.slice(0, 5).map((txn) => (
          <RecentTransaction key={txn.id} txn={txn} />
        ))}
      </div>
    </div>
  );
}

export default RecentTransactions;
