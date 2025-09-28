"use client";

import { MyShop } from "@/hooks/useMyShops";
import React from "react";
import cardRedImage from "@/public/card-red.png";
import cardBlueImage from "@/public/card-blue.png";
import { IconCopy, IconShare } from "@tabler/icons-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import qrMock from "@/public/qr-mock.png";
import Link from "next/link";
import { useSingleShopPerformance } from "@/hooks/useTransactions";
import { Loader2 } from "lucide-react";
import { formatBalance } from "@/hooks/useBalances";
import { toast } from "sonner";

function ShopCard({ shop }: { shop: MyShop }) {
  const { theme } = shop;
  const cardImage = theme === "red" ? cardRedImage : cardBlueImage;
  const { data: shopPerformance, isLoading } = useSingleShopPerformance(
    shop.id
  );

  return (
    <div
      style={{ backgroundImage: `url(${cardImage.src})` }}
      className="bg-cover bg-center w-full xl:w-[300px] h-[200px] px-4 py-3 rounded-3xl flex flex-col justify-between"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={shop.profile_image_url}
            alt={shop.name}
            width={36}
            height={36}
            className="rounded-full"
          />
          <Link href={`/shops/${shop.id}`}>
            <h1 className="text-base font-semibold text-background">
              {shop.name}
            </h1>
          </Link>
        </div>
        <Drawer>
          <DrawerTrigger>
            <IconShare className="text-background cursor-pointer" />
          </DrawerTrigger>
          <DrawerContent className="bg-[#d9d9d9]">
            <DrawerHeader>
              <DrawerTitle>
                <h1 className="text-lg font-semibold">Share Shop</h1>
                <p className="text-sm text-foreground/80">
                  Share shop with your customers.
                </p>
              </DrawerTitle>
              <DrawerDescription className="flex items-center justify-center">
                <img
                  src={qrMock.src}
                  alt="qr"
                  width={200}
                  height={200}
                  className="rounded-xl my-4"
                />
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter className="md:w-[500px] w-full mx-auto my-0">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h1 className="text-sm text-foreground/80">Name</h1>
                  <h1 className="text-sm text-foreground/80 font-semibold">
                    {shop.name}
                  </h1>
                </div>
                <div className="flex items-center justify-between">
                  <h1 className="text-sm text-foreground/80">Pay ID</h1>
                  <h1 className="text-sm text-foreground/80 font-semibold">
                    {shop.payment_id.slice(0, 4)}...
                    {shop.payment_id.slice(-4)}
                  </h1>
                </div>
              </div>
              <Button
                className="w-full bg-foreground text-background hover:bg-foreground/90 flex items-center gap-1"
                onClick={() => {
                  navigator.clipboard.writeText(`${shop.id}`);
                  toast.success("Link copied to clipboard");
                }}
              >
                Copy Link
                <IconCopy className="size-4" />
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
      <div className=" flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-base text-background">Balance</h1>
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <h1 className="text-base font-semibold text-background">
              KES {formatBalance(shopPerformance?.totalEarnings)}
            </h1>
          )}
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
        </div>
        <div className="flex flex-col">
          <h1 className="text-base text-background">Pay ID</h1>
          <h1 className="text-base font-semibold text-background">
            {shop.payment_id.slice(0, 4)}...{shop.payment_id.slice(-4)}
          </h1>
        </div>
      </div>
    </div>
  );
}

export default ShopCard;
