import { CampaignForm } from "./campaign-form";

export default function CreateCampaignPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-md">
        <CampaignForm />
      </div>
    </div>
  );
}
