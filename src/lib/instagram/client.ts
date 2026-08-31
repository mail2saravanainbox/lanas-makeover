import "server-only";

/**
 * Instagram Graph API client — SERVER ONLY.
 *
 * `import "server-only"` makes it a build error for any client component to
 * pull this module in, which is the hard guarantee that the access token can
 * never reach the browser.
 *
 * Requires an Instagram **Professional** account (@lanasmakeover is one) linked
 * through a Meta app. Configure, never in NEXT_PUBLIC_*:
 *
 *   INSTAGRAM_ACCESS_TOKEN=<long-lived token>
 *   INSTAGRAM_USER_ID=<ig user id>
 *   INSTAGRAM_SYNC_SECRET=<your own shared secret for POST /api/instagram/sync>
 */

const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.instagram.com/${GRAPH_VERSION}`;

export const MEDIA_FIELDS = [
  "id",
  "caption",
  "media_type",
  "media_url",
  "thumbnail_url",
  "permalink",
  "timestamp",
  "username",
].join(",");

export interface RawInstagramMedia {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  username?: string;
}

export interface InstagramCredentials {
  accessToken: string;
  userId: string;
}

export function readCredentials(): InstagramCredentials | null {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;
  if (!accessToken || !userId) return null;
  return { accessToken, userId };
}

export class InstagramApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "InstagramApiError";
  }
}

/**
 * Fetch one page of media. Returns the items plus the cursor for the next page.
 * Never throws on a network hiccup without context — callers get a typed error.
 */
async function fetchPage(
  creds: InstagramCredentials,
  after?: string,
  limit = 50,
): Promise<{ data: RawInstagramMedia[]; next?: string }> {
  const url = new URL(`${GRAPH_BASE}/${creds.userId}/media`);
  url.searchParams.set("fields", MEDIA_FIELDS);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("access_token", creds.accessToken);
  if (after) url.searchParams.set("after", after);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      // Never cached at the fetch layer — the sync route owns caching.
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
  } catch (cause) {
    throw new InstagramApiError(
      `Network error contacting the Instagram Graph API: ${(cause as Error).message}`,
      0,
    );
  }

  const body: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (body as { error?: { message?: string } } | null)?.error?.message ??
      `Instagram Graph API returned ${res.status}`;
    throw new InstagramApiError(message, res.status, body);
  }

  const parsed = body as {
    data?: RawInstagramMedia[];
    paging?: { cursors?: { after?: string }; next?: string };
  };

  return {
    data: parsed.data ?? [],
    // Only advance when Graph actually offers a next page.
    next: parsed.paging?.next ? parsed.paging?.cursors?.after : undefined,
  };
}

/**
 * Walk the media edge with a hard page ceiling so a malformed cursor can never
 * turn into an unbounded loop against Meta's rate limit.
 */
export async function fetchAllMedia(
  creds: InstagramCredentials,
  maxPages = 6,
): Promise<RawInstagramMedia[]> {
  const all: RawInstagramMedia[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < maxPages; page++) {
    const { data, next } = await fetchPage(creds, cursor);
    all.push(...data);
    if (!next) break;
    cursor = next;
  }

  return all;
}
