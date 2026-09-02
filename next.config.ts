import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { collectionForCategory } from "./src/content/collections";
import type { PortfolioCategory } from "./src/lib/types";

/**
 * PERMANENT REDIRECTS FOR THE RETIRED PER-IMAGE ROUTES
 *
 * /portfolio/<slug> used to be a page per photograph. Those URLs are gone —
 * replaced by collections — but anything already linked or indexed must land
 * somewhere true, not on a 404. Each old slug now redirects to its collection
 * with the lightbox pre-opened on that exact image.
 *
 * Built from portfolio.json at build time, so the list is exactly the set of
 * photographs that ever existed. With no imported photography yet this is
 * empty, and that is correct: nothing was ever published to redirect.
 */
function retiredImageRedirects() {
  try {
    const raw = readFileSync("./src/content/portfolio/portfolio.json", "utf8");
    const items = (JSON.parse(raw).items ?? []) as Array<{
      slug?: string;
      category?: PortfolioCategory;
      published?: boolean;
      imageUrl?: string;
    }>;

    return items
      .filter((i) => i.slug && i.category && i.published && i.imageUrl)
      .map((i) => {
        const c = collectionForCategory(i.category as PortfolioCategory);
        return c
          ? {
              source: `/portfolio/${i.slug}`,
              destination: `/portfolio/${c.slug}?image=${i.slug}`,
              permanent: true,
            }
          : null;
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,

  images: {
    // AVIF first, WebP fallback (§34).
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600, 1920, 2560],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      // Instagram CDN — only needed once CONTENT_SOURCE=instagram serves live
      // media URLs. Harmless when unused.
      { protocol: "https", hostname: "*.cdninstagram.com" },
      { protocol: "https", hostname: "scontent.cdninstagram.com" },
      { protocol: "https", hostname: "*.fbcdn.net" },
    ],
  },

  async redirects() {
    return retiredImageRedirects();
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
      {
        // The sync endpoint must never be cached by a CDN or a browser.
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
