import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { content } from "@/lib/content/provider";
import { collections, findCollection } from "@/content/collections";
import {
  absoluteUrl,
  breadcrumbSchema,
  collectionPageSchema,
  pageMetadata,
} from "@/lib/seo";
import PageHeader from "@/components/ui/PageHeader";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";
import JsonLd from "@/components/ui/JsonLd";
import ClosingCTA from "@/components/sections/ClosingCTA";

export const revalidate = 3600;
export const dynamicParams = false;

export async function generateStaticParams() {
  return collections.map((c) => ({ collection: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const { collection } = await params;
  const c = findCollection(collection);
  if (!c) {
    return pageMetadata({ title: "Not found", path: `/portfolio/${collection}`, noIndex: true });
  }
  return pageMetadata({
    title: `${c.name} — Portfolio`,
    description: c.description,
    path: `/portfolio/${c.slug}`,
    image: absoluteUrl(`/portfolio/${c.slug}/opengraph-image`),
  });
}

/**
 * A COLLECTION, NOT A FILTER STATE
 *
 * Each room of the archive has its own URL, metadata and Open Graph card, so
 * "Lana's muhurtham work" is something a bride can send to her mother. The 24
 * per-image routes this replaces minted a URL per photograph and had nothing
 * to say on any of them.
 *
 * A collection with no photographs yet still renders — its intro copy and its
 * link back to the whole archive are real — but the grid shows its empty state
 * rather than a wall of plates.
 */
export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;
  const c = findCollection(collection);
  if (!c) notFound();

  const provider = content();
  const [all, settings] = await Promise.all([
    provider.getPortfolio(),
    provider.getSiteSettings(),
  ]);

  // Preference order: the room's own category first, then its neighbours.
  const items = c.categories.flatMap((cat) => all.filter((i) => i.category === cat));

  return (
    <>
      <JsonLd
        data={[
          collectionPageSchema({
            name: c.title,
            description: c.description,
            path: `/portfolio/${c.slug}`,
            images: items
              .filter((i) => i.imageUrl)
              .map((i) => ({ url: absoluteUrl(i.imageUrl!), caption: i.alt })),
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Portfolio", path: "/portfolio" },
            { name: c.name, path: `/portfolio/${c.slug}` },
          ]),
        ]}
      />

      <PageHeader
        eyebrow={c.eyebrow}
        titleLines={[c.title]}
        intro={c.intro}
        breadcrumb={[
          { name: "Home", href: "/" },
          { name: "Portfolio", href: "/portfolio" },
          { name: c.name, href: `/portfolio/${c.slug}` },
        ]}
      />

      <nav aria-label="Collections" className="shell mb-16">
        <ul className="flex flex-wrap gap-x-7 gap-y-3">
          {collections.map((other) => (
            <li key={other.slug}>
              <Link
                href={`/portfolio/${other.slug}`}
                aria-current={other.slug === c.slug ? "page" : undefined}
                className={
                  other.slug === c.slug
                    ? "text-[0.8rem] uppercase tracking-[0.26em] text-champagne"
                    : "link-wipe text-[0.8rem] uppercase tracking-[0.26em] text-inactive transition-colors duration-[var(--d-base)] hover:text-ivory"
                }
              >
                {other.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section aria-label={`${c.name} gallery`} className="pb-[var(--s-12)] sm:pb-[var(--s-16)]">
        <PortfolioGrid items={items} showFilters={false} />
      </section>

      <ClosingCTA settings={settings} />
    </>
  );
}
