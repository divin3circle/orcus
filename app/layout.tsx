import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat_Alternates } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "./QueryProvider";
import { WalletProvider } from "@/contexts/WalletContext";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserratAlternates = Montserrat_Alternates({
  variable: "--font-montserrat-alternates",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Orcus",
  description: "Making payments simple, stable, everywhere.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserratAlternates.variable} font-montserrat-alternates bg-[#d9d9d9] antialiased`}
      >
        <AuthProvider>
          <WalletProvider>
            <QueryProvider>{children}</QueryProvider>
            <Toaster />
          </WalletProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
