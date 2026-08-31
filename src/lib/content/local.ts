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
    return applyPortfolioQuery(localPortfolio, options);
  }

  async getPortfolioItem(slug: string): Promise<PortfolioItem | null> {
    return localPortfolio.find((i) => i.slug === slug && i.published) ?? null;
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
