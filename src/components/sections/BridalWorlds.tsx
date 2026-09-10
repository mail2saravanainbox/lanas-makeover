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

        {/* ── ONE 2×2 GRID ON A PHONE ────────────────────────────────────
            Two full-bleed 16:7 panels and two cards is a desktop composition:
            it makes muhurtham and bridal hair the headline and reception and
            engagement the follow-up, which is the right emphasis on a wide
            screen. Linearised onto 390px it becomes four stacked blocks over
            roughly three screens, all reading as equals anyway.

            On mobile the panels take the same square tile as the cards and the
            four sit in one 2×2 grid — a chooser, which is what the section is
            for. The summary line goes with it: four sentences of body copy in
            a grid of thumbnails is not a chooser. */}
        <div className="mt-16 grid grid-cols-2 gap-3 lg:block lg:space-y-5">
          {panels.map((s) => (
            <Reveal key={s.slug}>
              <Link
                href={`/services/${s.slug}`}
                data-cursor="view"
                className="group relative block aspect-[4/5] w-full overflow-hidden lg:aspect-[16/7]"
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
                <span className="absolute inset-x-0 bottom-0 p-4 lg:p-10">
                  <span className="eyebrow mb-2 hidden !text-champagne/80 lg:mb-3 lg:block">
                    {s.eyebrow}
                  </span>
                  <span className="font-display text-xl leading-tight text-ivory lg:display-md lg:block">
                    {s.name}
                  </span>
                  <span className="body-base measure-note mt-3 hidden lg:block">{s.summary}</span>
                </span>
              </Link>
            </Reveal>
          ))}

          <div className="contents lg:grid lg:grid-cols-2 lg:gap-5">
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
