import Link from "next/link";
import type { PortfolioItem } from "@/lib/types";
import EditorialImage from "@/components/ui/EditorialImage";
import ParallaxFrame from "@/components/ui/ParallaxFrame";
import Reveal from "@/components/ui/Reveal";

/**
 * The /brides index when no permissioned bride story has been published yet.
 * Real work, neutral titles, no invented identity (§15, §16).
 */
export default function FeaturedLooksList({ items }: { items: PortfolioItem[] }) {
  if (items.length === 0) {
    return <p className="body-lg py-16 text-center">The first stories are being written.</p>;
  }

  return (
    <ul className="grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <li key={item.id} className={i % 3 === 1 ? "lg:mt-16" : ""}>
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
                  <div className="absolute inset-0 transition-transform duration-[var(--d-slow)] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
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
              <h2 className="mt-3 font-display text-2xl text-ivory transition-colors duration-[var(--d-base)] group-hover:text-champagne">
                {item.title}
              </h2>
            </Link>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
