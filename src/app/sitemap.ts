import type { MetadataRoute } from "next";
import { content } from "@/lib/content/provider";
import { absoluteUrl } from "@/lib/seo";
import { collections } from "@/content/collections";

/**
 * Dynamic sitemap (§46). Only published content is ever listed — the provider
 * filters unpublished items before they reach here, which is the same gate the
 * pages use.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const provider = content();

  const [brides, posts, services] = await Promise.all([
    provider.getBrides(),
    provider.getPosts(),
    provider.getServices(),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = ([
    { url: absoluteUrl("/"), priority: 1, changeFrequency: "monthly" },
    { url: absoluteUrl("/portfolio"), priority: 0.9, changeFrequency: "weekly" },
    { url: absoluteUrl("/bridal"), priority: 0.9, changeFrequency: "monthly" },
    { url: absoluteUrl("/hair"), priority: 0.85, changeFrequency: "monthly" },
    { url: absoluteUrl("/makeup"), priority: 0.85, changeFrequency: "monthly" },
    { url: absoluteUrl("/services"), priority: 0.85, changeFrequency: "monthly" },
    { url: absoluteUrl("/brides"), priority: 0.8, changeFrequency: "monthly" },
    { url: absoluteUrl("/journal"), priority: 0.8, changeFrequency: "weekly" },
    { url: absoluteUrl("/about"), priority: 0.7, changeFrequency: "yearly" },
    { url: absoluteUrl("/contact"), priority: 0.7, changeFrequency: "yearly" },
    { url: absoluteUrl("/faq"), priority: 0.6, changeFrequency: "yearly" },
    { url: absoluteUrl("/privacy"), priority: 0.2, changeFrequency: "yearly" },
    { url: absoluteUrl("/terms"), priority: 0.2, changeFrequency: "yearly" },
  ] as const).map((r) => ({ ...r, lastModified: now }));

  return [
    ...staticRoutes,
    ...services.map((s) => ({
      url: absoluteUrl(`/services/${s.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    // Collections, not photographs. A URL per image said nothing and diluted
    // everything; a URL per room is a page worth indexing.
    ...collections.map((c) => ({
      url: absoluteUrl(`/portfolio/${c.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...brides.map((b) => ({
      url: absoluteUrl(`/brides/${b.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...posts.map((p) => ({
      url: absoluteUrl(`/journal/${p.slug}`),
      lastModified: new Date(p.updatedAt ?? p.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
