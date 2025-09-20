import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const countries = [
  {
    id: 1,
    name: "Kenya",
    code: 254,
    currency: "KES",
    flag: "🇰🇪",
    shortCode: "KE",
  },
  {
    id: 2,
    name: "Uganda",
    code: 256,
    currency: "UGX",
    flag: "🇺🇬",
    shortCode: "UG",
  },
  {
    id: 3,
    name: "Tanzania",
    code: 255,
    currency: "TZS",
    flag: "🇹🇿",
    shortCode: "TZ",
  },
  {
    id: 4,
    name: "Rwanda",
    code: 250,
    currency: "RWF",
    flag: "🇷🇼",
    shortCode: "RW",
  },
  {
    id: 5,
    name: "Burundi",
    code: 257,
    currency: "BIF",
    flag: "🇧🇮",
    shortCode: "BI",
  },
  {
    id: 6,
    name: "Democratic Republic of the Congo",
    code: 243,
    currency: "CDF",
    flag: "🇨🇩",
    shortCode: "CD",
  },
  {
    id: 7,
    name: "Ethiopia",
    code: 251,
    currency: "ETB",
    flag: "🇪🇹",
    shortCode: "ET",
  },
];
