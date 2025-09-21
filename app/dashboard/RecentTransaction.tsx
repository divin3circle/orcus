"use client";
import { Transaction } from "@/hooks/useTransactions";
import { useGetShopByID } from "@/hooks/useMyShops";
import React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  IconArrowUpBar,
  IconCalendar,
  IconCheck,
  IconCopy,
  IconDownload,
} from "@tabler/icons-react";
import { ChevronsDown, ChevronsUp } from "lucide-react";

function RecentTransaction({ txn }: { txn: Transaction }) {
  const { data: shop } = useGetShopByID(txn.shop_id);
  if (!shop) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex items-start justify-between p-2 rounded-lg hover:bg-foreground/5 transition-all duration-300">
      <div className="flex items-center gap-2">
        <img
          src={shop.profile_image_url}
          alt={shop.name}
          className="size-10 rounded-full"
        />
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold">{shop?.name}</h1>
          <div className="flex items-center gap-1">
            <h1 className="text-sm font-semibold">KES</h1>
            <p className="text-sm font-semibold">
              {txn.amount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Drawer>
          <DrawerTrigger className="text-xs underline hover:text-foreground/80 transition-all duration-300">
            View Details
          </DrawerTrigger>
          <DrawerContent className="bg-[#d9d9d9]">
            <DrawerHeader>
              <DrawerTitle className="mb-2">
                <p className="text-lg font-semibold">Transaction Details</p>
              </DrawerTitle>
              <DrawerDescription className="md:w-[500px] w-full mx-auto my-0 flex flex-col gap-2 items-center justify-center">
                <div className="flex flex-col gap-2 max-w-md mx-auto">
                  <div className="rounded-full size-20 bg-foreground flex items-center justify-center">
                    <ChevronsDown className="size-6 text-lime-500" />
                  </div>
                </div>
                <p className="text-sm text-foreground/80">Paid via USDC-H</p>
                <div className="flex items-center gap-1">
                  <p className="text-lg font-semibold text-foreground/80">+</p>
                  <h1 className="text-3xl font-semibold">
                    KES {txn.amount.toLocaleString()}
                  </h1>
                </div>
                <div className="border p-2.5 rounded-3xl border-foreground/30 flex items-center gap-1 mb-4">
                  <img
                    src={shop.profile_image_url}
                    alt={shop.name}
                    className="size-6 rounded-full"
                  />
                  <p className="text-sm">{shop.name}</p>
                </div>
                <div className="flex flex-col bg-foreground/5 p-4 gap-3 rounded-3xl w-full">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm text-foreground/80">Transaction ID</p>
                    <p className="text-sm font-semibold flex items-center gap-1">
                      {txn.id.slice(0, 4)}...{txn.id.slice(-4)}
                      <IconCopy className="size-4" />
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-foreground/80">Date</p>
                    <p className="text-sm font-semibold flex items-center gap-1">
                      {formatDate(txn.created_at)}
                      <IconCalendar className="size-4" />
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-foreground/80">Status</p>
                    <p className="text-sm font-semibold flex items-center gap-1">
                      {txn.status}
                      <IconCheck className="size-4" />
                    </p>
                  </div>
                </div>
                <div className="flex flex-col bg-foreground/5 p-4 gap-3 rounded-3xl w-full">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm text-foreground/80">
                      Transaction Fee
                    </p>
                    <p className="text-sm font-semibold flex items-center gap-1">
                      KES {txn.fee.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-foreground/80">Customer</p>
                    <p className="text-sm font-semibold flex items-center gap-1">
                      {txn.user_id.slice(0, 4)}...{txn.user_id.slice(-4)}
                    </p>
                  </div>
                </div>
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter className="md:w-[500px] w-full mx-auto my-0">
              <Button className="w-full bg-foreground text-background hover:bg-foreground/90 flex items-center gap-1">
                Download Receipt
                <IconDownload className="size-4" />
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        <p className="text-xs text-foreground/80">
          {txn.id.slice(0, 4)}...{txn.id.slice(-4)}
        </p>
      </div>
    </div>
  );
}

export default RecentTransaction;
