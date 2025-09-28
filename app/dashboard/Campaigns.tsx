import React from "react";
import CampaignCard from "./CampaignCard";
import { useMyCampaigns } from "@/hooks/useCampaigns";
import { Loader2 } from "lucide-react";
import { useMyShops } from "@/hooks/useMyShops";

function Campaigns() {
  const { data: shops, isLoading, error } = useMyShops();
  if (isLoading) {
    return (
      <div className="border border-foreground/30 rounded-xl p-2 flex items-center justify-center h-[55%]">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }
  if (error) {
    return <div>Error: {error?.message}</div>;
  }
  if (shops?.length === 0 || !shops) {
    return (
      <div className="border border-foreground/30 rounded-xl p-2 flex items-center justify-center h-[55%]">
        <p className="text-sm text-foreground/50">No campaigns found</p>
      </div>
    );
  }
  return (
    <div className="border border-foreground/30 rounded-xl p-2 h-auto xl:h-[55%] mb-12 md:mb-0">
      <h1 className="text-base font-semibold">Campaigns</h1>
      <div className="flex flex-col gap-2 mt-4">
        {shops.map((shop) =>
          shop.campaigns
            .slice(0, 2)
            .map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))
        )}
      </div>
    </div>
  );
}

export default Campaigns;
