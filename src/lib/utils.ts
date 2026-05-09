/**
 * Shared frontend utilities.
 * Functions: cn for className merging; createId for runtime-safe IDs without browser UUID API calls.
 * Dependencies: clsx and tailwind-merge.
 * Maintenance note: createId must work in older embedded browsers with incomplete crypto support.
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createId(prefix = 'id') {
  const bytes = new Uint32Array(2);
  globalThis.crypto?.getRandomValues?.(bytes);
  const random = bytes[0] || Math.floor(Math.random() * 0xffffffff);
  const extra = bytes[1] || Math.floor(Math.random() * 0xffffffff);
  return `${prefix}-${Date.now().toString(36)}-${random.toString(36)}${extra.toString(36)}`;
}
