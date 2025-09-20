"use client";

import React from "react";
import {
  IconCoin,
  IconReceiptPound,
  IconMessageDollar,
  IconCash,
  IconCashBanknote,
  IconMessage,
  IconDashboard,
  IconMoneybag,
} from "@tabler/icons-react";
import { Globe2 } from "lucide-react";
import { useCustomerStore } from "@/lib/store";
import { motion, AnimatePresence } from "motion/react";

const MerchantFeatures = () => {
  return (
    <div className="mt-4 h-[200px] md:h-[150px] rounded-3xl flex flex-col gap-2 md:flex-row justify-between items-center">
      <motion.div
        className="w-full md:w-1/2 bg-foreground/95 h-full rounded-3xl flex p-4 items-start"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{
          duration: 0.7,
          ease: [0.25, 0.46, 0.45, 0.94],
          opacity: { duration: 0.4 },
        }}
      >
        <h1 className="text-white leading-relaxed w-[40%]">
          Accept crypto payments from customers worldwide
        </h1>
        <div className="w-[60%] bg-[#D7FC6E] h-full rounded-3xl flex flex-col">
          <div className="flex items-center justify-between w-full p-4">
            <h1 className="text-black text-lg leading-relaxed">Global Reach</h1>
            <Globe2 className="w-6 h-6 text-black" />
          </div>
          <div className="flex items-center justify-between w-full p-4">
            <h1 className="text-black text-2xl font-bold">99%</h1>
            <div className="bg-foreground rounded-full p-2 ">
              <h1 className="text-white text-xs">Instant Settlement</h1>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div
        className="w-full md:w-1/2 flex justify-between items-center flex-col md:flex-row gap-2"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{
          duration: 0.7,
          ease: [0.25, 0.46, 0.45, 0.94],
          opacity: { duration: 0.4 },
          delay: 0.2,
        }}
      >
        <div className="w-full md:w-1/2 bg-foreground/95 h-[200px] md:h-[150px] justify-between rounded-3xl flex flex-col p-4 items-start gap-2">
          <h1 className="text-white leading-relaxed">
            Secure & fast transactions
          </h1>
          <div className="flex items-center justify-between w-full">
            <IconMessage className="w-6 h-6 text-white" />
            <IconReceiptPound className="w-6 h-6 text-white" />
            <IconDashboard className="w-6 h-6 text-white" />
            <IconMessageDollar className="w-6 h-6 text-white" />
          </div>
          <p className="text-background/90 text-xs leading-relaxed">
            Receive payments with SMS confirmation and a dashboard to track
            store performances
          </p>
        </div>
        <div className="w-full md:w-1/2 bg-foreground/95 h-[200px] md:h-[150px] justify-between rounded-3xl flex flex-col p-4 items-start gap-2">
          <h1 className="text-white leading-relaxed">
            24/7 Withdrawals Supported
          </h1>
          <div className="flex items-center justify-between w-full">
            <IconCoin className="w-6 h-6 text-white" />
            <IconCash className="w-6 h-6 text-white" />
            <IconCashBanknote className="w-6 h-6 text-white" />
            <IconMoneybag className="w-6 h-6 text-white" />
          </div>
          <p className="text-background/90 text-xs leading-relaxed">
            Revenue can be withdrawn to another crypto wallet or bank account at
            any time.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const CustomerFeatures = () => {
  return (
    <div className="mt-4 h-[200px] md:h-[150px] rounded-3xl flex flex-col gap-2 md:flex-row justify-between items-center">
      <motion.div
        className="w-full md:w-1/2 bg-foreground/95 h-full rounded-3xl flex p-4 items-start"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{
          duration: 0.7,
          ease: [0.25, 0.46, 0.45, 0.94],
          opacity: { duration: 0.4 },
        }}
      >
        <h1 className="text-white leading-relaxed w-[40%]">
          Enjoy fast payments with Just 1 KES in fees
        </h1>
        <div className="w-[60%] bg-[#D7FC6E] h-full rounded-3xl flex flex-col">
          <div className="flex items-center justify-between w-full p-4">
            <h1 className="text-black text-lg leading-relaxed">Low Fees</h1>
            <Globe2 className="w-6 h-6 text-black" />
          </div>
          <div className="flex items-center justify-between w-full p-4">
            <h1 className="text-black text-2xl font-bold">1 KES</h1>
            <div className="bg-foreground rounded-full p-2 ">
              <h1 className="text-white text-xs">Low Fees</h1>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div
        className="w-full md:w-1/2 flex justify-between items-center flex-col md:flex-row gap-2"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{
          duration: 0.7,
          ease: [0.25, 0.46, 0.45, 0.94],
          opacity: { duration: 0.4 },
          delay: 0.2,
        }}
      >
        <div className="w-full md:w-1/2 bg-foreground/95 h-[200px] md:h-[150px] justify-between rounded-3xl flex flex-col p-4 items-start gap-2">
          <h1 className="text-white leading-relaxed">Instant Payments</h1>
          <div className="flex items-center justify-between w-full">
            <IconMessage className="w-6 h-6 text-white" />
            <IconReceiptPound className="w-6 h-6 text-white" />
            <IconDashboard className="w-6 h-6 text-white" />
            <IconMessageDollar className="w-6 h-6 text-white" />
          </div>
          <p className="text-background/90 text-xs leading-relaxed">
            Enjoy instant payments on the Hedera network with just 1 KES in
            fees.
          </p>
        </div>
        <div className="w-full md:w-1/2 bg-foreground/95 h-[200px] md:h-[150px] justify-between rounded-3xl flex flex-col p-4 items-start gap-2">
          <h1 className="text-white leading-relaxed">Offline Payments</h1>
          <div className="flex items-center justify-between w-full">
            <IconCoin className="w-6 h-6 text-white" />
            <IconCash className="w-6 h-6 text-white" />
            <IconCashBanknote className="w-6 h-6 text-white" />
            <IconMoneybag className="w-6 h-6 text-white" />
          </div>
          <p className="text-background/90 text-xs leading-relaxed">
            Pay for goods and services offline with no internet connection.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

function BottomHero() {
  const { customer } = useCustomerStore();
  return (
    <AnimatePresence mode="wait">
      {customer === "merchant" ? (
        <MerchantFeatures key="merchant" />
      ) : (
        <CustomerFeatures key="customer" />
      )}
    </AnimatePresence>
  );
}

export default BottomHero;
