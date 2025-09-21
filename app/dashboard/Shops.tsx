import { mockShops } from "@/mocks";
import Link from "next/link";
import React from "react";
import ShopCard from "./ShopCard";

function Shops() {
  return (
    <div className="border border-foreground/30 rounded-xl p-2 h-auto md:h-[55%]">
      <div className="flex justify-between items-center mt-1 mb-2">
        <h1 className="text-base font-semibold">My Shops</h1>
        <Link
          href="/shops"
          className="text-sm hover:text-foreground/80 transition-all duration-300"
        >
          View All
        </Link>
      </div>
      <div className="flex flex-col gap-2 mt-6">
        {mockShops.slice(0, 2).map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
    </div>
  );
}

export default Shops;
