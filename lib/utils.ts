import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercentage(value: number, fractionDigits = 0) {
  return `${(value * 100).toFixed(fractionDigits)}%`;
}

export function safeJson<T>(value: unknown, fallback: T): T {
  try {
    return JSON.parse(String(value));
  } catch {
    return fallback;
  }
}

