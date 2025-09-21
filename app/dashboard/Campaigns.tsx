import { mockCampaigns } from "@/mocks";
import React from "react";
import CampaignCard from "./CampaignCard";

function Campaigns() {
  return (
    <div className="border border-foreground/30 rounded-xl p-2 h-auto xl:h-[60%]">
      <h1 className="text-base font-semibold">Campaigns</h1>
      <div className="flex flex-col gap-2 mt-4">
        {mockCampaigns.slice(0, 2).map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
}

export default Campaigns;
