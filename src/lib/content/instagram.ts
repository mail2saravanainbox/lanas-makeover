import "server-only";
import type { ContentProvider, ContentSource, PortfolioItem, PortfolioQuery } from "@/lib/types";
import { LocalContentProvider, applyPortfolioQuery } from "./local";
import { readStore } from "@/lib/instagram/store";

/**
 * INSTAGRAM PROVIDER.
 *
 * Portfolio comes from the synced + curated Instagram store; everything else
 * (services, journal, brides, settings) still comes from local content, because
 * Instagram cannot model those.
 *
 * If the store is empty — never synced, or a cold serverless instance — it
 * falls back to local demo content rather than rendering an empty gallery.
 */
export class InstagramContentProvider extends LocalContentProvider implements ContentProvider {
  readonly source: ContentSource = "instagram";

  async getPortfolio(options?: PortfolioQuery): Promise<PortfolioItem[]> {
    const { items } = await readStore();
    const published = items.filter((i) => i.published);
    if (published.length === 0) return super.getPortfolio(options);
    return applyPortfolioQuery(items, options);
  }

  async getPortfolioItem(slug: string): Promise<PortfolioItem | null> {
    const { items } = await readStore();
    const hit = items.find((i) => i.slug === slug && i.published);
    return hit ?? super.getPortfolioItem(slug);
  }
}
