import type { Metadata } from "next";
import { content } from "@/lib/content/provider";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import DisciplinePage from "@/components/sections/DisciplinePage";
import JsonLd from "@/components/ui/JsonLd";
import { bridal as config } from "@/content/disciplines";

export const metadata: Metadata = pageMetadata({
  title: "Bridal Makeup & Hair, Trichy",
  description: "South Indian bridal makeup and hair by Lana's Makeover, Trichy. Muhurtham, reception and engagement looks in natural, HD and traditional registers.",
  path: "/bridal",
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
          { name: config.eyebrow, path: "/bridal" },
        ])}
      />
      <DisciplinePage config={config} items={items} services={services} settings={settings} />
    </>
  );
}
