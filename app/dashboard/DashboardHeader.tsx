import { Button } from "@/components/ui/button";
import { IconBell } from "@tabler/icons-react";
import React from "react";
import Image from "next/image";
import logo from "@/public/dark-logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function DashboardHeader() {
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
          Connect Wallet
        </Button>
        <Button
          variant="outline"
          size={"icon"}
          className="bg-transparent border-[1px] shadow-none hover:bg-foreground/5 border-foreground/50  rounded-full text-foreground flex items-center justify-center"
        >
          <IconBell />
        </Button>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}

export default DashboardHeader;
