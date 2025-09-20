"use client";
import React from "react";
import Image from "next/image";
import logo from "@/public/dark-logo.png";
import Link from "next/link";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";
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
import { useCustomerStore } from "@/lib/store";

function Navbar() {
  const { customer, toggleCustomer } = useCustomerStore();
  return (
    <nav className="w-full h-16 bg-foreground mt-2 md:mt-4 rounded-3xl flex items-center justify-between">
      <div className="flex items-center gap-1 px-2">
        <Image src={logo} alt="logo" width={42} height={42} />
        <p className="text-2xl text-background font-semibold">Orcus</p>
      </div>
      <div className="px-2">
        <div className="md:flex items-center justify-between md:gap-4 xl:gap-8 hidden">
          <Link
            href="/"
            onClick={() => toggleCustomer("merchant")}
            className={`text-background uppercase font-semibold text-sm hover:text-background/70 transition-all duration-300 rounded-2xl ${
              customer === "merchant"
                ? "border-[1px] border-border/50 px-2 py-1 rounded-3xl"
                : ""
            }`}
          >
            Merchants
          </Link>
          <Link
            href="/"
            onClick={() => toggleCustomer("customer")}
            className={`text-background uppercase font-semibold text-sm hover:text-background/70 transition-all duration-300 rounded-2xl ${
              customer === "customer"
                ? "border-[1px] border-border/50 px-2 py-1 rounded-3xl"
                : ""
            }`}
          >
            Customers
          </Link>
          <Link
            href="/"
            className="text-background uppercase font-semibold text-sm hover:text-background/70 transition-all duration-300"
          >
            Resources
          </Link>
          <Link
            href="/login"
            className="text-[#D7FC6E] font-bold uppercase transition-all duration-300"
          >
            Get Started
          </Link>
        </div>
        <Drawer>
          <DrawerTrigger className="md:hidden">
            <Menu className="text-background size-8 md:hidden" />
          </DrawerTrigger>
          <DrawerContent className="md:hidden">
            <DrawerHeader>
              <DrawerTitle>
                <div className="flex items-center justify-center mb-8 gap-1 px-2">
                  <Image src={logo} alt="logo" width={42} height={42} />
                  <p className="text-2xl font-semibold">Orcus</p>
                </div>
              </DrawerTitle>
              <DrawerDescription>
                <div className="flex flex-col gap-8 mb-4">
                  <Link
                    href="/"
                    onClick={() => toggleCustomer("merchant")}
                    className={`uppercase font-semibold text-sm hover:text-background/70 transition-all duration-300 rounded-2xl ${
                      customer === "merchant"
                        ? "border-[1px] border-border/50 px-2 py-1 rounded-3xl"
                        : ""
                    }`}
                  >
                    Merchants
                  </Link>
                  <Link
                    href="/"
                    onClick={() => toggleCustomer("customer")}
                    className={`uppercase font-semibold text-sm hover:text-background/70 transition-all duration-300 rounded-2xl ${
                      customer === "customer"
                        ? "border-[1px] border-border/50 px-2 py-1 rounded-3xl"
                        : ""
                    }`}
                  >
                    Customers
                  </Link>
                  <Link
                    href="/"
                    className="uppercase font-semibold text-sm hover:text-background/70 transition-all duration-300"
                  >
                    Resources
                  </Link>
                  <Link
                    href="/login"
                    className="text-[#D7FC6E] bg-foreground font-bold uppercase transition-all duration-300"
                  >
                    Get Started
                  </Link>
                </div>
              </DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      </div>
    </nav>
  );
}

export default Navbar;
