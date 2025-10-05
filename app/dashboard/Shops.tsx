"use client";
import Link from "next/link";
import React from "react";
import ShopCard from "./ShopCard";
import { useMyShops } from "@/hooks/useMyShops";
import { Loader2 } from "lucide-react";

function Shops() {
  const { data: shops, isLoading, error } = useMyShops();
  if (isLoading) {
    return (
      <div className="border border-foreground/30 rounded-xl p-2 flex items-center justify-center h-[55%]">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }
  if (error) {
    return <div>Error: {error?.message}</div>;
  }
  if (shops?.length === 0 || !shops) {
    return (
      <div className="border border-foreground/30 rounded-xl p-2 flex items-center justify-center h-[55%]">
        <p className="text-sm text-foreground/50">No shops found</p>
      </div>
    );
  }
  return (
    <div className="border border-foreground/30 rounded-xl p-2 h-auto xl:h-[55%] pb-4 xl:pb-0">
      <div className="flex justify-between items-center mt-1 mb-4 xl:mb-2">
        <h1 className="text-base font-semibold">My Shops</h1>
        <Link
          href="/shops"
          className="text-sm hover:text-foreground/80 transition-all duration-300"
        >
          View All
        </Link>
      </div>
      <div className="flex flex-col gap-4 xl:gap-1 mt-4 xl:mt-0">
        {shops.slice(0, 2).map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
    </div>
  );
}

export default Shops;
