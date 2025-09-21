"use client";
import React from "react";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export default function TxnHeader() {
  return (
    <div className="relative flex w-full flex-col items-start justify-start overflow-hidden">
      <BackgroundRippleEffect />
      <div className="mt-60 w-full">
        <h2 className="relative z-10 mx-auto max-w-4xl text-center text-3xl font-bold text-neutral-800 md:text-4xl lg:text-7xl dark:text-neutral-100">
          Welcome to Your <span className="text-primary">Transactions</span>{" "}
          Page
        </h2>
        <p className="relative text-sm md:text-base px-2 z-10 mx-auto mt-4 max-w-xl text-center text-neutral-800 dark:text-neutral-500">
          Transactions are the lifeblood of any business. They are the proof of
          your revenue and your customers.
        </p>
        <div className="flex flex-col md:flex-row items-center gap-2 justify-center mt-8">
          <Button className="bg-transparent border-[1px] shadow-none hover:bg-foreground/5 border-foreground/50 hover:border-border/50 rounded-full text-foreground">
            Raise a Dispute
          </Button>
          <Link
            href="/dashboard"
            className="bg-foreground p-2 px-4 flex items-center gap-2 rounded-full text-[#d9d9d9] shadow-none hover:bg-foreground/10"
          >
            Back to Dashboard <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
