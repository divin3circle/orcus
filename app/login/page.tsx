import { GalleryVerticalEnd } from "lucide-react";
import loginImage from "@/public/businesshero.png";
import logo from "@/public/dark-logo.png";

import { LoginForm } from "@/components/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center gap-1 px-2">
          <div className="bg-foreground p-1 rounded-xl">
            <Image src={logo} alt="logo" width={42} height={42} />
          </div>
          <p className="text-2xl font-semibold">Orcus</p>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted hidden lg:flex items-center justify-center">
        <img
          src={loginImage.src}
          alt="Image"
          className="object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
