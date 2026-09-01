import Link from "next/link";
import type { PortfolioItem } from "@/lib/types";
import EditorialImage from "@/components/ui/EditorialImage";
import ParallaxFrame from "@/components/ui/ParallaxFrame";
import Reveal from "@/components/ui/Reveal";
import SplitLines from "@/components/ui/SplitLines";

/**
 * FEATURED BRIDAL LOOKS (§16)
 *
 * What stands in for bride stories until real, permissioned ones exist.
 *
 * The distinction matters: a *look* is a photograph of work, titled neutrally.
 * A *story* asserts facts about a named person and her wedding day. This
 * section shows the former and never pretends to be the latter — no names, no
 * dates, no invented narrative.
 */
export default function FeaturedLooks({ items }: { items: PortfolioItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="section-dark relative py-28 sm:py-40" aria-labelledby="looks-title">
      <div className="shell">
        <Reveal>
          <p className="eyebrow mb-8">08 — The work</p>
        </Reveal>
        <SplitLines
          as="h2"
          id="looks-title"
          className="display-md max-w-[18ch] text-ivory"
          lines={["Featured", "bridal looks."]}
        />

        <ul className="mt-16 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <li key={item.id} className={i % 3 === 1 ? "lg:mt-14" : ""}>
              <Reveal blur delay={(i % 3) * 120}>
                <Link
                  href={`/portfolio/${item.slug}`}
                  data-cursor="view"
                  className="group block"
                  aria-label={`View ${item.title}`}
                >
                  <ParallaxFrame strength={0.4}>
                    <div
                      className="relative aspect-[3/4] w-full overflow-hidden"
                      style={{ transform: "translate3d(0, calc(var(--sy) * 20px), 0)" }}
                    >
                      <div className="absolute inset-0 transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
                        <EditorialImage
                          image={{
                            src: item.thumbnailUrl ?? item.imageUrl,
                            alt: item.alt,
                            tone: item.tone,
                            seed: item.seed,
                            blurDataURL: item.blurDataURL,
                          }}
                          className="h-full w-full"
                          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
                        />
                      </div>
                    </div>
                  </ParallaxFrame>
                  <p className="eyebrow mt-6">{item.category.replace("-", " ")}</p>
                  <h3 className="mt-3 font-display text-2xl text-ivory transition-colors duration-500 group-hover:text-champagne">
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
              The full portfolio
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
