import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { content } from "@/lib/content/provider";
import {
  absoluteUrl,
  breadcrumbSchema,
  imageObjectSchema,
  pageMetadata,
} from "@/lib/seo";
import EditorialImage from "@/components/ui/EditorialImage";
import JsonLd from "@/components/ui/JsonLd";
import Reveal from "@/components/ui/Reveal";
import SplitLines from "@/components/ui/SplitLines";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";
import BeforeAfterSlider from "@/components/portfolio/BeforeAfterSlider";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600;
// Matches brides/[slug], journal/[slug] and services/[slug]: the set is
// enumerable, so anything outside it is a static 404 rather than a soft one.
export const dynamicParams = false;

export async function generateStaticParams() {
  const items = await content().getPortfolio();
  return items.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await content().getPortfolioItem(slug);
  if (!item) return pageMetadata({ title: "Not found", path: `/portfolio/${slug}`, noIndex: true });

  return pageMetadata({
    title: item.title,
    description: item.caption?.slice(0, 160) ?? `${item.title} — bridal work by Lana's Makeover.`,
    path: `/portfolio/${item.slug}`,
    image: item.imageUrl,
  });
}

export default async function PortfolioItemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const provider = content();
  const item = await provider.getPortfolioItem(slug);
  if (!item) notFound();

  const all = await provider.getPortfolio();
  const related = all.filter((i) => i.slug !== item.slug && i.category === item.category).slice(0, 6);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Portfolio", path: "/portfolio" },
            { name: item.title, path: `/portfolio/${item.slug}` },
          ]),
          imageObjectSchema({
            url: item.imageUrl ?? absoluteUrl("/opengraph-image"),
            caption: item.alt,
            path: `/portfolio/${item.slug}`,
          }),
        ]}
      />

      {/* Full-bleed opening — the "camera moves into the image" beat */}
      <section className="relative h-[86vh] min-h-[32rem] w-full overflow-hidden">
        <EditorialImage
          image={{
            src: item.imageUrl,
            alt: item.alt,
            tone: item.tone,
            seed: item.seed,
            blurDataURL: item.blurDataURL,
          }}
          className="absolute inset-0 h-full w-full"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-ink/60" />

        <div className="shell absolute inset-x-0 bottom-0 pb-16">
          <Reveal>
            <p className="eyebrow mb-6">{item.category.replace("-", " ")}</p>
          </Reveal>
          <SplitLines as="h1" className="display-lg max-w-[16ch] text-ivory" lines={[item.title]} />
        </div>
      </section>

      <section className="shell py-20 sm:py-28">
        <div className="grid gap-14 lg:grid-cols-[1fr_auto] lg:gap-24">
          <div className="max-w-2xl">
            {item.caption ? (
              <p className="body-lg whitespace-pre-line">{item.caption}</p>
            ) : (
              <p className="body-lg">
                Part of the {item.category.replace("-", " ")} work. Full context and photography
                for this piece are added as each commission is documented.
              </p>
            )}

            {item.beforeAfter && (
              <div className="mt-16">
                <h2 className="display-sm mb-8 text-ivory">Before &amp; after</h2>
                <BeforeAfterSlider
                  before={item.beforeAfter.before}
                  after={item.beforeAfter.after}
                  label={`${item.title} before and after`}
                />
              </div>
            )}
          </div>

          <dl className="space-y-7 border-t border-ivory/12 pt-8 lg:min-w-56 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <div>
              <dt className="eyebrow mb-2">Category</dt>
              <dd className="text-sm capitalize text-ivory/80">
                {item.category.replace("-", " ")}
              </dd>
            </div>
            {item.timestamp && (
              <div>
                <dt className="eyebrow mb-2">Date</dt>
                <dd className="text-sm text-ivory/80">{formatDate(item.timestamp)}</dd>
              </div>
            )}
            {item.permalink && (
              <div>
                <dt className="eyebrow mb-2">Source</dt>
                <dd>
                  <a
                    href={item.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-wipe text-sm text-ivory/80"
                  >
                    Instagram
                  </a>
                </dd>
              </div>
            )}
            <div>
              <dt className="eyebrow mb-2">Enquire</dt>
              <dd>
                <Link href="/contact" className="link-wipe text-sm text-champagne">
                  Check your date
                </Link>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="pb-28 sm:pb-40">
          <div className="shell mb-12">
            <h2 id="related-title" className="display-sm text-ivory">
              More from this world
            </h2>
          </div>
          <PortfolioGrid items={related} showFilters={false} />
        </section>
      )}
    </>
  );
}
