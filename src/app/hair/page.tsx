import type { Metadata } from "next";
import { content } from "@/lib/content/provider";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import DisciplinePage from "@/components/sections/DisciplinePage";
import JsonLd from "@/components/ui/JsonLd";
import { hair as config } from "@/content/disciplines";

export const metadata: Metadata = pageMetadata({
  title: "Bridal Hair — Jadai, Braid & Bridal Styling",
  description: "South Indian bridal hair by Lana's Makeover: jadai, braid structure, floral placement and evening styling. Based in Trichy, travel available.",
  path: "/hair",
});

export const revalidate = 3600;

export default async function Page() {
  const provider = content();
  const [all, services, settings] = await Promise.all([
    provider.getPortfolio(),
    provider.getServices(),
    provider.getSiteSettings(),
  ]);

  const items = all.filter((i) => config.categories.includes(i.category));

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: config.eyebrow, path: "/hair" },
        ])}
      />
      <DisciplinePage config={config} items={items} services={services} settings={settings} />
    </>
  );
}
