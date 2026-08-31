import "server-only";
import type { ContentProvider, ContentSource } from "@/lib/types";
import { LocalContentProvider } from "./local";
import { CMSContentProvider } from "./cms";
import { InstagramContentProvider } from "./instagram";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE ONLY CONTENT ENTRY POINT IN THE APPLICATION
 * ─────────────────────────────────────────────────────────────────────────────
 *  Every page and every server component calls `content()`. Nothing imports a
 *  provider class directly, and nothing imports /src/content directly.
 *
 *  Switch the whole site's data source with one environment variable:
 *
 *      CONTENT_SOURCE=local        # default — ships working, no credentials
 *      CONTENT_SOURCE=cms          # headless CMS (see lib/content/cms.ts)
 *      CONTENT_SOURCE=instagram    # synced + curated Instagram media
 *
 *  No component changes. That is the point.
 * ─────────────────────────────────────────────────────────────────────────────
 */

function resolveSource(): ContentSource {
  const raw = (process.env.CONTENT_SOURCE ?? "local").toLowerCase().trim();
  if (raw === "cms" || raw === "instagram" || raw === "local") return raw;
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[content] Unknown CONTENT_SOURCE "${raw}" — falling back to "local".`);
  }
  return "local";
}

let cached: ContentProvider | null = null;

export function content(): ContentProvider {
  if (cached) return cached;
  switch (resolveSource()) {
    case "cms":
      cached = new CMSContentProvider();
      break;
    case "instagram":
      cached = new InstagramContentProvider();
      break;
    default:
      cached = new LocalContentProvider();
  }
  return cached;
}

export function currentContentSource(): ContentSource {
  return content().source;
}
