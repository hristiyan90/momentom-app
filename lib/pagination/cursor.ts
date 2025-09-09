/**
 * Cursor-based pagination utilities
 * Provides safe encoding/decoding of pagination cursors using base64url encoding
 */

/**
 * Encode a cursor object to a base64url string
 * @param obj - Object containing date and id fields for pagination
 * @returns Base64url encoded cursor string
 */
export function encodeCursor(obj: { d: string; i: string }): string {
  const json = JSON.stringify(obj);
  const base64 = Buffer.from(json, 'utf8').toString('base64');
  // Convert to base64url (replace + with -, / with _, remove padding =)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Decode a cursor string to an object
 * @param s - Base64url encoded cursor string
 * @returns Decoded object with date and id fields, or null if invalid
 */
export function decodeCursor(s: string): { d: string; i: string } | null {
  try {
    // Convert from base64url to base64 (add padding back, replace - with +, _ with /)
    const base64 = s.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    const json = Buffer.from(padded, 'base64').toString('utf8');
    const parsed = JSON.parse(json);
    
    // Validate the parsed object has required fields
    if (typeof parsed === 'object' && parsed !== null && 
        typeof parsed.d === 'string' && typeof parsed.i === 'string') {
      return { d: parsed.d, i: parsed.i };
    }
    
    return null;
  } catch {
    // Return null for any parsing errors
    return null;
  }
}
