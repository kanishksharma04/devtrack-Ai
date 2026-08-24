import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Builds a safe, client-facing error message for a caught value of unknown
 * type. Every call site in this codebase feeds the result straight into an
 * API error response, and the real message can carry internal details
 * (Prisma query text, stack traces, upstream API bodies) that shouldn't
 * reach the client — so only `fallback` is ever returned. The real error is
 * logged server-side here so routes that don't do their own logging don't
 * lose visibility entirely.
 */
export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  console.error(error);
  return fallback;
}

/** Extracts a Prisma-style error `code` (e.g. "P2025") from a caught value, if present. */
export function getErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}
