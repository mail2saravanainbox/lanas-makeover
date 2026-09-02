import Link from "next/link";
import { sectionEyebrow } from "@/lib/utils";
import type { Service } from "@/lib/types";
import EditorialImage from "@/components/ui/EditorialImage";
import Reveal from "@/components/ui/Reveal";
import SplitLines from "@/components/ui/SplitLines";
import WorldCard from "./WorldCard";

/**
 * THE CEREMONIES
 *
 * Six equal cards said all six mattered equally. They do not. Muhurtham and
 * bridal hair are the work this studio is actually asked for, so they get
 * full-width 16:9 panels; reception and engagement follow as cards. Occasion
 * and the signature look live on /services, where someone looking for them
 * will go.
 */
const PANELS = ["muhurtham", "bridal-hair"];
const CARDS = ["reception", "engagement"];
export default function BridalWorlds({
  index,
  services,
}: {
  index: number;
  services: Service[];
}) {
  const by = (slugs: string[]) =>
    slugs.map((slug) => services.find((s) => s.slug === slug)).filter((s): s is Service => !!s);

  const panels = by(PANELS);
  const cards = by(CARDS);
  if (panels.length === 0 && cards.length === 0) return null;

  return (
    <section className="section-dark relative py-[var(--s-12)] sm:py-[var(--s-16)]" aria-labelledby="worlds-title">
      <div className="shell">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal>
              <p className="eyebrow mb-8">{sectionEyebrow(index, "The ceremonies")}</p>
            </Reveal>
            <SplitLines
              as="h2"
              id="worlds-title"
              className="display-md text-ivory"
              lines={["The ceremonies."]}
            />
          </div>
          <Reveal delay={260}>
            <Link href="/services" className="btn btn-ghost shrink-0">
              All services
            </Link>
          </Reveal>
        </div>

        <div className="mt-16 space-y-5">
          {panels.map((s) => (
            <Reveal key={s.slug}>
              <Link
                href={`/services/${s.slug}`}
                data-cursor="view"
                className="group relative block aspect-[16/10] w-full overflow-hidden sm:aspect-[16/7]"
              >
                <div className="absolute inset-0 transition-transform duration-[var(--d-slow)] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]">
                  <EditorialImage
                    image={s.image}
                    className="h-full w-full"
                    sizes="(max-width: 1280px) 96vw, 90vw"
                    decorative
                  />
                </div>
                <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                  <span className="eyebrow mb-3 block !text-champagne/80">{s.eyebrow}</span>
                  <span className="display-md block text-ivory">{s.name}</span>
                  <span className="body-base measure-note mt-3 block">{s.summary}</span>
                </span>
              </Link>
            </Reveal>
          ))}

          <div className="grid gap-5 sm:grid-cols-2">
            {cards.map((s, i) => (
              <Reveal key={s.slug} delay={i * 130}>
                <WorldCard
                  href={`/services/${s.slug}`}
                  eyebrow={s.eyebrow}
                  name={s.name}
                  summary={s.summary}
                  index={panels.length + i + 1}
                >
                  <EditorialImage
                    image={s.image}
                    className="h-full w-full"
                    sizes="(max-width: 640px) 92vw, 46vw"
                    decorative
                  />
                </WorldCard>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
