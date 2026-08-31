import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/** robots.txt (§47) — every public page crawlable, admin and API are not. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
