"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ChevronLeft, Wallet, LogOut, ChevronDown, Globe } from "lucide-react";

import { cn, countries } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import logo from "@/public/dark-logo.png";
import { useWallet } from "@/contexts/WalletContext";
import { useRegister } from "@/hooks/useRegister";
import { IconLoader2 } from "@tabler/icons-react";

const registerSchema = z
  .object({
    username: z.string().min(2, {
      message: "Username must be at least 2 characters.",
    }),
    password: z.string().min(4, {
      message: "Password must be at least 4 characters.",
    }),
    confirmPassword: z.string(),
    profileImageUrl: z.string(),
    bannerImageUrl: z.string(),
    countryCode: z.string().min(1, {
      message: "Please select a country code.",
    }),
    mobileNumber: z.string().min(7, {
      message: "Please enter a valid mobile number.",
    }),
    walletAddress: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const countryCodes = countries.map((country) => ({
  code: `+${country.code}`,
  country: country.shortCode,
  flag: country.flag,
  name: country.name,
}));

const Step1 = ({ form, onNext }: { form: any; onNext: () => void }) => {
  const watchedFields = form.watch(["username", "password", "confirmPassword"]);
  const [username, password, confirmPassword] = watchedFields;

  const canContinue =
    username?.trim() && password?.trim() && confirmPassword?.trim();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="sylus abel"
                  className="border-foreground/30 border-[1px] placeholder:text-foreground/50"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  className="border-foreground/30 border-[1px] placeholder:text-foreground/50"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  className="border-foreground/30 border-[1px] placeholder:text-foreground/50"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Button
        type="button"
        onClick={onNext}
        className="w-full bg-foreground text-background hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!canContinue}
      >
        Continue
      </Button>

      <div className="">
        <p className="text-xs leading-relaxed text-foreground/80">
          This step form will take you through the process of creating your
          merchant account on Orcus.
        </p>
      </div>
    </div>
  );
};

const Step2 = ({
  form,
  onNext,
  onPrev,
}: {
  form: any;
  onNext: () => void;
  onPrev: () => void;
}) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  const watchedFields = form.watch(["profileImageUrl", "bannerImageUrl"]);
  const [profileImageUrl, bannerImageUrl] = watchedFields;

  const handleImageUrlChange = (url: string, type: "profile" | "banner") => {
    if (url && url.startsWith("http")) {
      if (type === "profile") {
        setProfileImage(url);
      } else {
        setBannerImage(url);
      }
    }
  };
  const canContinue = true;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="profileImageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Image URL</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  {!profileImage ? (
                    <Input
                      placeholder="https://example.com/profile.jpg"
                      className="border-foreground/30 border-[1px] placeholder:text-foreground/50"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleImageUrlChange(e.target.value, "profile");
                      }}
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-foreground/20">
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="object-cover"
                          onError={() => setProfileImage(null)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setProfileImage(null);
                          field.onChange("");
                        }}
                        className="border-foreground/30 border-[1px] text-sm bg-transparent hover:bg-foreground/5"
                      >
                        Change Image
                      </Button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bannerImageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banner Image URL</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  {!bannerImage ? (
                    <Input
                      placeholder="https://example.com/banner.jpg"
                      className="border-foreground/30 border-[1px] placeholder:text-foreground/50"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleImageUrlChange(e.target.value, "banner");
                      }}
                    />
                  ) : (
                    <div className="space-y-3">
                      <div className="relative w-full h-24 rounded-lg overflow-hidden border-[1px] border-foreground/20">
                        <img
                          src={bannerImage}
                          alt="Banner"
                          className="object-cover"
                          onError={() => setBannerImage(null)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setBannerImage(null);
                          field.onChange("");
                        }}
                        className="border-foreground/30 border-[1px] text-sm bg-transparent hover:bg-foreground/5"
                      >
                        Change Banner
                      </Button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          className="flex-1 border-foreground/30 border-[1px] bg-transparent hover:bg-foreground/5"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          type="button"
          onClick={onNext}
          className="flex-1 bg-foreground text-background hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canContinue}
        >
          Continue
        </Button>
      </div>

      <div className="">
        <p className="text-xs leading-relaxed text-foreground/80">
          Curious why you need a banner and profile image?
        </p>
        <a
          href="#"
          className="underline underline-offset-4 text-blue-500 text-xs"
        >
          See Our Resources Section
        </a>
      </div>
    </div>
  );
};

