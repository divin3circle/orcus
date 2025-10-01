"use client";
import { Button } from "@/components/ui/button";
import { IconBell } from "@tabler/icons-react";
import React from "react";
import Image from "next/image";
import logo from "@/public/dark-logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import NotificationCard from "./NotificationCard";
import { useMerchant } from "@/hooks/useMerchant";
import { Loader2, LogOut, Wallet } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/hooks/useNotifications";

function DashboardHeader() {
  const { data: merchant, isLoading, error } = useMerchant();
  const {
    isConnected,
    accountId,
    isLoading: isWalletLoading,
    disconnect,
  } = useWallet();
  const {
    data: notifications,
    isLoading: isNotificationsLoading,
    error: notificationsError,
  } = useNotifications();

  if (isLoading) {
    return (
      <div className="w-full items-center justify- flex flex-col mt-1">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }
  if (error || !merchant) {
    return <div>Error: {error?.message}</div>;
  }

  return (
    <div className="w-full flex items-center justify-between mt-4">
      <div className="flex items-center gap-1 px-2">
        <div className="bg-foreground p-1 rounded-lg">
          <Image src={logo} alt="logo" width={30} height={30} />
        </div>
        <p className="text-2xl font-semibold">Orcus</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant={"outline"}
          className="bg-transparent border-[1px] shadow-none hover:bg-foreground/5 border-foreground/50  rounded-full text-foreground hidden md:block"
        >
          {isWalletLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isConnected ? (
            <span className="flex items-center gap-1">
              <LogOut className="w-4 h-4" />
              {accountId}
            </span>
          ) : (
            <Wallet className="w-4 h-4" />
          )}
        </Button>
        <Drawer>
          <DrawerTrigger>
            <Button
              variant="outline"
              size={"icon"}
              className="bg-transparent border-[1px] shadow-none hover:bg-foreground/5 border-foreground/50  rounded-full text-foreground flex items-center justify-center"
            >
              <IconBell />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="bg-[#d9d9d9]">
            <DrawerHeader>
              <DrawerTitle>Notifications</DrawerTitle>
              <a
                href={`https://hashscan.io/testnet/topic/${merchant.topic_id}/messages`}
                target="_blank"
                className="text-sm text-foreground/80 underline"
              >
                Your Topic ID: {merchant.topic_id}
              </a>
              <DrawerDescription>
                Get notified about new campaigns and payments.
              </DrawerDescription>
              {isNotificationsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-5 h-5 mt-8 animate-spin" />
                </div>
              ) : (
                <div className="flex flex-col-reverse gap-2 mt-4 md:w-[500px] w-full mx-auto my-0">
                  {notifications?.slice(0, 5).map((notification) => (
                    <NotificationCard
                      key={notification.timestamp}
                      notification={notification}
                    />
                  ))}
                  {notifications &&
                    notifications?.length &&
                    notifications?.length > 5 && (
                      <p className="text-sm text-foreground/80">
                        +{notifications?.length - 5} More
                      </p>
                    )}
                </div>
              )}
            </DrawerHeader>
            <DrawerFooter className="md:w-[500px] w-full mx-auto my-0">
              <DrawerClose>
                <Button
                  variant="outline"
                  className="bg-foreground text-background hover:text-background hover:bg-foreground/90 w-full"
                >
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <Avatar>
          <AvatarImage
            src={merchant.profile_image_url}
            className="border border-foreground/50 object-cover object-center"
          />
          <AvatarFallback className="bg-foreground text-background flex items-center justify-center font-bold">
            {merchant.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}

export default DashboardHeader;
