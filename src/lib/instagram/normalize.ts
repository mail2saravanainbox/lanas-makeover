import "server-only";
import type { PortfolioItem } from "@/lib/types";
import type { RawInstagramMedia } from "./client";
import { slugFromCaption, suggestCategory, titleFromCaption } from "./categorize";

/**
 * Map a raw Graph API media object into the app's canonical PortfolioItem.
 *
 * Two deliberate decisions here:
 *  1. `published` defaults to FALSE. Nothing Lana posts on Instagram appears on
 *     her website until a human approves it (§14).
 *  2. `category` is only a *suggestion* — the curation layer may overwrite it,
 *     and an existing curated record always wins on re-sync.
 */
export function normalizeMedia(raw: RawInstagramMedia): PortfolioItem {
  const isVideo = raw.media_type === "VIDEO";
  const title = titleFromCaption(raw.caption, "Untitled");

  return {
    id: `ig-${raw.id}`,
    slug: slugFromCaption(raw.caption, raw.id),
    title,
    alt: title,
    caption: raw.caption,
    imageUrl: isVideo ? raw.thumbnail_url : (raw.media_url ?? raw.thumbnail_url),
    thumbnailUrl: raw.thumbnail_url ?? raw.media_url,
    permalink: raw.permalink,
    timestamp: raw.timestamp,
    mediaType: raw.media_type,
    category: suggestCategory(raw.caption),
    featured: false,
    published: false,
    weight: "standard",
    source: "instagram",
  };
}

/**
 * Merge a freshly-fetched item over an already-curated one.
 * Curation fields survive; Instagram-owned fields refresh.
 */
export function mergeCurated(existing: PortfolioItem, incoming: PortfolioItem): PortfolioItem {
  return {
    ...incoming,
    // ── human decisions are never overwritten by a sync ──
    published: existing.published,
    featured: existing.featured,
    category: existing.category,
    weight: existing.weight,
    slug: existing.slug,
    alt: existing.alt,
    title: existing.title,
  };
}

/** True when the two records differ in any Instagram-owned field. */
export function hasChanged(existing: PortfolioItem, incoming: PortfolioItem): boolean {
  return (
    existing.imageUrl !== incoming.imageUrl ||
    existing.thumbnailUrl !== incoming.thumbnailUrl ||
    existing.caption !== incoming.caption ||
    existing.permalink !== incoming.permalink ||
    existing.timestamp !== incoming.timestamp ||
    existing.mediaType !== incoming.mediaType
  );
}
