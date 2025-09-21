import Link from "next/link";
import React from "react";

function Shops() {
  return (
    <div className="border border-foreground/30 rounded-xl p-2 h-auto md:h-1/2">
      <div className="flex justify-between items-center mt-1 mb-2">
        <h1 className="text-base">My Shops</h1>
        <Link
          href="/shops"
          className="text-sm font-semibold hover:text-foreground/80 transition-all duration-300"
        >
          View All
        </Link>
      </div>
    </div>
  );
}

export default Shops;
