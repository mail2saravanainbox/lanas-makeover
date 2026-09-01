import type {
  BlogPost,
  BrideStory,
  ContentProvider,
  ContentSource,
  FAQItem,
  PortfolioItem,
  PortfolioQuery,
  Service,
  SiteSettings,
  Testimonial,
  TimelineEntry,
} from "@/lib/types";

import { siteSettings } from "@/content/site";
import { services } from "@/content/services";
import { brides } from "@/content/brides";
import { posts } from "@/content/journal/posts";
import { testimonials } from "@/content/testimonials";
import { faqs } from "@/content/faq";
import { timeline } from "@/content/timeline";
import { localPortfolio } from "@/content/portfolio/local";
import importedPortfolio from "@/content/portfolio/portfolio.json";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  REAL PHOTOGRAPHY TAKES OVER AUTOMATICALLY
 * ─────────────────────────────────────────────────────────────────────────────
 *  `portfolio.json` is written by `npm run import:portfolio` from whatever
 *  Lana drops into content/incoming/. The moment it contains a published item,
 *  it replaces the placeholder set everywhere — homepage, portfolio, services,
 *  hair, journal covers — with no code change.
 *
 *  Until then the placeholder plates hold the composition, clearly badged.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const imported = (importedPortfolio.items ?? []) as unknown as PortfolioItem[];

export const hasRealPhotography = imported.some((i) => i.published && i.imageUrl);

/**
 * A portfolio row without a photograph is not publishable.
 *
 * The demo rows in content/portfolio/local.ts document the intended curation —
 * which categories, which weights, which frames are featured — and they stay.
 * But each one used to mint a public URL (/portfolio/muhurtham-gold and 23
 * siblings) showing a placeholder plate under an invented title. Those pages
 * had nothing to say and were indexable.
 *
 * Gating here rather than deleting rows keeps the curation and removes the
 * pages: the moment a row gains an `imageUrl` it publishes itself.
 *
 * The image slots in slots.ts already required `imageUrl`, so plates are
 * unaffected — the story sections look exactly as they did.
 */
function requirePhotograph(items: PortfolioItem[]): PortfolioItem[] {
  return items.map((i) => (i.imageUrl ? i : { ...i, published: false }));
}

/** The live portfolio: Lana's photographs when they exist, plates until then. */
export const activePortfolio: PortfolioItem[] = requirePhotograph(
  hasRealPhotography
    ? imported.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    : localPortfolio,
);

/** Shared query logic so every provider filters identically. */
export function applyPortfolioQuery(
  items: PortfolioItem[],
  q: PortfolioQuery = {},
): PortfolioItem[] {
  let out = items.filter((i) => i.published);
  if (q.category && q.category !== "all") out = out.filter((i) => i.category === q.category);
  if (q.featured !== undefined) out = out.filter((i) => i.featured === q.featured);
  const offset = q.offset ?? 0;
  const limit = q.limit ?? out.length;
  return out.slice(offset, offset + limit);
}

/**
 * LOCAL PROVIDER — the default. Reads the files in /src/content.
 * Zero network, zero credentials, instant. The site is fully functional on it.
 */
export class LocalContentProvider implements ContentProvider {
  /** Typed wide so subclasses (CMS, Instagram) can narrow it. */
  readonly source: ContentSource = "local";

  async getSiteSettings(): Promise<SiteSettings> {
    return siteSettings;
  }

  async getPortfolio(options?: PortfolioQuery): Promise<PortfolioItem[]> {
    return applyPortfolioQuery(activePortfolio, options);
  }

  async getPortfolioItem(slug: string): Promise<PortfolioItem | null> {
    return activePortfolio.find((i) => i.slug === slug && i.published) ?? null;
  }

  async getBrides(): Promise<BrideStory[]> {
    return brides.filter((b) => b.published);
  }

  async getBride(slug: string): Promise<BrideStory | null> {
    return brides.find((b) => b.slug === slug && b.published) ?? null;
  }

  async getPosts(): Promise<BlogPost[]> {
    return posts
      .filter((p) => p.published)
      .slice()
      .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  }

  async getPost(slug: string): Promise<BlogPost | null> {
    return posts.find((p) => p.slug === slug && p.published) ?? null;
  }

  async getServices(): Promise<Service[]> {
    return services.filter((s) => s.published).slice().sort((a, b) => a.order - b.order);
  }

  async getService(slug: string): Promise<Service | null> {
    return services.find((s) => s.slug === slug && s.published) ?? null;
  }

  async getTestimonials(): Promise<Testimonial[]> {
    return testimonials.filter((t) => t.published);
  }

  async getFaqs(): Promise<FAQItem[]> {
    return faqs.filter((f) => f.published).slice().sort((a, b) => a.order - b.order);
  }

  async getTimeline(): Promise<TimelineEntry[]> {
    return timeline;
  }
}
