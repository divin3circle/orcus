import { ChevronsLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import ShopsHeader from "./ShopsHeader";
import { mockShops } from "@/mocks";
import ShopCard from "../dashboard/ShopCard";

function page() {
  return (
    <div>
      <ShopsHeader />
      <div className="max-w-7xl mx-auto my-0 px-1">
        <Link href="/dashboard" className="flex items-center gap-1 my-4">
          <ChevronsLeft className="size-6" />
          <p className="underline underline-offset-4">Back Home</p>
        </Link>
        <div className="mt-4 flex flex-wrap gap-4 flex-col md:flex-row">
          {mockShops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default page;
