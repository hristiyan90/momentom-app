import { createHash } from 'crypto';

/**
 * Converts a value to canonical JSON string with sorted object keys
 * @param value - The value to serialize
 * @returns Canonical JSON string with deterministic ordering
 */
export function canonicalJson(value: unknown): string {
  if (value === null || value === undefined) {
    return JSON.stringify(value);
  }
  
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return JSON.stringify(value);
  }
  
  if (Array.isArray(value)) {
    const items = value.map(item => canonicalJson(item));
    return `[${items.join(',')}]`;
  }
  
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const sortedKeys = Object.keys(obj).sort();
    const pairs = sortedKeys.map(key => `${JSON.stringify(key)}:${canonicalJson(obj[key])}`);
    return `{${pairs.join(',')}}`;
  }
  
  // Fallback for other types (functions, symbols, etc.)
  return JSON.stringify(value);
}

/**
 * Computes ETag from a string body using SHA256 hash
 * @param body - The string body to hash
 * @returns ETag string wrapped in quotes
 */
export function computeEtagFromBody(body: string): string {
  const hash = createHash('sha256').update(body).digest('base64url');
  return `"${hash}"`;
}

/**
 * Generates ETag and canonical JSON body for a value
 * @param value - The value to process
 * @returns Object containing ETag and canonical JSON body
 */
export function etagFor(value: unknown): { etag: string; body: string } {
  const body = canonicalJson(value);
  const etag = computeEtagFromBody(body);
  return { etag, body };
}
