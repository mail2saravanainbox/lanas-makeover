import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { content } from "@/lib/content/provider";
import { locationBySlug, locationHref } from "@/content/locations";
import { breadcrumbSchema, cityServiceSchema, faqSchema, pageMetadata } from "@/lib/seo";
import LocationPage from "@/components/sections/LocationPage";
import JsonLd from "@/components/ui/JsonLd";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ONE CITY PAGE, RENDERED FOUR TIMES
 * ═══════════════════════════════════════════════════════════════════════════
 *  These used to be a single `/locations/[city]` dynamic route. The URLs are
 *  now `/bridal-makeup-<city>` — one path segment each, which a dynamic
 *  segment cannot express without putting a catch-all at the root of the app
 *  and letting it shadow every future route in the project.
 *
 *  So there are four literal folders, and everything that is actually shared
 *  lives here. A city page's CONTENT is not shared and never was: it comes
 *  from `locations.ts`, where each city is written from what is genuinely
 *  different about a wedding there. What is shared is the wiring — metadata,
 *  schema, which four photographs lead — and that is all this file is.
 *
 *  `_city` is a private folder: the underscore keeps it out of the router.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** The <title>, the description and the canonical for one city. */
export function cityMetadata(slug: string): Metadata {
  const config = locationBySlug(slug);
  if (!config) return {};

  return pageMetadata({
    /**
     * The query is "bridal makeup artist in chennai". The title says that,
     * once, in the order it is typed — and then stops. Everything after the
     * useful part of a title is invisible in a result anyway.
     */
    title: `Bridal Makeup Artist in ${config.city}`,
    /**
     * The orienting sentence, not the editorial intro. `intro` reads as a
     * non-sequitur in a result — "The home city. No travel, no night before"
     * tells a stranger nothing about who this is or what they do. A snippet
     * has one job and it is not atmosphere.
     */
    description: config.orientation,
    path: locationHref(config.slug),
  });
}

export default async function CityRoute({ slug }: { slug: string }) {
  const config = locationBySlug(slug);
  if (!config) notFound();

  const provider = content();
  const [all, services, settings] = await Promise.all([
    provider.getPortfolio(),
    provider.getServices(),
    provider.getSiteSettings(),
  ]);

  /**
   * FOUR, IN THIS CITY'S OWN ORDER.
   *
   * Ordered by how central each category is to that city rather than by the
   * archive's own order, so two city pages with overlapping categories still
   * lead with different photographs. Falls back through the list, so a page
   * is never empty because one room happens to be.
   */
  const items = config.categories
    .flatMap((c) => all.filter((i) => i.category === c))
    .filter((item, i, arr) => arr.findIndex((x) => x.id === item.id) === i)
    .slice(0, 4);

  return (
    <>
      <JsonLd
        data={[
          cityServiceSchema({
            city: config.city,
            slug: config.slug,
            description: config.orientation,
          }),
          // The same items the page renders, so a rich result cannot show an
          // answer the page does not give.
          faqSchema(config.faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Locations", path: "/locations" },
            { name: config.city, path: locationHref(config.slug) },
          ]),
        ]}
      />
      <LocationPage config={config} items={items} services={services} settings={settings} />
    </>
  );
}
