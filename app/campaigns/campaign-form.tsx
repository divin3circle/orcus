"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronLeft,
  ChevronRight,
  Target,
  ImageIcon,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockShops } from "@/mocks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const campaignSchema = z.object({
  shop_id: z.string().min(1, "Please select a shop"),
  name: z
    .string()
    .min(1, "Campaign name is required")
    .max(50, "Name must be less than 50 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  target_tokens: z.number().min(1, "Target tokens must be at least 1"),
  icon: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  banner_image_url: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

function Step1({ form, onNext }: { form: any; onNext: () => void }) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = form;
  const selectedShop = watch("shop_id");

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Target className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Create Campaign</h1>
        <p className="text-muted-foreground">Step 1 of 2: Basic Information</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="shop_id">Select Shop</Label>
          <Select onValueChange={(value) => setValue("shop_id", value)}>
            <SelectTrigger className="shadow-none border-foreground/30 border-[1px] w-full md:w-1/2">
              <SelectValue placeholder="Select a shop" />
            </SelectTrigger>
            <SelectContent className="shadow-none border-foreground/10 border-[1px]">
              {mockShops.map((shop) => (
                <SelectItem key={shop.id} value={shop.id}>
                  <div className="flex items-center gap-2">
                    <img
                      src={shop.profile_image_url}
                      alt={shop.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    {shop.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.shop_id && (
            <p className="text-sm text-destructive">{errors.shop_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Campaign Name</Label>
          <Input
            id="name"
            placeholder="e.g., Summer Sale 2024"
            {...register("name")}
            className={cn(
              errors.name && "border-destructive",
              "shadow-none border-foreground/30 border-[1px]"
            )}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your campaign goals and what customers can expect..."
            rows={4}
            {...register("description")}
            className={cn(
              errors.description && "border-destructive",
              "shadow-none border-foreground/30 border-[1px]"
            )}
          />
          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="target_tokens">Target Tokens</Label>
          <Input
            id="target_tokens"
            type="number"
            placeholder="10000"
            {...register("target_tokens", { valueAsNumber: true })}
            className={cn(
              errors.target_tokens && "border-destructive",
              "shadow-none border-foreground/30 border-[1px]"
            )}
          />
          {errors.target_tokens && (
            <p className="text-sm text-destructive">
              {errors.target_tokens.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Set the number of tokens you want to distribute in this campaign
          </p>
        </div>
      </div>

      <Button
        onClick={onNext}
        className="w-full bg-foreground text-background hover:bg-foreground/90"
        disabled={!selectedShop}
      >
        Continue
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

function Step2({
  form,
  onBack,
  onSubmit,
}: {
  form: any;
  onBack: () => void;
  onSubmit: (data: CampaignFormData) => void;
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = form;

  const iconUrl = watch("icon");
  const bannerUrl = watch("banner_image_url");

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Campaign Assets</h1>
        <p className="text-muted-foreground">Step 2 of 2: Add Images</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="icon">Campaign Icon URL</Label>
          {!iconUrl ? (
            <Input
              id="icon"
              type="url"
              placeholder="https://example.com/icon.png"
              {...register("icon")}
              className={cn(
                errors.icon && "border-destructive",
                "shadow-none border-foreground/30 border-[1px]"
              )}
            />
          ) : (
            <div className="space-y-2">
              <div className="relative w-20 h-20 mx-auto">
                <img
                  src={iconUrl}
                  alt="Campaign icon"
                  className="w-full h-full object-cover rounded-lg border border-foreground/20"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  form.setValue("icon", "");
                }}
                className="w-full text-xs bg-transparent border-foreground/30 border-[1px] hover:bg-foreground/5"
              >
                Change Icon
              </Button>
            </div>
          )}
          {errors.icon && (
            <p className="text-sm text-destructive">{errors.icon.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Square image (recommended: 100x100px)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="banner_image_url">Banner Image URL</Label>
          {!bannerUrl ? (
            <Input
              id="banner_image_url"
              type="url"
              placeholder="https://example.com/banner.png"
              {...register("banner_image_url")}
              className={cn(
                errors.banner_image_url && "border-destructive",
                "shadow-none border-foreground/30 border-[1px]"
              )}
            />
          ) : (
            <div className="space-y-2">
              <div className="relative w-full h-32">
                <img
                  src={bannerUrl}
                  alt="Campaign banner"
                  className="w-full h-full object-cover rounded-lg border border-foreground/20"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  form.setValue("banner_image_url", "");
                }}
                className="w-full text-xs bg-transparent border-foreground/30 border-[1px] hover:bg-foreground/5"
              >
                Change Banner
              </Button>
            </div>
          )}
          {errors.banner_image_url && (
            <p className="text-sm text-destructive">
              {errors.banner_image_url.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Wide banner image (recommended: 800x200px)
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 bg-transparent border-foreground/30 border-[1px] hover:bg-foreground/5"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          className="flex-1 bg-foreground text-background hover:bg-foreground/90"
        >
          Create Campaign
        </Button>
      </div>
    </div>
  );
}

export function CampaignForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      shop_id: "",
      name: "",
      description: "",
      target_tokens: 0,
      icon: "",
      banner_image_url: "",
    },
  });

  const handleNext = () => {
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = (data: CampaignFormData) => {
    console.log("Campaign data:", data);
    // Here you would typically send the data to your API
    toast.success("Campaign created successfully!");
    router.push("/dashboard");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex justify-center mb-4">
        <div className="flex items-center space-x-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              currentStep >= 1
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground"
            )}
          >
            1
          </div>
          <div
            className={cn(
              "w-16 h-1 rounded",
              currentStep >= 2 ? "bg-foreground" : "bg-muted"
            )}
          />
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              currentStep >= 2
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground"
            )}
          >
            2
          </div>
        </div>
      </div>

      {currentStep === 1 && <Step1 form={form} onNext={handleNext} />}
      {currentStep === 2 && (
        <Step2 form={form} onBack={handleBack} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
