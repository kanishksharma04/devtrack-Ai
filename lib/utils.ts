import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Extracts a human-readable message from a caught value of unknown type. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (error instanceof Error) return error.message || fallback;
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
