import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { content } from "@/lib/content/provider";
import { locationBySlug, locations } from "@/content/locations";
import { breadcrumbSchema, cityServiceSchema, faqSchema, pageMetadata } from "@/lib/seo";
import LocationPage from "@/components/sections/LocationPage";
import JsonLd from "@/components/ui/JsonLd";

/** Four cities, known at build time. Static, like the service pages. */
export function generateStaticParams() {
  return locations.map((l) => ({ city: l.slug }));
}

export const dynamicParams = false;
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const config = locationBySlug(city);
  if (!config) return {};

  return pageMetadata({
    /**
     * The query is "bridal makeup artist in chennai". The title says that,
     * once, in the order it is typed — and then stops. Everything after the
     * useful part of a title is invisible in a result anyway.
     */
    title: `Bridal Makeup Artist in ${config.city}`,
    description: config.intro,
    path: `/locations/${config.slug}`,
  });
}

export default async function Page({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const config = locationBySlug(city);
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
            description: config.intro,
          }),
          // The same items the page renders, so a rich result cannot show an
          // answer the page does not give.
          faqSchema(config.faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Locations", path: "/locations" },
            { name: config.city, path: `/locations/${config.slug}` },
          ]),
        ]}
      />
      <LocationPage config={config} items={items} services={services} settings={settings} />
    </>
  );
}
