import type { Metadata } from "next";
import { content } from "@/lib/content/provider";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import PageHeader from "@/components/ui/PageHeader";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";
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

      <section aria-label="Portfolio gallery" className="pb-28 sm:pb-40">
        <PortfolioGrid items={items} />
      </section>

      <ClosingCTA settings={settings} />
    </>
  );
}
