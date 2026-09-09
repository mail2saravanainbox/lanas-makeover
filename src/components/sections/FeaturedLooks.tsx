import Link from "next/link";
import { collectionForCategory } from "@/content/collections";
import { sectionEyebrow } from "@/lib/utils";
import type { PortfolioCategory, PortfolioItem } from "@/lib/types";
import EditorialImage from "@/components/ui/EditorialImage";
import { facetsFor } from "@/lib/portfolio/facets";
import ParallaxFrame from "@/components/ui/ParallaxFrame";
import Reveal from "@/components/ui/Reveal";
import SplitLines from "@/components/ui/SplitLines";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE LANA LOOK (§7) — the proof, immediately after the hero
 * ═══════════════════════════════════════════════════════════════════════════
 *  A bride arriving from Instagram has one question before any other: is the
 *  work good. This section answers it before the site asks her for anything,
 *  which is why it sits directly under the hero rather than eighth.
 *
 *  What stands in for bride stories until real, permissioned ones exist. The
 *  distinction matters: a *look* is a photograph of work, captioned with what
 *  is actually known about it. A *story* asserts facts about a named person
 *  and her wedding day. This shows the former and never pretends to be the
 *  latter — no names, no dates, no invented narrative.
 *
 *  ⚠ THE CAPTIONS ARE DERIVED, NEVER WRITTEN (§38). Each card carries the
 *    facets `facetsFor` can genuinely establish — the event, the register, the
 *    hair. A location is printed ONLY when the photograph carries one, and the
 *    current stand-in archive carries none, so none is printed. "Muhurtham ·
 *    Trichy" under a stock photograph would be exactly the fabricated proof
 *    this file exists to avoid.
 * ═══════════════════════════════════════════════════════════════════════════
 */
/**
 * A featured look now points at its COLLECTION with the lightbox pre-opened,
 * because Task 3.3 retired the per-image routes. Falls back to the archive
 * index for a category with no room of its own.
 */
function collectionHref(item: { slug: string; category: PortfolioCategory }): string {
  const c = collectionForCategory(item.category);
  return c ? `/portfolio/${c.slug}?image=${item.slug}` : "/portfolio";
}

/** "Muhurtham · Traditional · Jadai", from whatever the facets can establish. */
function caption(item: PortfolioItem): string {
  const f = facetsFor(item);
  return [f.event[0], f.look[0], f.hair[0]].filter(Boolean).join(" · ");
}

export default function FeaturedLooks({
  index,
  items,
}: {
  index: number;
  items: PortfolioItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="section-dark relative py-[var(--s-12)] sm:py-[var(--s-16)]" aria-labelledby="looks-title">
      <div className="shell">
        <Reveal>
          <p className="eyebrow mb-8">{sectionEyebrow(index, "The work")}</p>
        </Reveal>
        <SplitLines
          as="h2"
          id="looks-title"
          className="display-md max-w-[18ch] text-ivory"
          lines={["The Lana", "look."]}
        />

        {/* One row of three. Six in a staggered field was a portfolio page
            pretending to be a homepage section. */}
        <ul className="mt-16 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 3).map((item, i) => (
            <li key={item.id}>
              <Reveal blur delay={(i % 3) * 120}>
                <Link
                  href={collectionHref(item)}
                  data-cursor="view"
                  className="group block"
                  aria-label={`View ${item.title}`}
                >
                  <ParallaxFrame strength={0.4}>
                    <div
                      className="relative aspect-[3/4] w-full overflow-hidden"
                      style={{ transform: "translate3d(0, calc(var(--sy) * 20px), 0)" }}
                    >
                      <div className="absolute inset-0 transition-transform duration-[var(--d-slow)] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
                        <EditorialImage
                          image={{
                            src: item.thumbnailUrl ?? item.imageUrl,
                            alt: item.alt,
                            tone: item.tone,
                            seed: item.seed,
                            blurDataURL: item.blurDataURL,
                            focus: item.focus,
                          }}
                          className="h-full w-full"
                          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
                        />
                      </div>
                    </div>
                  </ParallaxFrame>
                  {/* Event · register · hair — only what is actually known
                      about this photograph. An axis with nothing on it prints
                      nothing rather than a dash. */}
                  <p className="eyebrow mt-6">{caption(item) || item.category.replace("-", " ")}</p>
                  <h3 className="mt-3 font-display text-2xl text-ivory transition-colors duration-[var(--d-base)] group-hover:text-champagne">
                    {item.title}
                  </h3>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal>
          <div className="mt-20 text-center">
            <Link href="/portfolio" className="btn">
              View the work
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
