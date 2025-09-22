"use client";
import { Button } from "@/components/ui/button";
import { IconEye, IconEyeOff, IconPlus } from "@tabler/icons-react";
import React from "react";
import ShopCards from "./ShopCards";
import { useRouter } from "next/navigation";
import { useCustomerStore } from "@/lib/store";

function Balance() {
  const navigate = useRouter();
  const { showBalance, toggleShowBalance } = useCustomerStore();
  return (
    <div className="border border-foreground/30 rounded-xl h-auto md:h-[45%] p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-semibold">Balance</h1>
        <Button
          variant="outline"
          className="bg-transparent border-foreground/30 border-[1px] hover:bg-foreground/5"
          onClick={() => navigate.push("/shops/create")}
        >
          <IconPlus className="size-4" />
          <p className="text-base hidden md:block">Add Shop</p>
        </Button>
      </div>
      <div className="flex gap-4 mt-4 items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl md:text-4xl text-foreground/80 font-bold">
            KES
          </h1>
          <h1 className="text-4xl md:text-4xl">
            {showBalance ? "10, 524.15" : "**********"}
          </h1>
        </div>
        <div className="">
          {showBalance ? (
            <IconEyeOff
              className="text-foreground/80 cursor-pointer"
              onClick={toggleShowBalance}
            />
          ) : (
            <IconEye
              className="text-foreground/80 cursor-pointer"
              onClick={toggleShowBalance}
            />
          )}
        </div>
      </div>
      <ShopCards />
    </div>
  );
}

export default Balance;
