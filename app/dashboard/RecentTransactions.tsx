import Link from "next/link";
import React from "react";

function RecentTransactions() {
  return (
    <div className="border border-foreground/30 rounded-xl p-2 h-auto md:h-[45%]">
      <div className="flex justify-between items-center mt-1 mb-2">
        <h1 className="text-base">Recent Transactions</h1>
        <Link
          href="/transactions"
          className="text-sm font-semibold hover:text-foreground/80 transition-all duration-300"
        >
          View All
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">Transaction</h2>
          <p className="text-sm">Transaction</p>
        </div>
      </div>
    </div>
  );
}

export default RecentTransactions;
