"use client";
import React from "react";
import IncomeChart from "./IncomeChart";
import withdraw from "@/public/withdraw.png";
import ShopPerformanceChart from "./ShopPerformanceChart";
import { useCustomerStore } from "@/lib/store";

function Stats() {
  const { showBalance } = useCustomerStore();
  return (
    <div className="border border-foreground/30 rounded-xl p-2 h-auto md:h-[55%] flex flex-col-reverse md:flex-row justify-between w-full">
      <div className="md:w-1/2 md:border-r border-foreground/30  h-full">
        <div className="border-b border-foreground/30 pb-4 h-1/2 w-full">
          <div className="px-2">
            <h1 className="text-base font-semibold mt-2">Total Income</h1>
            <p className="text-sm text-foreground/80">September 2025</p>
          </div>
          <div className="flex items-end justify-between h-full md:h-[85%]">
            <h1 className="text-lg px-2 font-semibold">
              KES {showBalance ? "10,000" : "******"}
            </h1>
            <div className="w-1/2 h-full">
              <IncomeChart />
            </div>
          </div>
        </div>
        <div className="h-1/2 w-full">
          <div className="px-2">
            <h1 className="text-base font-semibold mt-2">Withdrawals</h1>
            <p className="text-sm text-foreground/80">Last 30 days</p>
          </div>
          <div className="flex items-end justify-between">
            <h1 className="text-lg px-2 font-semibold">
              KES {showBalance ? "536" : "*******"}
            </h1>
            <div className="w-1/2 h-full">
              <img
                src={withdraw.src}
                alt="withdraw"
                width={100}
                height={100}
                className="w-[80%] object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="md:w-1/2 px-2 border-b md:border-b-0 border-foreground/30 w-full h-full flex flex-col justify-between">
        <div className="">
          <h1 className="text-base font-semibold mt-2">Shop Performances</h1>
          <p className="text-sm text-foreground/80">Last 30 days</p>
        </div>
        <div className="w-full h-full flex items-center justify-center">
          <ShopPerformanceChart />
        </div>
      </div>
    </div>
  );
}

export default Stats;
