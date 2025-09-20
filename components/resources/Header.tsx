"use client";
import React from "react";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { Button } from "../ui/button";
import { ArrowRightIcon } from "lucide-react";

export default function Header() {
  return (
    <div className="relative flex w-full flex-col items-start justify-start overflow-hidden">
      <BackgroundRippleEffect />
      <div className="mt-60 w-full">
        <h2 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-neutral-800 md:text-4xl lg:text-7xl dark:text-neutral-100">
          Welcome to Our <span className="text-primary">Resources Center</span>
        </h2>
        <p className="relative z-10 mx-auto mt-4 max-w-xl text-center text-neutral-800 dark:text-neutral-500">
          At Orcus, we understand that using blockchain technology can be
          challenging. That's why we've created a comprehensive library of
          resources to help you get started with our Platform.
        </p>
        <div className="flex flex-col md:flex-row items-center gap-2 justify-center mt-8">
          <Button className="bg-transparent border-[1px] shadow-none hover:bg-foreground/5 border-foreground/50 hover:border-border/50 rounded-full text-foreground">
            Request Resources
          </Button>
          <Button className="bg-[#D7FC6E] flex items-center gap-2 rounded-full text-foreground shadow-none hover:bg-[#D7FC6E]/50">
            Explore Resources <ArrowRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
