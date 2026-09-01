import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { content } from "@/lib/content/provider";
import { absoluteUrl, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import EditorialImage from "@/components/ui/EditorialImage";
import ParallaxFrame from "@/components/ui/ParallaxFrame";
import Reveal from "@/components/ui/Reveal";
import SplitLines from "@/components/ui/SplitLines";
import JsonLd from "@/components/ui/JsonLd";

/**
 * Only published slugs get a page; anything else is a real 404 rather than a
 * soft-404. See src/app/README-loading.md.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const brides = await content().getBrides();
  return brides.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bride = await content().getBride(slug);
  if (!bride) return pageMetadata({ title: "Not found", path: `/brides/${slug}`, noIndex: true });

  return pageMetadata({
    title: bride.name,
    description: bride.excerpt,
    path: `/brides/${bride.slug}`,
    // §48 — the bride's own photograph when it exists, otherwise the card
    // generated for this story by ./opengraph-image.tsx.
    image: bride.hero.src ?? absoluteUrl(`/brides/${bride.slug}/opengraph-image`),
    type: "article",
  });
}

export default async function BrideStoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const provider = content();
  const bride = await provider.getBride(slug);
  if (!bride) notFound();

  const all = await provider.getBrides();
  const others = all.filter((b) => b.slug !== bride.slug).slice(0, 2);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Brides", path: "/brides" },
          { name: bride.name, path: `/brides/${bride.slug}` },
        ])}
      />

      {/* Editorial opening — a story, not a blog post */}
      <article>
        <header className="relative h-[88vh] min-h-[34rem] w-full overflow-hidden">
          <EditorialImage
            image={bride.hero}
            className="absolute inset-0 h-full w-full"
            sizes="100vw"
            priority
            badgeLabel="Sample story"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/55" />

          <div className="shell absolute inset-x-0 bottom-0 pb-16">
            <Reveal>
              <p className="eyebrow mb-6">
                {bride.weddingType} · {bride.location} · {bride.date}
              </p>
            </Reveal>
            <SplitLines as="h1" className="display-lg max-w-[14ch] text-ivory" lines={[bride.name]} />
          </div>
        </header>

        <div className="shell py-20 sm:py-28">
          <div className="grid gap-14 lg:grid-cols-[1fr_auto] lg:gap-24">
            <div className="max-w-2xl space-y-7">
              <Reveal>
                <p className="display-sm text-ivory">{bride.excerpt}</p>
              </Reveal>
              {bride.story.map((para, i) => (
                <Reveal key={i} delay={i * 90}>
                  <p className="body-lg">{para}</p>
                </Reveal>
              ))}
            </div>

            <dl className="space-y-7 border-t border-ivory/12 pt-8 lg:min-w-56 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
              <div>
                <dt className="eyebrow mb-2">Ceremony</dt>
                <dd className="text-sm text-ivory/80">{bride.weddingType}</dd>
              </div>
              <div>
                <dt className="eyebrow mb-2">Look</dt>
                <dd className="text-sm text-ivory/80">{bride.look}</dd>
              </div>
              <div>
                <dt className="eyebrow mb-2">Location</dt>
                <dd className="text-sm text-ivory/80">{bride.location}</dd>
              </div>
              <div>
                <dt className="eyebrow mb-2">Services</dt>
                <dd className="space-y-1">
                  {bride.services.map((s) => (
                    <span key={s} className="block text-sm text-ivory/80">
                      {s}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {bride.gallery.length > 0 && (
          <section aria-label="Story gallery" className="shell pb-24">
            <ul className="grid gap-5 sm:grid-cols-2">
              {bride.gallery.map((img, i) => (
                <li key={i} className={i % 3 === 0 ? "sm:col-span-2" : ""}>
                  <Reveal blur delay={i * 110}>
                    <ParallaxFrame strength={0.35}>
                      <div
                        className={`relative w-full overflow-hidden ${
                          i % 3 === 0 ? "aspect-[16/9]" : "aspect-[3/4]"
                        }`}
                        style={{ transform: "translate3d(0, calc(var(--sy) * 16px), 0)" }}
                      >
                        <EditorialImage
                          image={img}
                          className="absolute inset-0 h-full w-full"
                          sizes="(max-width: 640px) 92vw, 46vw"
                          badgeLabel="Sample story"
                        />
                      </div>
                    </ParallaxFrame>
                  </Reveal>
                </li>
              ))}
            </ul>
          </section>
        )}

        {bride.videoUrl && (
          <section aria-label="Story film" className="shell pb-24">
            <video
              src={bride.videoUrl}
              controls
              playsInline
              preload="none"
              className="w-full"
              aria-label={`${bride.name} — film`}
            />
          </section>
        )}
      </article>

      {others.length > 0 && (
        <section aria-labelledby="more-brides" className="shell pb-[var(--s-12)] sm:pb-[var(--s-16)]">
          <h2 id="more-brides" className="display-sm mb-10 text-ivory">
            More stories
          </h2>
          <ul className="grid gap-8 sm:grid-cols-2">
            {others.map((b) => (
              <li key={b.slug}>
                <Link href={`/brides/${b.slug}`} data-cursor="read" className="group block">
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <div className="absolute inset-0 transition-transform duration-[var(--d-slow)] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
                      <EditorialImage
                        image={b.hero}
                        className="h-full w-full"
                        sizes="(max-width: 640px) 92vw, 46vw"
                        decorative
                      />
                    </div>
                  </div>
                  <p className="eyebrow mt-5">{b.weddingType}</p>
                  <p className="mt-2 font-display text-2xl text-ivory group-hover:text-champagne">
                    {b.name}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
