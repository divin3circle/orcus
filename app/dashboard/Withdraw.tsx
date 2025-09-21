import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function Withdraw() {
  return (
    <div className="border border-foreground/30 rounded-xl p-2 h-auto xl:h-[45%]">
      <h1 className="text-base font-semibold mt-2">Withdraw</h1>
      <div className="flex items-center justify-between mt-2">
        <p className="text-sm text-foreground/80">Withdrawal Limit</p>
        <p className="text-sm text-foreground/80">KES 10,000</p>
      </div>
      <div className="flex items-center justify-between mt-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center cursor-pointer hover:bg-foreground/10 transition-all duration-300 justify-center col bg-foreground/5 font-semibold rounded-md size-20"
          >
            {(index + 1) * 25}%
          </div>
        ))}
      </div>
      <Tabs defaultValue="wallet" className="w-full mt-4">
        <TabsList className="w-full">
          <TabsTrigger
            value="wallet"
            className="[&[data-state=active]]:bg-foreground [&[data-state=active]]:shadow-none [&[data-state=active]]:text-primary-foreground"
          >
            Another Wallet
          </TabsTrigger>
          <TabsTrigger
            value="fiat"
            className="[&[data-state=active]]:bg-foreground [&[data-state=active]]:shadow-none [&[data-state=active]]:text-primary-foreground"
          >
            To Fiat
          </TabsTrigger>
        </TabsList>
        <TabsContent value="wallet" className="flex flex-col gap-2">
          <Select>
            <SelectTrigger className="border-foreground/30 mt-2 shadow-none border-[1px] placeholder:text-foreground/50 w-full">
              <SelectValue placeholder="Choose a Network" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hedera">Hedera</SelectItem>
              <SelectItem value="tron">Tron</SelectItem>
              <SelectItem value="solana">Solana</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Enter account id or wallet address"
            className="border-foreground/30 mt-2 border-[1px] placeholder:text-foreground/50"
          />
          <div className="flex items-center justify-between mt-2 gap-2">
            <Input
              placeholder="Enter the amount in KES"
              type="number"
              min={0}
              max={10000}
              className="border-foreground/30 border-[1px] placeholder:text-foreground/50"
            />
            <Button
              variant="outline"
              className="border-foreground/30 border-[1px] bg-foreground text-background hover:bg-foreground/80"
            >
              Withdraw
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="fiat" className="flex flex-col gap-2">
          <Select>
            <SelectTrigger className="border-foreground/30 mt-2 shadow-none border-[1px] placeholder:text-foreground/50 w-full">
              <SelectValue placeholder="Choose a bank" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mpesa">Mpesa</SelectItem>
              <SelectItem value="equity">Equity Bank</SelectItem>
              <SelectItem value="iandm">I&M Bank</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Enter phone or account number"
            className="border-foreground/30 mt-2 border-[1px] placeholder:text-foreground/50"
          />
          <div className="flex items-center justify-between mt-2 gap-2">
            <Input
              placeholder="Enter the amount in KES"
              type="number"
              min={0}
              max={10000}
              className="border-foreground/30 border-[1px] placeholder:text-foreground/50"
            />
            <Button
              variant="outline"
              className="border-foreground/30 border-[1px] bg-foreground text-background hover:bg-foreground/80"
            >
              Withdraw
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Withdraw;
