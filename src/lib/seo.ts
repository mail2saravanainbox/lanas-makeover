import type { Metadata } from "next";
import { siteSettings } from "@/content/site";

/**
 * SEO CONFIGURATION
 *
 * Editable in one place. No keyword stuffing, no invented business facts —
 * every claim below is either brand-owned or comes from the public profile.
 */

/**
 * Resolve the canonical origin.
 *
 * Order matters, and getting it wrong is an SEO defect rather than a bug:
 *
 *  1. NEXT_PUBLIC_SITE_URL — the real domain, once there is one. Always wins.
 *  2. In PRODUCTION, the project's stable production domain. `VERCEL_URL` is
 *     the *immutable per-deployment* host, which changes on every deploy — using
 *     it in production would canonicalise the site to a URL that stops existing.
 *  3. In preview/development on Vercel, the deployment host, so a preview is
 *     self-consistent and its sitemap points at itself.
 *  4. Locally, localhost.
 *
 * This module is server-only in practice (imported by pages, sitemap, robots),
 * so non-public env vars are safe to read here.
 */
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (process.env.VERCEL_ENV === "production" && productionHost) {
    return `https://${productionHost}`;
  }

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const seoConfig = {
  /** Set NEXT_PUBLIC_SITE_URL once a custom domain is attached. */
  siteUrl: resolveSiteUrl(),
  siteName: siteSettings.brandName,
  defaultTitle: `${siteSettings.brandName} — Tamil Bridal Makeup & Hair Artist, Trichy`,
  titleTemplate: `%s — ${siteSettings.brandName}`,
  defaultDescription:
    "Tamil bridal makeup and hair artist based in Trichy. Natural, HD and South Indian bridal looks; jadai and bridal hair styling; engagement, reception and occasion makeup. Travel available.",
  locale: "en_IN",
  /**
   * Descriptive only. These describe what the business genuinely does; they are
   * not repeated into copy. Search intent is served by real journal articles.
   */
  topics: [
    "bridal makeup artist Trichy",
    "South Indian bridal makeup",
    "HD bridal makeup",
    "natural bridal makeup",
    "bridal hairstylist Trichy",
    "engagement makeup artist Tamil Nadu",
    "party transformation makeup",
  ],
  twitterHandle: undefined as string | undefined, // TODO(client)
} as const;

export function absoluteUrl(pathname = "/"): string {
  const base = seoConfig.siteUrl.replace(/\/$/, "");
  return `${base}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

interface PageMetaInput {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  noIndex?: boolean;
}

/** Build page metadata consistently. Used by every route. */
export function pageMetadata({
  title,
  description,
  path = "/",
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  tags,
  noIndex,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const desc = description ?? seoConfig.defaultDescription;

  /**
   * Every page gets a card, always. Routes with their own generated card pass
   * its URL in explicitly (see the bride, journal and bridal-world routes) —
   * the file convention is NOT relied on to cascade, because it does not once
   * a route supplies its own `openGraph` object.
   */
  const ogImage = image ?? absoluteUrl("/opengraph-image");
  const ogImages = [{ url: ogImage, width: 1200, height: 630, alt: title ?? seoConfig.siteName }];

  return {
    title: title ?? seoConfig.defaultTitle,
    description: desc,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    openGraph: {
      type,
      url,
      siteName: seoConfig.siteName,
      title: title ?? seoConfig.defaultTitle,
      description: desc,
      locale: seoConfig.locale,
      images: ogImages,
      ...(type === "article" ? { publishedTime, modifiedTime, tags } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? seoConfig.defaultTitle,
      description: desc,
      images: [ogImage],
      ...(seoConfig.twitterHandle ? { creator: seoConfig.twitterHandle } : {}),
    },
  };
}

/* ── Structured data ─────────────────────────────────────────────────────── */

type Json = Record<string, unknown>;

/** LocalBusiness / BeautySalon. Only verified facts are emitted. */
export function localBusinessSchema(): Json {
  const sameAs = [siteSettings.instagram].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": absoluteUrl("/#business"),
    name: siteSettings.brandName,
    url: absoluteUrl("/"),
    description: seoConfig.defaultDescription,
    image: absoluteUrl("/opengraph-image"),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Tiruchirappalli",
      addressRegion: "Tamil Nadu",
      addressCountry: "IN",
      // TODO(client): streetAddress + postalCode once confirmed.
    },
    areaServed: siteSettings.serviceAreas.map((name) => ({ "@type": "Place", name })),
    ...(siteSettings.phone ? { telephone: siteSettings.phone } : {}),
    ...(siteSettings.email ? { email: siteSettings.email } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    knowsAbout: seoConfig.topics,
  };
}

export function personSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": absoluteUrl("/about#artist"),
    name: siteSettings.artistName,
    jobTitle: "Bridal Makeup & Hair Artist",
    worksFor: { "@id": absoluteUrl("/#business") },
    url: absoluteUrl("/about"),
    sameAs: [siteSettings.instagram],
  };
}

export function articleSchema(input: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  image?: string;
  tags?: string[];
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: absoluteUrl(`/journal/${input.slug}`),
    mainEntityOfPage: absoluteUrl(`/journal/${input.slug}`),
    datePublished: input.publishedAt,
    dateModified: input.updatedAt ?? input.publishedAt,
    author: { "@type": "Organization", name: siteSettings.brandName },
    publisher: { "@id": absoluteUrl("/#business") },
    image: input.image ?? absoluteUrl("/opengraph-image"),
    ...(input.tags?.length ? { keywords: input.tags.join(", ") } : {}),
  };
}

export function breadcrumbSchema(trail: Array<{ name: string; path: string }>): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: absoluteUrl(t.path),
    })),
  };
}

export function imageObjectSchema(input: { url: string; caption: string; path: string }): Json {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: input.url,
    url: absoluteUrl(input.path),
    caption: input.caption,
    creditText: siteSettings.brandName,
  };
}

export function faqSchema(items: Array<{ question: string; answer: string }>): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer.replace(/⟨[^⟩]*⟩/g, "").trim() },
    })),
  };
}
