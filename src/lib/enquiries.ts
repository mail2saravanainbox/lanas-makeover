import "server-only";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE ENQUIRY RECORD
 * ═══════════════════════════════════════════════════════════════════════════
 *  Email is an ALERT. This is the RECORD.
 *
 *  A mail can fail to send, land in spam, or be deleted by the person it was
 *  sent to; when it does, the enquiry is gone and a bride is left thinking
 *  nobody read it. The durable copy exists so that the answer to "did anyone
 *  get my message" is never "we hope so".
 *
 *  Backed by Vercel KV / Upstash Redis, which speak the same REST API and the
 *  same two environment variables. Reads and writes both live here so they
 *  cannot disagree about the key or the shape — the API route used to hold
 *  the write inline and there was nothing to read it back.
 *
 *  ⚠ EVERY FUNCTION HERE DEGRADES TO EMPTY, NEVER TO AN ERROR. With no store
 *    configured the site behaves exactly as it does today: the enquiry is
 *    validated, logged and emailed, and this simply reports that it kept no
 *    copy. A storage outage must never cost a bride her enquiry.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** The `enquiries` list, newest first. */
const KEY = "enquiries";

/** What a bridal studio can realistically look back through. */
const CAP = 1000;

export interface StoredEnquiry {
  name: string;
  phone: string;
  email?: string;
  weddingDate: string;
  city: string;
  venue?: string;
  events?: string[];
  weddingType?: string;
  services?: string[];
  whatsapp?: string;
  instagram?: string;
  people?: string;
  message?: string;
  /** ISO 8601, stamped by the endpoint. */
  receivedAt: string;
}

/** True when both halves of the credential are present. */
export function storeIsConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

/**
 * Append one enquiry, newest first, and trim to the cap.
 * Returns whether a copy was actually kept. Never throws.
 */
export async function saveEnquiry(enquiry: StoredEnquiry): Promise<boolean> {
  if (!storeIsConfigured()) return false;

  try {
    const { kv } = await import("@vercel/kv");
    await kv.lpush(KEY, JSON.stringify(enquiry));
    await kv.ltrim(KEY, 0, CAP - 1);
    return true;
  } catch (err) {
    // Logged, not thrown: the enquiry itself has already succeeded.
    console.error("[enquiry] kv write failed", err);
    return false;
  }
}

/** The most recent enquiries, newest first. Empty when unconfigured. */
export async function listEnquiries(limit = 100): Promise<StoredEnquiry[]> {
  if (!storeIsConfigured()) return [];

  try {
    const { kv } = await import("@vercel/kv");
    const rows = await kv.lrange<string | StoredEnquiry>(KEY, 0, limit - 1);

    return (rows ?? [])
      .map((row) => {
        // Upstash parses JSON strings back into objects on the way out; older
        // rows and other clients hand back the raw string. Accept both rather
        // than silently dropping half the archive.
        if (typeof row !== "string") return row;
        try {
          return JSON.parse(row) as StoredEnquiry;
        } catch {
          return null;
        }
      })
      .filter((e): e is StoredEnquiry => Boolean(e?.receivedAt));
  } catch (err) {
    console.error("[enquiry] kv read failed", err);
    return [];
  }
}

/** How many are held in total. -1 when the count could not be read. */
export async function countEnquiries(): Promise<number> {
  if (!storeIsConfigured()) return 0;
  try {
    const { kv } = await import("@vercel/kv");
    return await kv.llen(KEY);
  } catch {
    return -1;
  }
}
