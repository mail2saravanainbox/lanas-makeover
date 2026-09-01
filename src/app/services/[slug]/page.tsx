import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { content } from "@/lib/content/provider";
import { absoluteUrl, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import EditorialImage from "@/components/ui/EditorialImage";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";
import Reveal from "@/components/ui/Reveal";
import SplitLines from "@/components/ui/SplitLines";
import JsonLd from "@/components/ui/JsonLd";
import ClosingCTA from "@/components/sections/ClosingCTA";

export const revalidate = 3600;

/**
 * Only published slugs get a page; anything else is a real 404 rather than a
 * soft-404. See src/app/README-loading.md.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const services = await content().getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await content().getService(slug);
  if (!service) return pageMetadata({ title: "Not found", path: `/services/${slug}`, noIndex: true });

  return pageMetadata({
    title: `${service.name} — ${service.eyebrow}`,
    description: service.summary,
    path: `/services/${service.slug}`,
    image: service.image.src ?? absoluteUrl(`/services/${service.slug}/opengraph-image`),
  });
}

/**
 * A BRIDAL WORLD (§11)
 *
 * Each world gets its own page rather than an anchor on a list — a real URL,
 * its own metadata, its own filtered gallery. That is what makes "choose your
 * bridal world" a navigable place instead of a scroll position.
 */
export default async function BridalWorldPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const provider = content();
  const service = await provider.getService(slug);
  if (!service) notFound();

  const [all, services, settings] = await Promise.all([
    provider.getPortfolio(),
    provider.getServices(),
    provider.getSiteSettings(),
  ]);

  const items = all.filter((i) => i.category === service.category);
  const others = services.filter((s) => s.slug !== service.slug);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: service.name, path: `/services/${service.slug}` },
        ])}
      />

      {/* Full-bleed opening */}
      <header className="relative h-[80vh] min-h-[30rem] w-full overflow-hidden">
        <EditorialImage
          image={service.image}
          className="absolute inset-0 h-full w-full"
          sizes="100vw"
          priority
          decorative
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/60" />

        <div className="shell absolute inset-x-0 bottom-0 pb-16">
          <Reveal>
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap gap-2 text-[0.75rem] uppercase tracking-[0.24em] text-muted">
                <li>
                  <Link href="/" className="link-wipe hover:text-ivory">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">·</li>
                <li>
                  <Link href="/services" className="link-wipe hover:text-ivory">
                    Services
                  </Link>
                </li>
                <li aria-hidden="true">·</li>
                <li className="text-ivory/60">{service.name}</li>
              </ol>
            </nav>
            <p className="eyebrow mb-5">{service.eyebrow}</p>
          </Reveal>
          <SplitLines
            as="h1"
            className="display-lg max-w-[14ch] text-ivory"
            lines={[service.name]}
          />
        </div>
      </header>

      <section className="shell py-20 sm:py-28">
        <div className="grid gap-14 lg:grid-cols-[1fr_auto] lg:gap-24">
          <div className="max-w-2xl">
            <Reveal>
              <p className="display-sm text-ivory">{service.summary}</p>
            </Reveal>
            <div className="mt-9 space-y-6">
              {service.description.map((p, i) => (
                <Reveal key={i} delay={i * 90}>
                  <p className="body-lg">{p}</p>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="border-t border-ivory/12 pt-8 lg:min-w-64 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <Reveal>
              <h2 className="eyebrow mb-5">Includes</h2>
              <ul className="space-y-3">
                {service.includes.map((inc) => (
                  <li key={inc} className="relative pl-6 text-sm text-ivory/75">
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-[0.7em] h-px w-3 bg-champagne/60"
                    />
                    {inc}
                  </li>
                ))}
              </ul>
              <Link href="/contact" className="btn mt-10 w-full">
                {settings.bookingCta}
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {items.length > 0 ? (
        <section aria-label={`${service.name} gallery`} className="pb-24">
          <div className="shell mb-12">
            <h2 className="display-sm text-ivory">Selected work</h2>
          </div>
          <PortfolioGrid items={items} showFilters={false} />
        </section>
      ) : (
        <section className="shell pb-24">
          <p className="body-base max-w-xl border-l border-champagne/30 pl-5">
            Work from this world is added as each commission is documented. The full archive is
            on the{" "}
            <Link href="/portfolio" className="link-wipe text-champagne">
              portfolio
            </Link>
            .
          </p>
        </section>
      )}

      <section aria-labelledby="other-worlds" className="shell pb-24">
        <h2 id="other-worlds" className="eyebrow mb-8">
          Other worlds
        </h2>
        <ul className="flex flex-wrap gap-x-10 gap-y-4">
          {others.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/services/${s.slug}`}
                className="link-wipe font-display text-2xl text-ivory hover:text-champagne"
              >
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ClosingCTA settings={settings} />
    </>
  );
}
