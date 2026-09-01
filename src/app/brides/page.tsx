import type { Metadata } from "next";
import Link from "next/link";
import { content } from "@/lib/content/provider";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import PageHeader from "@/components/ui/PageHeader";
import EditorialImage from "@/components/ui/EditorialImage";
import ParallaxFrame from "@/components/ui/ParallaxFrame";
import Reveal from "@/components/ui/Reveal";
import JsonLd from "@/components/ui/JsonLd";
import ClosingCTA from "@/components/sections/ClosingCTA";
import FeaturedLooksList from "@/components/sections/FeaturedLooksList";

export const metadata: Metadata = pageMetadata({
  title: "Bride Stories",
  description:
    "The women behind the looks — muhurtham, reception and engagement stories documented by Lana's Makeover.",
  path: "/brides",
});

export default async function BridesPage() {
  const provider = content();
  const [brides, settings, featured] = await Promise.all([
    provider.getBrides(),
    provider.getSiteSettings(),
    provider.getPortfolio({ featured: true, limit: 9 }),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Brides", path: "/brides" },
        ])}
      />

      <PageHeader
        eyebrow="The women"
        titleLines={["The women we’ve had", "the honour to create."]}
        intro="Each commission documented as a story rather than a gallery — the ceremony, the look, and the morning it took."
        breadcrumb={[
          { name: "Home", href: "/" },
          { name: "Brides", href: "/brides" },
        ]}
      />

      {brides.length === 0 && (
        <div className="shell -mt-6 mb-14">
          <p className="body-base max-w-xl border-l border-champagne/30 pl-5">
            Individual bride stories are published only with the bride&rsquo;s permission. Until
            then, this is the featured work.
          </p>
        </div>
      )}

      <section aria-label="Bride stories" className="shell pb-[var(--s-12)] sm:pb-[var(--s-16)]">
        {brides.length === 0 ? (
          <FeaturedLooksList items={featured} />
        ) : (
          <ul className="grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {brides.map((b, i) => (
              <li key={b.slug} className={i % 3 === 1 ? "lg:mt-16" : ""}>
                <Reveal blur delay={(i % 3) * 120}>
                  <Link href={`/brides/${b.slug}`} data-cursor="read" className="group block">
                    <ParallaxFrame strength={0.4}>
                      <div
                        className="relative aspect-[3/4] w-full overflow-hidden"
                        style={{ transform: "translate3d(0, calc(var(--sy) * 20px), 0)" }}
                      >
                        <div className="absolute inset-0 transition-transform duration-[var(--d-slow)] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
                          <EditorialImage
                            image={b.hero}
                            className="h-full w-full"
                            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
                            badgeLabel="Sample story"
                          />
                        </div>
                      </div>
                    </ParallaxFrame>
                    <p className="eyebrow mt-6">
                      {b.weddingType} · {b.location}
                    </p>
                    <h2 className="mt-3 font-display text-2xl text-ivory transition-colors duration-[var(--d-base)] group-hover:text-champagne">
                      {b.name}
                    </h2>
                    <p className="body-base mt-3 line-clamp-3">{b.excerpt}</p>
                    <span className="mt-5 inline-block text-[0.75rem] uppercase tracking-[0.24em] text-muted">
                      Read her story
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ClosingCTA settings={settings} />
    </>
  );
}
