import React from "react";
import ShopCard from "./ShopCard";
import { mockShops } from "@/mocks";
import { useMyShops } from "@/hooks/useMyShops";
import { Loader2 } from "lucide-react";

function ShopCards() {
  const { data: shops, isLoading, error } = useMyShops();
  if (isLoading) {
    return (
      <div className="mt-12 w-full flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }
  if (error) {
    return <div>Error: {error?.message}</div>;
  }
  if (shops?.length === 0 || !shops) {
    return (
      <div className="mt-12 w-full flex items-center justify-center h-full">
        <p className="text-sm text-foreground/50">No shops found</p>
      </div>
    );
  }
  return (
    <div className="mt-4">
      <h1 className="text-xl font-semibold">Featured Shops</h1>
      <div className=" flex gap-4 flex-col md:flex-row mt-4">
        {mockShops.slice(0, 2).map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
    </div>
  );
}

export default ShopCards;
