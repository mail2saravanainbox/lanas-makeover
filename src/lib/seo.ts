import type { Metadata } from "next";
import { citiesAmp, citiesProse, siteSettings } from "@/content/site";
import { waLink, waNumber } from "@/lib/whatsapp";

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
  /**
   * §22. The four cities are named once, in the title and once in the
   * description — not repeated into every paragraph of the site. Both strings
   * are built from `serviceAreas`, so the set cannot drift out of sync with
   * the footer, the hero or the schema.
   */
  defaultTitle: `${siteSettings.brandName} | Bridal Makeup & Hair Artist in ${citiesAmp()}`,
  titleTemplate: `%s — ${siteSettings.brandName}`,
  defaultDescription:
    `Premium bridal makeup and hair styling by ${siteSettings.brandName}, serving ${citiesProse()}. ` +
    "Natural, HD and South Indian bridal looks, jadai and bridal hair, engagement and reception makeup.",
  locale: "en_IN",
  /**
   * Descriptive only. These describe what the business genuinely does; they are
   * not repeated into copy. Search intent is served by real journal articles.
   *
   * One city-qualified topic per service location, and no more: this array
   * feeds `knowsAbout` in the schema, which is a description of competence,
   * not a keyword bin.
   */
  topics: [
    ...siteSettings.serviceAreas.map((city) => `bridal makeup artist ${city}`),
    "South Indian bridal makeup",
    "Tamil bridal makeup",
    "HD bridal makeup",
    "natural bridal makeup",
    "bridal hairstylist Tamil Nadu",
    "jadai and bridal hair styling",
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
  /**
   * THE NUMBER IS NOW REAL, SO THE ENTITY CAN CARRY IT.
   *
   * `telephone` on a LocalBusiness is one of the strongest local signals
   * there is, and until a number was supplied this record had none. It comes
   * from the same helper the wa.me links use, so there is exactly one number
   * on this site and it cannot drift — and it is null-safe, so the field
   * simply disappears again if the number is ever unset.
   *
   * E.164, because that is the format schema.org expects and the only one a
   * search engine can dial from another country.
   *
   * NOTE: this publishes the number to search results, which may render a
   * call button. The SITE still offers no `tel:` link anywhere —
   * siteSettings.phone is deliberately empty — so nothing here changes what
   * the pages themselves invite. If calls are not wanted, remove `telephone`
   * below; the wa.me links are unaffected.
   */
  const tel = waNumber();
  const sameAs = [siteSettings.instagram, waLink()].filter(Boolean);
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
    /**
     * The four primary service locations, as cities rather than bare Places,
     * plus the wider region the travel note actually claims. One business,
     * several areas served — never several LocalBusiness records.
     */
    areaServed: [
      ...siteSettings.serviceAreas.map((name) => ({
        "@type": "City",
        name,
        containedInPlace: { "@type": "AdministrativeArea", name: "Tamil Nadu" },
      })),
      { "@type": "AdministrativeArea", name: "Tamil Nadu" },
    ],
    ...(tel ? { telephone: `+${tel}` } : {}),
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

export function collectionPageSchema(input: {
  name: string;
  description: string;
  path: string;
  images: Array<{ url: string; caption: string }>;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    isPartOf: { "@type": "WebSite", name: seoConfig.siteName, url: seoConfig.siteUrl },
    about: { "@type": "BeautySalon", name: seoConfig.siteName, url: seoConfig.siteUrl },
    ...(input.images.length > 0
      ? {
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: input.images.length,
            itemListElement: input.images.map((img, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "ImageObject",
                contentUrl: img.url,
                caption: img.caption,
              },
            })),
          },
        }
      : {}),
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

/**
 * Service schema (§23).
 *
 * `areaServed` is the four primary locations — the same list the footer and
 * the hero print, so a rich result cannot claim a coverage the page does not.
 * No `offers` block: that would need a price, and no price has been supplied.
 * Silence about price is correct here; an invented one would not be.
 */
export function serviceSchema(input: {
  name: string;
  description: string;
  slug: string;
  image?: string;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: absoluteUrl(`/services/${input.slug}`),
    serviceType: input.name,
    category: "Bridal makeup and hair styling",
    provider: { "@id": absoluteUrl("/#business") },
    areaServed: siteSettings.serviceAreas.map((name) => ({ "@type": "City", name })),
    ...(input.image ? { image: input.image } : {}),
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  A CITY PAGE'S SCHEMA
 * ═══════════════════════════════════════════════════════════════════════════
 *  One Service, scoped to ONE city, provided by the single business record.
 *
 *  ── WHY NOT A SECOND LocalBusiness ────────────────────────────────────────
 *  The obvious move on a city page is to emit a LocalBusiness for that city.
 *  It is also the move that gets a business flattened in local search: there
 *  is one business, in Trichy, and four LocalBusiness records with four
 *  addresses would be a claim to four premises that do not exist.
 *
 *  So the business is referenced by @id — the record emitted once in the root
 *  layout — and what varies per city is `areaServed`, which is the field that
 *  actually means "we work here" rather than "we are here".
 *
 *  No `offers`, for the same reason as serviceSchema: no price exists.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function cityServiceSchema(input: {
  city: string;
  slug: string;
  description: string;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Bridal makeup and hair in ${input.city}`,
    description: input.description,
    url: absoluteUrl(`/locations/${input.slug}`),
    serviceType: "Bridal makeup and hair styling",
    category: "Bridal makeup and hair styling",
    provider: { "@id": absoluteUrl("/#business") },
    areaServed: {
      "@type": "City",
      name: input.city,
      containedInPlace: { "@type": "AdministrativeArea", name: "Tamil Nadu" },
    },
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE JEWELLERY RENTAL SCHEMA
 * ═══════════════════════════════════════════════════════════════════════════
 *  A second Service on the same business, not a second business — the same
 *  rule the city pages follow, and for the same reason.
 *
 *  ── AND NOT Product / Offer, WHICH IS THE OBVIOUS MISTAKE ─────────────────
 *  A hundred and thirty-three photographs of jewellery look like a catalogue,
 *  and the reflex is to emit a Product per set. Product without `offers` earns
 *  nothing, and `offers` requires a price. There is no price: rental terms are
 *  settled per date and per city, and inventing a number to satisfy a schema
 *  validator would put a figure in a search result that Lana never quoted.
 *
 *  So the collection is described as what it is — a rental service, with a
 *  CollectionPage per room — and the sets themselves are ImageObjects, which
 *  is honest about what a photograph of a necklace actually is.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function rentalServiceSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Bridal jewellery rental",
    description: `Bridal jewellery on rent across ${citiesProse()} — temple jewellery, American diamond sets, chokers and haram.`,
    url: absoluteUrl("/rental-jewellery"),
    serviceType: "Bridal jewellery rental",
    category: "Jewellery rental",
    provider: { "@id": absoluteUrl("/#business") },
    areaServed: [
      ...siteSettings.serviceAreas.map((name) => ({ "@type": "City", name })),
      { "@type": "AdministrativeArea", name: "Tamil Nadu" },
    ],
  };
}

export function rentalCategorySchema(input: {
  name: string;
  slug: string;
  description: string;
  count: number;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${input.name} on rent`,
    description: input.description,
    url: absoluteUrl(`/rental-jewellery/${input.slug}`),
    isPartOf: { "@id": absoluteUrl("/#business") },
    about: { "@id": absoluteUrl("/#business") },
    // Counted from the catalogue, so a rich result cannot claim a collection
    // larger than the one on the page.
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: input.count,
      itemListOrder: "https://schema.org/ItemListUnordered",
    },
  };
}
