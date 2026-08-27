import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, fmt = "MMM d, yyyy") {
  return format(new Date(date), fmt);
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
}

export function formatRelative(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function generateMRN(hospitalSlug: string) {
  const prefix = hospitalSlug.slice(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0");
  return `${prefix}${timestamp}${random}`;
}

export function generateInvoiceNumber(hospitalSlug: string) {
  const prefix = hospitalSlug.slice(0, 3).toUpperCase();
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `INV-${prefix}-${year}-${random}`;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function calculateBMI(weightKg: number, heightCm: number) {
  const heightM = heightCm / 100;
  return (weightKg / (heightM * heightM)).toFixed(1);
}

export function getAgeFromDOB(dob: Date | string) {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export const appointmentStatusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-teal-100 text-teal-700",
  CHECKED_IN: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-orange-100 text-orange-700",
};

export const invoiceStatusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export function truncate(str: string, length: number) {
  return str.length > length ? str.slice(0, length) + "…" : str;
}
