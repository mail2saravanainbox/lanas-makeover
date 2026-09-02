import type { Metadata } from "next";
import { content } from "@/lib/content/provider";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import PageHeader from "@/components/ui/PageHeader";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";
import Link from "next/link";
import { collections } from "@/content/collections";
import JsonLd from "@/components/ui/JsonLd";
import ClosingCTA from "@/components/sections/ClosingCTA";

export const metadata: Metadata = pageMetadata({
  title: "Portfolio — Bridal Makeup & Hair",
  description:
    "Selected bridal, reception, engagement and hair work by Lana's Makeover. South Indian bridal, natural and HD finishes.",
  path: "/portfolio",
});

export const revalidate = 3600;

export default async function PortfolioPage() {
  const provider = content();
  const [items, settings] = await Promise.all([
    provider.getPortfolio(),
    provider.getSiteSettings(),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Portfolio", path: "/portfolio" },
        ])}
      />

      <PageHeader
        eyebrow="The work"
        titleLines={["The portfolio."]}
        intro="Bridal, reception, engagement and hair. Filter by world, or move straight through the whole archive."
        breadcrumb={[
          { name: "Home", href: "/" },
          { name: "Portfolio", href: "/portfolio" },
        ]}
      />

      <nav aria-label="Collections" className="shell mb-16">
        <h2 className="eyebrow mb-6">Collections</h2>
        <ul className="flex flex-wrap gap-x-7 gap-y-3">
          {collections.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/portfolio/${c.slug}`}
                className="link-wipe font-display text-xl text-ivory transition-colors duration-[var(--d-base)] hover:text-champagne"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section aria-label="Portfolio gallery" className="pb-[var(--s-12)] sm:pb-[var(--s-16)]">
        <PortfolioGrid items={items} />
      </section>

      <ClosingCTA settings={settings} />
    </>
  );
}
