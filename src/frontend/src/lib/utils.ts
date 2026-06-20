import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function classificationColor(c: string) {
  if (c === "malicious") return "text-red-400 bg-red-500/10 border-red-500/30";
  if (c === "suspicious") return "text-amber-400 bg-amber-500/10 border-amber-500/30";
  return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
}

export function riskColor(score: number) {
  if (score > 60) return "text-red-400";
  if (score > 30) return "text-amber-400";
  return "text-emerald-400";
}
