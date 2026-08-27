import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string) {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function nightsBetween(checkIn: Date, checkOut: Date) {
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}
