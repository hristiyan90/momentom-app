import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a correlation ID for request tracing
 * Returns a UUID v4 string for request correlation
 */
export function generateCorrelationId(): string {
  return crypto.randomUUID()
}
