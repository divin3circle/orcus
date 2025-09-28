"use client";
import { Campaign } from "@/hooks/useCampaigns";
import { useGetShopByID, useSingleShop } from "@/hooks/useMyShops";
import React from "react";
import Link from "next/link";
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
import { Progress } from "@/components/ui/progress";
import {
  IconCopy,
  IconTarget,
  IconUsers,
  IconTrophy,
  IconX,
  IconEye,
} from "@tabler/icons-react";
import { ChevronsUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const { data: shop } = useGetShopByID(campaign.shop_id);
  const { userCampaignsEntry } = useSingleShop(campaign.shop_id);
  const router = useRouter();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const progressPercentage = () => {
    const percentage = campaign.distributed / campaign.target;
    return percentage * 100;
  };

  const isEnded = campaign.ended === 1;

  if (!shop || !campaign)
    return (
      <div className="">
        <p className="text-sm text-foreground/50">No shop found</p>
      </div>
    );

  const handleCopy = (item: string) => {
    navigator.clipboard.writeText(item);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex items-start justify-between p-2 rounded-lg hover:bg-foreground/5 transition-all duration-300">
      <div className="flex items-center gap-2">
        <img
          src={campaign.icon}
          alt={campaign.name}
          className="size-10 rounded-full border border-foreground/30"
        />
        <div className="flex flex-col">
          <Drawer>
            <DrawerTrigger className="flex flex-col items-start">
              <p className="text-sm font-semibold">
                {campaign.name.slice(0, 15)}...
              </p>
              <p className="text-sm text-foreground/80">
                {campaign.ended === 1 ? "Ended" : "Active"}
              </p>
            </DrawerTrigger>
            <DrawerContent className="bg-[#d9d9d9]">
              <DrawerHeader>
                <DrawerTitle className="">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">Campaign Details</p>
                    {!isEnded ? (
                      <Button
                        className="border-none bg-transparent shadow-none text-foreground hover:bg-foreground/90 flex items-center gap-1"
                        onClick={() => {
                          router.push(`/shops/${campaign.shop_id}`);
                        }}
                      >
                        View Shop
                        <IconEye className="size-4" />
                      </Button>
                    ) : (
                      <Button
                        className="border-none bg-transparent shadow-none text-foreground hover:bg-foreground/90 flex items-center gap-1"
                        disabled
                      >
                        Campaign Ended
                        <IconTrophy className="size-4" />
                      </Button>
                    )}
                  </div>
                </DrawerTitle>
                <DrawerDescription className="md:w-[500px] w-full mx-auto my-0 flex flex-col gap-2 items-center justify-center">
                  <div className="flex flex-col gap-2 max-w-md mx-auto">
                    <div className="rounded-full size-20 bg-foreground flex items-center justify-center">
                      <ChevronsUp className="size-6 text-lime-500" />
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80">
                    Campaign Progress
                  </p>
                  <div className="flex items-center gap-1">
                    <p className="text-lg font-semibold text-foreground/80">
                      {campaign.distributed?.toLocaleString()}
                    </p>
                    <h1 className="text-3xl font-semibold">
                      / {campaign.target?.toLocaleString()}
                    </h1>
                  </div>
                  <div className="border p-2.5 rounded-3xl border-foreground/30 flex items-center gap-1 mb-4">
                    <img
                      src={campaign.icon}
                      alt={campaign.name}
                      className="size-6 rounded-full"
                    />
                    <p className="text-sm">{campaign.name}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-foreground/5 p-4 rounded-3xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-foreground/80">Progress</p>
                      <p className="text-sm font-semibold">
                        {progressPercentage().toFixed(1)}%
                      </p>
                    </div>
                    <Progress value={progressPercentage()} className="h-2" />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-foreground/60">
                        {campaign.distributed?.toLocaleString()} distributed
                      </p>
                      <p className="text-xs text-foreground/60">
                        {campaign.target?.toLocaleString()} target
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col bg-foreground/5 p-4 gap-3 rounded-3xl w-full">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-sm text-foreground/80">Campaign ID</p>
                      <p className="text-sm font-semibold flex items-center gap-1">
                        {campaign.id.slice(0, 4)}...{campaign.id.slice(-4)}
                        <IconCopy
                          className="size-4"
                          onClick={() => handleCopy(campaign.id)}
                        />
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-foreground/80">Token ID</p>
                      <p className="text-sm font-semibold flex items-center gap-1">
                        {campaign.token_id}
                        <IconCopy
                          className="size-4"
                          onClick={() => handleCopy(campaign.token_id)}
                        />
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-foreground/80">Participants</p>
                      <p className="text-sm font-semibold flex items-center gap-1">
                        {userCampaignsEntry?.length}
                        <IconUsers className="size-4" />
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-foreground/80">Status</p>
                      <p className="text-sm font-semibold flex items-center gap-1">
                        {isEnded ? "Ended" : "Active"}
                        {isEnded ? (
                          <IconX className="size-4 text-red-500" />
                        ) : (
                          <IconTrophy className="size-4 text-green-500" />
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col bg-foreground/5 p-4 gap-3 rounded-3xl w-full">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-sm text-foreground/80">Shop</p>
                      <p className="text-sm font-semibold flex items-center gap-1">
                        {shop.name}
                        <img
                          src={shop.profile_image_url}
                          alt={shop.name}
                          className="size-4 rounded-full"
                        />
                      </p>
                    </div>
                    <div className="flex items-start flex-col">
                      <p className="text-sm font-semibold text-foreground/80">
                        Description
                      </p>
                      <p className="text-sm font-normal">
                        {campaign.description}
                      </p>
                    </div>
                  </div>
                </DrawerDescription>
              </DrawerHeader>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1">
          <h1 className="text-sm font-semibold">{campaign.token_id}</h1>
        </div>
        <p className="text-xs text-foreground/80">
          {campaign.id.slice(0, 4)}...{campaign.id.slice(-4)}
        </p>
      </div>
    </div>
  );
}

export default CampaignCard;
