import CampaignCard from "@/app/dashboard/CampaignCard";
import { mockCampaigns } from "@/mocks";
import React from "react";

function ShopCampaign() {
  return (
    <div className=" p-2 w-full md:w-[45%] h-full">
      <h1 className="text-base font-semibold">Latest Campaigns</h1>
      <div className="flex flex-col gap-2 mt-4">
        {mockCampaigns.slice(0, 2).map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
}

export default ShopCampaign;
