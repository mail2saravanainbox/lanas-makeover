/**
 * ADMIN SESSION
 *
 * One shared password, one derived cookie token. Deliberately small: /admin is
 * a read-only surface, so this is a gate on a door, not an identity system.
 * The moment /admin can WRITE anything, replace this with real per-user auth.
 *
 * The cookie never carries the password. It carries a hash of it, so a stolen
 * cookie cannot be turned back into the secret, and rotating ADMIN_PASSWORD
 * invalidates every existing session for free.
 *
 * Runs in the Edge runtime (Proxy) and in Node (the login route), so it uses
 * Web Crypto only.
 */

export const ADMIN_COOKIE = "lm_admin";
/** Twelve hours — one working day, not one month. */
export const ADMIN_MAX_AGE = 60 * 60 * 12;

/** Derives the cookie value from the configured password. */
export async function sessionToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`lm-admin-v1:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Length-independent, content-constant-time comparison. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
