"use client";
import { ChevronsLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import ShopsHeader from "./ShopsHeader";
import { useMyShops } from "@/hooks/useMyShops";
import ShopCard from "../dashboard/ShopCard";

function page() {
  const { data: shops, isLoading, error } = useMyShops();
  if (isLoading) {
    return (
      <div className="">
        <ShopsHeader />
        <div className="max-w-7xl mx-auto my-0 px-1">
          <Link href="/dashboard" className="flex items-center gap-1 my-4">
            <ChevronsLeft className="size-6" />
            <p className="underline underline-offset-4">Back Home</p>
          </Link>
          <div className="flex items-center justify-center mt-4">
            <Loader2 className="w-5 h-5 animate-spin text-center" />
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return <div>Error: {error?.message}</div>;
  }
  if (shops?.length === 0 || !shops) {
    return (
      <div className="">
        <ShopsHeader />
        <div className="max-w-7xl mx-auto my-0 px-1">
          <Link href="/dashboard" className="flex items-center gap-1 my-4">
            <ChevronsLeft className="size-6" />
            <p className="underline underline-offset-4">Back Home</p>
          </Link>
          <div className="flex items-center justify-center mt-4">
            <p className="text-sm text-foreground/50">No shops found</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <ShopsHeader />
      <div className="max-w-7xl mx-auto my-0 px-1">
        <Link href="/dashboard" className="flex items-center gap-1 my-4">
          <ChevronsLeft className="size-6" />
          <p className="underline underline-offset-4">Back Home</p>
        </Link>
        <div className="mt-4 flex flex-wrap gap-4 flex-col md:flex-row">
          {shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default page;
