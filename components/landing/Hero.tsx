"use client";
import React from "react";
import appIcon from "@/public/mockApp.png";
import merchantHero from "@/public/businesshero.png";
import Image from "next/image";
import { Button } from "../ui/button";
import { useCustomerStore } from "@/lib/store";
import { IconBrandApple, IconBrandGooglePlay } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";

const MerchantHero = () => {
  return (
    <motion.div
      className="relative z-10 w-full h-full px-4 flex flex-col-reverse md:flex-row items-center gap-8 md:gap-0 md:justify-between"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94],
        opacity: { duration: 0.4 },
      }}
    >
      <div className="flex flex-col gap-2 w-full md:w-1/2">
        <h1 className="text-white text-2xl md:text-5xl font-bold leading-relaxed">
          Revolutionizing Your Business With Fast, &{" "}
          <span className="text-[#D7FC6E]">Affordable</span> Payments
        </h1>
        <p className="text-white text-sm md:text-base mt-2">
          With Orcus you business can accept crypto payments from customers all
          over the world at insanely low fees and at unimaginable speeds.
        </p>
        <Button variant="default" className="w-full md:w-1/2 mt-4 mb-4">
          Create A Merchant Account
        </Button>
      </div>
      <div className="w-full md:w-1/2">
        <Image src={merchantHero} alt="merchantHero" width={500} height={500} />
      </div>
    </motion.div>
  );
};
const CustomerHero = () => {
  return (
    <motion.div
      className="relative z-10 w-full h-full px-4 flex flex-col-reverse md:flex-row items-center md:justify-between gap-4"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94],
        opacity: { duration: 0.4 },
      }}
    >
      <div className="flex flex-col gap-2 w-full md:w-1/2">
        <h1 className="text-white text-2xl md:text-5xl font-bold leading-relaxed">
          Pay with Crypto for Just <span className="text-[#D7FC6E]">1 KES</span>{" "}
          - Save big on Fees!
        </h1>
        <p className="text-white text-sm md:text-base mt-2">
          Skip the bank fees! Pay instantly with crypto on the fastest, most
          secure network. Your money, your way - with fees so low, you'll wonder
          why you ever used anything else.
        </p>
        <div className="flex flex-col md:flex-row items-center gap-2 my-8">
          <Button
            variant="default"
            className="w-full md:w-1/2 not-first:flex items-center gap-2"
          >
            <IconBrandGooglePlay />
            <span>Download On Google Play</span>
          </Button>
          <Button
            variant="default"
            className="w-full md:w-1/2 flex items-center gap-2 bg-transparent border-[1px] border-border/50 hover:bg-foreground/50 hover:border-border/50 "
          >
            <IconBrandApple />
            <span>Download On Apple Store</span>
          </Button>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex justify-center">
        <Image
          src={appIcon}
          alt="appIcon"
          width={400}
          height={400}
          className="transform rotate-12 hover:rotate-6 transition-transform duration-300 ease-in-out h-[500px] w-[310px] md:h-[550px] md:w-[350px] "
          style={{
            transform: "rotateY(15deg) rotateZ(12deg)",
            transformStyle: "preserve-3d",
          }}
        />
      </div>
    </motion.div>
  );
};

function Hero() {
  const { customer } = useCustomerStore();
  return (
    <div className="w-full h-[calc(100vh-100px)] md:h-[calc(100vh-300px)] rounded-3xl px-2 mt-4 relative bg-foreground/95">
      <AnimatePresence mode="wait">
        {customer === "merchant" ? (
          <MerchantHero key="merchant" />
        ) : (
          <CustomerHero key="customer" />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Hero;
