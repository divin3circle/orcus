"use client";
import { ChevronsLeft } from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";
import Link from "next/link";
import { useGetShopByID } from "@/hooks/useMyShops";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import ShopCampaign from "./ShopCampaign";
import { ShopTransactionChart } from "./ShopTransactionChart";

function page() {
  const { id } = useParams();
  const { data: shop } = useGetShopByID(id as string);
  if (!shop) return null;
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  return (
    <div className="max-w-7xl mx-auto my-0 px-1">
      <Link href="/dashboard" className="flex items-center gap-1 mt-4 px-2">
        <ChevronsLeft className="size-6" />
        <p className="underline underline-offset-4">{shop.name}</p>
      </Link>
      <div className="">
        <div className="flex items-center flex-col md:flex-row justify-between gap-2 mt-4">
          <div className="border border-foreground/30  rounded-3xl w-full md:w-1/2 p-4">
            <h1 className="text-base ">Total Balance</h1>
            <h1 className="text-4xl mt-8 font-semibold">
              KES 10,000.<span className="text-xl text-foreground/50">00</span>
            </h1>
            <p className="text-sm mt-2 text-foreground/70">
              Since {formatDate(shop.created_at)}
            </p>
            <div className="mt-8 flex items-center gap-2">
              <div className="border border-foreground/30 rounded-3xl w-1/3 p-4">
                <h1 className="text-base">Transactions</h1>
                <h1 className="text-xl font-semibold">100</h1>
              </div>
              <div className="border border-foreground/30 rounded-3xl w-1/3 p-4">
                <h1 className="text-base">Campaigns</h1>
                <h1 className="text-xl font-semibold">100</h1>
              </div>
              <div className="border border-foreground/30 rounded-3xl w-1/3 p-4">
                <h1 className="text-base">Visitors</h1>
                <h1 className="text-xl font-semibold">100</h1>
              </div>
            </div>
          </div>
          <div className="border border-foreground/30 rounded-3xl w-full md:w-1/2 p-4">
            <h1 className="text-base ">Revenue</h1>
            <h1 className="text-4xl mt-8 font-semibold">
              KES 500.<span className="text-xl text-foreground/50">80</span>
            </h1>
            <p className="text-sm mt-2 text-foreground/70">October 2025</p>
            <div className="mt-2">
              <p className="text-sm text-foreground/70 leading-relaxed">
                You've earned KES 500.80 this month, an increase of 10% from
                last month. Keep up the good work! You can attract more
                customers by improving your marketing strategies with our tools
                such Campaign Creator.{" "}
                <Link
                  href="/campaigns"
                  className="text-primary underline underline-offset-4"
                >
                  Learn more
                </Link>
              </p>
              <Link href="/campaigns">
                <Button className="w-full mt-2 bg-foreground text-background hover:bg-foreground/90 flex items-center gap-1">
                  <IconPlus className="size-4" />
                  <p className="text-base">Create a Campaign</p>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 gap-2 flex flex-col-reverse md:flex-row justify-between">
        <ShopTransactionChart />
        <ShopCampaign />
      </div>
    </div>
  );
}

export default page;
