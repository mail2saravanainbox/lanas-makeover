import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import type { PortfolioItem, SyncSummary } from "@/lib/types";
import { fetchAllMedia, InstagramApiError, readCredentials } from "@/lib/instagram/client";
import { hasChanged, mergeCurated, normalizeMedia } from "@/lib/instagram/normalize";
import { readStore, writeStore } from "@/lib/instagram/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  POST /api/instagram/sync           (§13, §14, §40)
 * ═══════════════════════════════════════════════════════════════════════════
 *  Pulls media from the official Instagram Graph API, normalises it, merges it
 *  over anything already curated, and stores the result.
 *
 *  GUARANTEES
 *   · Credentials are read from the server environment only. The client module
 *     is marked `server-only`, so a token can never be bundled into the browser.
 *   · Authenticated with a shared secret compared in constant time.
 *   · Every newly-imported item arrives `published: false` — a human decides
 *     what reaches the public site.
 *   · Human decisions (published, featured, category, title, alt, slug, weight)
 *     survive every subsequent sync.
 *   · Not called on page render. The site reads the *store*; this route is the
 *     only thing that ever talks to Meta.
 *   · Hard page ceiling in the client prevents runaway pagination.
 *
 *  Configure:
 *    INSTAGRAM_ACCESS_TOKEN · INSTAGRAM_USER_ID · INSTAGRAM_SYNC_SECRET
 *
 *  Call:
 *    curl -X POST https://<host>/api/instagram/sync \
 *      -H "Authorization: Bearer $INSTAGRAM_SYNC_SECRET"
 * ═══════════════════════════════════════════════════════════════════════════
 */

function authorised(request: Request): boolean {
  const secret = process.env.INSTAGRAM_SYNC_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (provided.length !== secret.length) return false;

  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(secret));
  } catch {
    return false;
  }
}

export async function POST(request: Request): Promise<Response> {
  const startedAt = new Date().toISOString();

  if (!authorised(request)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorised. Send Authorization: Bearer <INSTAGRAM_SYNC_SECRET>." },
      { status: 401 },
    );
  }

  const creds = readCredentials();
  if (!creds) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Instagram is not configured. Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID (server-side, never NEXT_PUBLIC_*).",
      },
      { status: 503 },
    );
  }

  const summary: SyncSummary = {
    imported: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    messages: [],
    syncedAt: startedAt,
  };

  try {
    const raw = await fetchAllMedia(creds);
    summary.imported = raw.length;

    const existing = (await readStore()).items;
    const byId = new Map(existing.map((i) => [i.id, i]));
    const next: PortfolioItem[] = [];

    for (const media of raw) {
      try {
        const incoming = normalizeMedia(media);
        const prior = byId.get(incoming.id);

        if (!prior) {
          next.push(incoming);
          summary.created++;
          continue;
        }

        if (hasChanged(prior, incoming)) {
          next.push(mergeCurated(prior, incoming));
          summary.updated++;
        } else {
          next.push(prior);
          summary.skipped++;
        }
      } catch (e) {
        summary.errors++;
        summary.messages.push(`Item ${media.id}: ${(e as Error).message}`);
      }
    }

    // Anything already curated but no longer returned by Graph is retained,
    // so deleting a post on Instagram never silently empties the website.
    for (const prior of existing) {
      if (!next.some((i) => i.id === prior.id)) {
        next.push(prior);
        summary.messages.push(`Retained ${prior.id} — no longer returned by Instagram.`);
      }
    }

    await writeStore(next, startedAt);

    summary.messages.unshift(
      `${summary.created} new item(s) imported unpublished. Publish them from the curation layer before they appear on the site.`,
    );

    return NextResponse.json({ ok: true, summary });
  } catch (e) {
    if (e instanceof InstagramApiError) {
      summary.errors++;
      return NextResponse.json(
        { ok: false, error: e.message, status: e.status, summary },
        { status: e.status === 0 ? 504 : 502 },
      );
    }
    summary.errors++;
    return NextResponse.json(
      { ok: false, error: (e as Error).message, summary },
      { status: 500 },
    );
  }
}

/** Non-secret status probe. Never reveals credentials. */
export async function GET(): Promise<Response> {
  const store = await readStore();
  return NextResponse.json({
    configured: Boolean(readCredentials()),
    syncSecretSet: Boolean(process.env.INSTAGRAM_SYNC_SECRET),
    contentSource: process.env.CONTENT_SOURCE ?? "local",
    itemsStored: store.items.length,
    itemsPublished: store.items.filter((i) => i.published).length,
    lastSyncedAt: store.syncedAt,
  });
}
