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

export const metadata: Metadata = pageMetadata({
  title: "Bride Stories",
  description:
    "The women behind the looks — muhurtham, reception and engagement stories documented by Lana's Makeover.",
  path: "/brides",
});

export default async function BridesPage() {
  const provider = content();
  const [brides, settings] = await Promise.all([provider.getBrides(), provider.getSiteSettings()]);

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

      {settings.showPlaceholderBadges && (
        <div className="shell -mt-6 mb-14">
          <p className="body-base max-w-xl border-l border-champagne/30 pl-5">
            Sample entries. Real bride stories — with permission and photography — replace these
            without any change to this page.
          </p>
        </div>
      )}

      <section aria-label="Bride stories" className="shell pb-28 sm:pb-40">
        {brides.length === 0 ? (
          <p className="body-lg py-16 text-center">The first stories are being written.</p>
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
                        <div className="absolute inset-0 transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
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
                    <h2 className="mt-3 font-display text-2xl text-ivory transition-colors duration-500 group-hover:text-champagne">
                      {b.name}
                    </h2>
                    <p className="body-base mt-3 line-clamp-3">{b.excerpt}</p>
                    <span className="mt-5 inline-block text-[0.62rem] uppercase tracking-[0.24em] text-muted">
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
