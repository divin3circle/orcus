"use client";
import { Campaign } from "@/hooks/useCampaigns";
import { useGetShopByID } from "@/hooks/useMyShops";
import React from "react";
import Link from "next/link";

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="flex items-start justify-between p-2 rounded-lg hover:bg-foreground/5 transition-all duration-300"
    >
      <div className="flex items-center gap-2">
        <img
          src={campaign.icon}
          alt={campaign.name}
          className="size-10 rounded-full"
        />
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold">
            {campaign.name.slice(0, 10)}...
          </h1>
          <h1 className="text-sm text-foreground/80">
            {formatDate(campaign.created_at)}
          </h1>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1">
          <h1 className="text-sm font-semibold">{campaign.token_id}</h1>
          <p className="text-sm font-semibold">
            {campaign.distributed.toLocaleString()}
          </p>
        </div>
        <p className="text-xs text-foreground/80">
          {campaign.id.slice(0, 4)}...{campaign.id.slice(-4)}
        </p>
      </div>
    </Link>
  );
}

export default CampaignCard;
