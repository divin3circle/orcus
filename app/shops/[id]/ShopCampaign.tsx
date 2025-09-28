import CampaignCard from "@/app/dashboard/CampaignCard";
import { Campaign } from "@/hooks/useCampaigns";
import React from "react";

function ShopCampaign({ campaigns }: { campaigns: Campaign[] }) {
  if (campaigns.length === 0)
    return (
      <div className="p-2 w-full md:w-[45%] h-full flex items-center justify-center">
        <p className="text-base mt-4 text-foreground/50">No campaigns found</p>
      </div>
    );
  return (
    <div className=" p-2 w-full md:w-[45%] h-full">
      <h1 className="text-base font-semibold">Latest Campaigns</h1>
      <div className="flex flex-col gap-2 mt-4">
        {campaigns.slice(0, 2).map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
}

export default ShopCampaign;
