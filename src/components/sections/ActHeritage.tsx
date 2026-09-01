"use client";

import { useEffect, useRef, useState } from "react";
import type { ImageRef, MediaTone } from "@/lib/types";
import EditorialImage from "@/components/ui/EditorialImage";
import Reveal from "@/components/ui/Reveal";
import SplitLines from "@/components/ui/SplitLines";
import KolamGrid from "./KolamGrid";
import { clamp, norm } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ACT IV — MATERIAL → MOVEMENT → BRIDE
 * ═══════════════════════════════════════════════════════════════════════════
 *  Not an information block about Tamil materials. A sequence.
 *
 *    SILK      close on the weave      → she is wearing it
 *    GOLD      close on the setting    → she is wearing it
 *    JASMINE   close on the strand     → it is in her hair
 *                                      → THE BRIDE
 *
 *  Each material holds, then the camera pulls back and the bride is revealed
 *  carrying it. That is the whole grammar of the site in miniature: the detail
 *  always resolves into the woman.
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface Material {
  name: string;
  line: string;
  note: string;
  tone: MediaTone;
  seed: number;
  brideTone: MediaTone;
  brideSeed: number;
}

const MATERIALS: Material[] = [
  {
    name: "Silk",
    line: "Woven in three parts, joined at the border.",
    note: "Kanchipuram holds its own weight — which is why it photographs like architecture and drapes like nothing else.",
    tone: "bronze",
    seed: 601,
    brideTone: "rose",
    brideSeed: 611,
  },
  {
    name: "Gold",
    line: "Cast heavy, worn in layers.",
    note: "Vanki, oddiyanam, temple work. Set last, because it changes the balance of everything set before it.",
    tone: "champagne",
    seed: 602,
    brideTone: "bronze",
    brideSeed: 612,
  },
  {
    name: "Jasmine",
    line: "Measured in muzham, not in stems.",
    note: "It wilts. It is the one part of the look with a running clock — and the part that frames the silhouette.",
    tone: "olive",
    seed: 603,
    brideTone: "ivory",
    brideSeed: 613,
  },
];

export default function ActHeritage({ images = [] }: { images?: ImageRef[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      setP(travel > 0 ? clamp(-r.top / travel) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Each material owns a third of the track; within it, the close-up resolves
  // into the bride at the two-thirds mark.
  const span = 1 / MATERIALS.length;
  const activeIndex = Math.min(MATERIALS.length - 1, Math.floor(p / span));
  const local = clamp((p - activeIndex * span) / span);
  const reveal = norm(local, 0.45, 0.85);

  return (
    <section aria-labelledby="heritage-title" className="section-dark relative">
      <KolamGrid
        className="pointer-events-none absolute right-[4%] top-[6%] z-10 h-[30rem] w-[30rem] text-champagne/[0.05]"
        cells={7}
      />

      <div className="shell relative z-10 pb-16 pt-[var(--s-12)] sm:pt-[var(--s-16)]">
        <Reveal>
          <p className="eyebrow mb-8">06 — The Tamil soul</p>
        </Reveal>
        <SplitLines
          as="h2"
          id="heritage-title"
          className="display-md max-w-[20ch] text-ivory"
          lines={["Silk, gold and jasmine", "are not decoration."]}
        />
        <Reveal delay={280}>
          <p className="body-lg mt-8 max-w-xl">
            They are the conditions the work has to survive — and the reason a Tamil bridal face
            is built differently from any other.
          </p>
        </Reveal>
      </div>

      {/* Jasmine drifts through this act in the WebGL layer */}
      <div
        data-scene="heritage-jasmine"
        aria-hidden="true"
        className="pointer-events-none absolute left-[4%] top-[42%] aspect-square w-[min(22vmin,13rem)]"
      />

      <div ref={trackRef} className="relative h-[320vh]">
        <div className="sticky top-0 flex h-[100dvh] items-center overflow-hidden">
          {MATERIALS.map((m, i) => {
            const on = i === activeIndex;
            const closeUp = images[i * 2] ?? { alt: m.name, tone: m.tone, seed: m.seed };
            const bride =
              images[i * 2 + 1] ?? { alt: `${m.name} worn`, tone: m.brideTone, seed: m.brideSeed };

            return (
              <div
                key={m.name}
                aria-hidden={!on}
                className="absolute inset-0"
                style={{ opacity: on ? 1 : 0, transition: "opacity var(--d-base) linear" }}
              >
                {/* MATERIAL — the close-up */}
                <div
                  className="absolute inset-0"
                  style={{
                    opacity: 1 - reveal,
                    transform: `scale(${(1 + reveal * 0.12).toFixed(3)})`,
                  }}
                >
                  <EditorialImage
                    image={closeUp}
                    className="h-full w-full"
                    sizes="100vw"
                    decorative
                  />
                </div>

                {/* BRIDE — she is wearing it. Revealed by a widening aperture. */}
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: `circle(${(reveal * 115).toFixed(1)}% at 50% 45%)`,
                    opacity: clamp(reveal * 1.3),
                    transform: `scale(${(1.1 - reveal * 0.1).toFixed(3)})`,
                  }}
                >
                  <EditorialImage
                    image={bride}
                    className="h-full w-full"
                    sizes="100vw"
                    decorative
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/55" />

                {/* Type */}
                <div className="shell relative flex h-full flex-col justify-end pb-20 sm:pb-28">
                  <p
                    className="display-lg text-ivory"
                    style={{
                      transform: `translateY(${((1 - local) * 14).toFixed(1)}px)`,
                      opacity: clamp(local * 3),
                    }}
                  >
                    {m.name}
                  </p>
                  <p className="italic-serif mt-4 max-w-xl text-[clamp(1.05rem,2vw,1.5rem)] text-champagne">
                    {m.line}
                  </p>
                  <p className="body-base mt-5 max-w-md">{m.note}</p>

                  {/* Progress through the three materials */}
                  <ol className="mt-10 flex gap-5" aria-label="Materials">
                    {MATERIALS.map((other, j) => (
                      <li
                        key={other.name}
                        className={
                          j === activeIndex
                            ? "text-[0.75rem] uppercase tracking-[0.26em] text-champagne"
                            : "text-[0.75rem] uppercase tracking-[0.26em] text-inactive"
                        }
                      >
                        {other.name}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            );
          })}

          <p className="sr-only" aria-live="polite">
            {MATERIALS[activeIndex].name}: {MATERIALS[activeIndex].line}
          </p>
        </div>
      </div>

      {/* The resolution of the sequence */}
      <div className="shell relative z-10 py-24 text-center sm:py-32">
        <Reveal blur>
          <p className="display-md text-ivory">
            And then, <span className="italic-serif text-champagne">the bride.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