const Step3 = ({
  form,
  onPrev,
  onSubmit,
}: {
  form: any;
  onPrev: () => void;
  onSubmit: (data: RegisterFormData) => void;
}) => {
  const { isConnected, accountId, isLoading, connect, disconnect } =
    useWallet();
  const registerMutation = useRegister();

  const watchedFields = form.watch(["countryCode", "mobileNumber"]);
  const [countryCode, mobileNumber] = watchedFields;

  React.useEffect(() => {
    if (isConnected && accountId) {
      form.setValue("walletAddress", accountId);
    } else if (!isConnected) {
      form.setValue("walletAddress", "");
    }
  }, [isConnected, accountId, form]);

  const handleWalletConnect = async () => {
    if (!isConnected) {
      await connect();
    } else {
      await disconnect();
    }
  };

  const handleSubmit = async (data: RegisterFormData) => {
    const extractedAccountId = accountId?.match(/\(([^)]+)\)/)?.[1] || "";

    const registerData = {
      username: data.username,
      mobile_number: `${data.countryCode}${data.mobileNumber}`,
      password: data.password,
      account_id: extractedAccountId,
      profile_image_url: data.profileImageUrl || "",
      account_banner_image_url: data.bannerImageUrl || "",
    };

    registerMutation.mutate(registerData);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-4">
          <FormLabel>Mobile Phone Number</FormLabel>
          <div className="flex gap-3">
            <FormField
              control={form.control}
              name="countryCode"
              render={({ field }) => (
                <FormItem className="w-20">
                  <FormControl>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between border-foreground/30 border-[1px] bg-transparent hover:bg-foreground/5"
                        >
                          <div className="flex items-center gap-1">
                            {field.value ? (
                              <span className="text-sm">{field.value}</span>
                            ) : (
                              <Globe className="w-4 h-4" />
                            )}
                          </div>
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64 max-h-60 overflow-y-auto">
                        {countryCodes.map((country) => (
                          <DropdownMenuItem
                            key={country.code}
                            onClick={() => field.onChange(country.code)}
                            className="flex items-center gap-3 cursor-pointer hover:bg-foreground/5"
                          >
                            <span className="text-lg">{country.flag}</span>
                            <span className="font-medium">{country.code}</span>
                            <span className="text-foreground/70">
                              {country.name}
                            </span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="701838690"
                      className="border-foreground/30 border-[1px] placeholder:text-foreground/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Connect Wallet</Label>
          <Button
            type="button"
            variant="outline"
            onClick={handleWalletConnect}
            className="w-full border-foreground/30 border-[1px] bg-transparent hover:bg-foreground/5"
          >
            {isLoading ? (
              <>
                <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : isConnected ? (
              <>
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </>
            )}
          </Button>
          {isConnected && (
            <div className="text-sm text-foreground/70 p-3 bg-foreground/5 rounded-lg">
              Connected: {accountId}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          className="flex-1 border-foreground/30 border-[1px] bg-transparent hover:bg-foreground/5"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          type="button"
          onClick={async () => {
            const isValid = await form.trigger();
            if (isValid) {
              const formData = form.getValues();
              handleSubmit(formData);
            }
          }}
          className="flex-1 bg-foreground text-background hover:bg-foreground/80 disabled:cursor-not-allowed"
          disabled={!isConnected || registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <>
              <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </div>

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking Create Account, you agree to our{" "}
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
};

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      profileImageUrl: "",
      bannerImageUrl: "",
      countryCode: "",
      mobileNumber: "",
      walletAddress: "",
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    console.log("Form submitted:", data);
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 form={form} onNext={nextStep} />;
      case 2:
        return <Step2 form={form} onNext={nextStep} onPrev={prevStep} />;
      case 3:
        return <Step3 form={form} onPrev={prevStep} onSubmit={onSubmit} />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form {...form}>
        <form>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1 px-2">
                <div className="bg-foreground p-1 rounded-xl">
                  <Image src={logo} alt="logo" width={42} height={42} />
                </div>
                <p className="text-2xl font-semibold">Orcus</p>
              </div>
              <h1 className="text-xl font-bold">Welcome to Orcus</h1>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Sign in
                </a>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    step === currentStep
                      ? "bg-foreground text-background"
                      : step < currentStep
                      ? "bg-foreground/20 text-foreground"
                      : "bg-foreground/10 text-foreground/50"
                  )}
                >
                  {step}
                </div>
              ))}
            </div>

            {renderStep()}
          </div>
        </form>
      </Form>
    </div>
  );
}
