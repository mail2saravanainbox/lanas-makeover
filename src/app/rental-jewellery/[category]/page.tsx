import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { content } from "@/lib/content/provider";
import { rentalCategories, rentalCategoryBySlug } from "@/content/rental-categories";
import { rentalItemsFor } from "@/content/rental";
import { citiesProse } from "@/content/site";
import { breadcrumbSchema, pageMetadata, rentalCategorySchema } from "@/lib/seo";
import PageHeader from "@/components/ui/PageHeader";
import RentalGrid from "@/components/rental/RentalGrid";
import Reveal from "@/components/ui/Reveal";
import JsonLd from "@/components/ui/JsonLd";
import ClosingCTA from "@/components/sections/ClosingCTA";

export function generateStaticParams() {
  return rentalCategories.map((c) => ({ category: c.slug }));
}

export const dynamicParams = false;
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const c = rentalCategoryBySlug(category);
  if (!c) return {};
  const n = rentalItemsFor(c.key).length;

  return pageMetadata({
    title: c.metaTitle,
    description: `${n} ${c.name.toLowerCase()} bridal sets to rent across ${citiesProse()}. ${c.intro}`,
    path: `/rental-jewellery/${c.slug}`,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const c = rentalCategoryBySlug(category);
  if (!c) notFound();

  const settings = await content().getSiteSettings();
  const items = rentalItemsFor(c.key);
  const others = rentalCategories.filter((x) => x.slug !== c.slug);

  return (
    <>
      <JsonLd
        data={[
          rentalCategorySchema({ name: c.name, slug: c.slug, description: c.intro, count: items.length }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Jewellery Rental", path: "/rental-jewellery" },
            { name: c.name, path: `/rental-jewellery/${c.slug}` },
          ]),
        ]}
      />

      <PageHeader
        eyebrow={`${items.length} sets to rent`}
        titleLines={c.titleLines}
        intro={c.intro}
        breadcrumb={[
          { name: "Home", href: "/" },
          { name: "Jewellery Rental", href: "/rental-jewellery" },
          { name: c.name, href: `/rental-jewellery/${c.slug}` },
        ]}
      />

      <div className="shell pb-16">
        <div className="measure space-y-5">
          {c.body.map((p, i) => (
            <Reveal key={i} delay={i * 90}>
              <p className="body-lg">{p}</p>
            </Reveal>
          ))}
        </div>
      </div>

      <section aria-label={`${c.name} sets`} className="shell pb-20">
        <RentalGrid items={items} />
      </section>

      <section className="shell pb-20">
        <Reveal>
          <div className="measure border-l border-champagne/30 pl-5">
            <p className="body-lg">
              Availability, rental terms and the deposit are confirmed directly, per date and per
              city. Send your date with the sets you are drawn to.
            </p>
            <Link href="/contact" className="btn mt-8">
              {settings.bookingCta}
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Four rooms that never link to each other are four orphans. */}
      <section aria-labelledby="rental-others" className="shell pb-16">
        <h2 id="rental-others" className="eyebrow mb-6">
          Also to rent
        </h2>
        <ul className="flex flex-wrap gap-x-10 gap-y-0 lg:gap-y-4">
          {others.map((o) => (
            <li key={o.slug}>
              <Link
                href={`/rental-jewellery/${o.slug}`}
                className="tap link-wipe font-display text-2xl text-ivory transition-colors duration-[var(--d-base)] hover:text-champagne"
              >
                {o.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ClosingCTA settings={settings} />
    </>
  );
}
