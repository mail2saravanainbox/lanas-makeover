import type { Metadata } from "next";
import { content } from "@/lib/content/provider";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import DisciplinePage from "@/components/sections/DisciplinePage";
import JsonLd from "@/components/ui/JsonLd";
import { makeup as config } from "@/content/disciplines";

export const metadata: Metadata = pageMetadata({
  title: "Makeup — Natural, HD & Party Transformation",
  description: "Natural and HD makeup, plus party and transformation work, by Lana's Makeover in Trichy, Tamil Nadu.",
  path: "/makeup",
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
          { name: config.eyebrow, path: "/makeup" },
        ])}
      />
      <DisciplinePage config={config} items={items} services={services} settings={settings} />
    </>
  );
}
