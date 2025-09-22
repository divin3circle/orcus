"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, ChevronRight, Store, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const shopSchema = z.object({
  name: z
    .string()
    .min(1, "Shop name is required")
    .max(50, "Name must be less than 50 characters"),
  theme: z.string().min(1, "Please select a theme"),
  profile_image_url: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
});

type ShopFormData = z.infer<typeof shopSchema>;

const themes = [
  { value: "red", label: "Red" },
  { value: "blue", label: "Blue" },
];

function Step1({ form, onNext }: { form: any; onNext: () => void }) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = form;
  const selectedTheme = watch("theme");

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Store className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Create Shop</h1>
        <p className="text-muted-foreground">Step 1 of 2: Basic Information</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Shop Name</Label>
          <Input
            id="name"
            placeholder="e.g., My Awesome Store"
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
          <Label htmlFor="theme">Theme</Label>
          <Select onValueChange={(value) => setValue("theme", value)}>
            <SelectTrigger className="shadow-none border-foreground/30 border-[1px] w-full md:w-1/2">
              <SelectValue placeholder="Choose a theme" />
            </SelectTrigger>
            <SelectContent className="shadow-none border-foreground/10 border-[1px]">
              {themes.map((theme) => (
                <SelectItem key={theme.value} value={theme.value}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: theme.value === "red" ? "red" : "blue",
                      }}
                    />
                    {theme.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.theme && (
            <p className="text-sm text-destructive">{errors.theme.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Choose a visual theme that matches your brand
          </p>
        </div>
      </div>

      <Button
        onClick={onNext}
        className="w-full bg-foreground text-background hover:bg-foreground/90"
        disabled={!selectedTheme}
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
  onSubmit: (data: ShopFormData) => void;
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = form;

  const profileImageUrl = watch("profile_image_url");

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Shop Branding</h1>
        <p className="text-muted-foreground">Step 2 of 2: Add Profile Image</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="profile_image_url">Profile Image URL</Label>
          {!profileImageUrl ? (
            <Input
              id="profile_image_url"
              type="url"
              placeholder="https://example.com/profile.png"
              {...register("profile_image_url")}
              className={cn(
                errors.profile_image_url && "border-destructive",
                "shadow-none border-foreground/30 border-[1px]"
              )}
            />
          ) : (
            <div className="space-y-2">
              <div className="relative w-24 h-24 mx-auto">
                <img
                  src={profileImageUrl}
                  alt="Shop profile"
                  className="w-full h-full object-cover rounded-full border border-foreground/20"
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
                  form.setValue("profile_image_url", "");
                }}
                className="w-full text-xs bg-transparent border-foreground/30 border-[1px] hover:bg-foreground/5"
              >
                Change Image
              </Button>
            </div>
          )}
          {errors.profile_image_url && (
            <p className="text-sm text-destructive">
              {errors.profile_image_url.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Square image (recommended: 200x200px)
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
          Create Shop
        </Button>
      </div>
    </div>
  );
}

export function ShopForm({ className, ...props }: React.ComponentProps<"div">) {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const form = useForm<ShopFormData>({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      name: "",
      theme: "",
      profile_image_url: "",
    },
  });

  const handleNext = () => {
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = (data: ShopFormData) => {
    console.log("Shop data:", data);
    // Here you would typically send the data to your API

    toast.success("Shop created successfully!");
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
