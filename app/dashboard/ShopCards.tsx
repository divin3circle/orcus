import React from "react";
import ShopCard from "./ShopCard";
import { mockShops } from "@/mocks";

function ShopCards() {
  return (
    <div className="mt-4 md:mt-8 xl:mt-12">
      <h1 className="text-xl font-semibold">Featured Shops</h1>
      <div className=" flex flex-wrap gap-4 flex-col md:flex-row mt-4">
        {mockShops.slice(0, 2).map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
    </div>
  );
}

export default ShopCards;
