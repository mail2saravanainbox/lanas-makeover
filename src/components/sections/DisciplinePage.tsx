import Link from "next/link";
import type { PortfolioItem, Service, SiteSettings } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";
import Reveal from "@/components/ui/Reveal";
import EditorialImage from "@/components/ui/EditorialImage";
import ParallaxFrame from "@/components/ui/ParallaxFrame";
import ClosingCTA from "@/components/sections/ClosingCTA";
import type { MediaTone } from "@/lib/types";

export interface DisciplineConfig {
  slug: string;
  eyebrow: string;
  titleLines: string[];
  intro: string;
  /** Longform editorial body — real, useful, non-promotional. */
  sections: Array<{ heading: string; body: string[]; tone: MediaTone; seed: number }>;
  /** Which portfolio categories feed this page's gallery. */
  categories: PortfolioItem["category"][];
  relatedServices: string[];
}

/**
 * Shared layout for the three discipline landing pages (/bridal, /makeup,
 * /hair). One component, three configurations — the pages differ in content,
 * never in code, which is what keeps them consistent as they grow.
 */
export default function DisciplinePage({
  config,
  items,
  services,
  settings,
}: {
  config: DisciplineConfig;
  items: PortfolioItem[];
  services: Service[];
  settings: SiteSettings;
}) {
  const related = services.filter((s) => config.relatedServices.includes(s.slug));

  /**
   * ── THE SECTION PLATES WERE NEVER GIVEN A PHOTOGRAPH ─────────────────────
   * Each section carried `{ alt, tone, seed }` and no `src`, so EditorialImage
   * fell through to PlaceholderPlate and painted a coloured gradient. Three
   * indexed landing pages — the ones disciplines.ts itself calls "the site's
   * primary organic-search surfaces" — showed four empty plates each, above a
   * gallery of the real work.
   *
   * The photographs were there the whole time: `items` is this discipline's
   * own categories. The sections take the first few and the grid below takes
   * the rest, so nothing appears twice on the page — the same rule the slot
   * allocator applies everywhere else (§7).
   *
   * If the archive is ever too thin to feed both, the plates come back rather
   * than the gallery being emptied to fill them. A section with a plate in it
   * is a design that has not been finished; a gallery with two photographs in
   * it looks like a business with no work.
   */
  const canFeedSections = items.length >= config.sections.length + 4;
  const sectionItems = canFeedSections ? items.slice(0, config.sections.length) : [];
  const gridItems = canFeedSections ? items.slice(config.sections.length) : items;

  return (
    <>
      <PageHeader
        eyebrow={config.eyebrow}
        titleLines={config.titleLines}
        intro={config.intro}
        breadcrumb={[
          { name: "Home", href: "/" },
          { name: config.eyebrow, href: `/${config.slug}` },
        ]}
      />

      <div className="shell pb-24">
        <div className="space-y-28">
          {config.sections.map((s, i) => (
            <section
              key={s.heading}
              className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-20 ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
              aria-labelledby={`d-${i}`}
            >
              <ParallaxFrame strength={0.45}>
                <Reveal blur>
                  <div
                    className="relative aspect-[4/5] w-full overflow-hidden"
                    style={{ transform: "translate3d(0, calc(var(--sy) * 20px), 0)" }}
                  >
                    <EditorialImage
                      image={
                        sectionItems[i]
                          ? {
                              src: sectionItems[i].imageUrl,
                              alt: sectionItems[i].alt,
                              width: sectionItems[i].width,
                              height: sectionItems[i].height,
                              blurDataURL: sectionItems[i].blurDataURL,
                              focus: sectionItems[i].focus,
                            }
                          : { alt: `${s.heading} — placeholder plate`, tone: s.tone, seed: s.seed }
                      }
                      className="h-full w-full"
                      sizes="(max-width: 1024px) 92vw, 46vw"
                      decorative={!sectionItems[i]}
                    />
                  </div>
                </Reveal>
              </ParallaxFrame>

              <div>
                <Reveal>
                  <h2 id={`d-${i}`} className="display-md text-ivory">
                    {s.heading}
                  </h2>
                </Reveal>
                <div className="mt-7 space-y-5">
                  {s.body.map((p, j) => (
                    <Reveal key={j} delay={90 + j * 90}>
                      <p className={j === 0 ? "body-lg max-w-lg" : "body-base max-w-lg"}>{p}</p>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        {related.length > 0 && (
          <section aria-labelledby="d-services" className="mt-28 border-t border-ivory/12 pt-14">
            <h2 id="d-services" className="eyebrow mb-8">
              Related services
            </h2>
            <ul className="flex flex-wrap gap-x-10 gap-y-4">
              {related.map((s) => (
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
        )}
      </div>

      {gridItems.length > 0 && (
        <section aria-label="Selected work" className="pb-28 sm:pb-36">
          <div className="shell mb-12 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="display-sm text-ivory">Selected work</h2>
            <Link href="/portfolio" className="tap link-wipe eyebrow !text-champagne">
              The full archive
            </Link>
          </div>
          <PortfolioGrid items={gridItems} showFilters={false} />
        </section>
      )}

      <ClosingCTA settings={settings} />
    </>
  );
}
