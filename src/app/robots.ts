import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/**
 * COMP BUILD — the entire site is disallowed.
 *
 * On `redesign` this allows everything public. Here it allows nothing: a
 * presentation comp must never be crawled, because its imagery is not Lana's
 * and ranking it for her name would be worse than not ranking at all.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
    host: absoluteUrl("/"),
  };
}
