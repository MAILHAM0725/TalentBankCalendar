export const ADMIN_COOKIE = "tb_admin_auth";

/**
 * Uses the Web Crypto API (not Node's `crypto` module) so the exact same
 * function works both in middleware, which runs on the Edge runtime, and in
 * regular API routes.
 */
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** The value a valid session cookie must equal — a hash of the shared admin password. */
export async function expectedAdminToken(): Promise<string | null> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return sha256Hex(password);
}
