import React from "react";
import { ChevronsLeft } from "lucide-react";
import Link from "next/link";
import Header from "@/components/resources/Header";

function page() {
  return (
    <div>
      <Header />
      <div className="max-w-7xl mx-auto my-0 px-1">
        <Link href="/" className="flex items-center gap-1 mt-12">
          <ChevronsLeft className="size-6" />
          <p className="underline underline-offset-4">Back Home</p>
        </Link>
        <div className="mt-12">
          <p className="text-sm text-foreground/70 text-center p-2">
            Soon you will find all the resources you need to get started with
            our Platform.
          </p>
        </div>
      </div>
    </div>
  );
}

export default page;
