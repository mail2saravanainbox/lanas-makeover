"use client";

import { useRef, useState } from "react";
import type { ImageRef, MediaTone } from "@/lib/types";
import EditorialImage from "@/components/ui/EditorialImage";
import Reveal from "@/components/ui/Reveal";
import SplitLines from "@/components/ui/SplitLines";
import KolamGrid from "./KolamGrid";
import { clamp, norm } from "@/lib/utils";
import { useScrollProgress } from "@/lib/motion/scheduler";

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

/** Each material owns an equal share of the track. */
const SPAN = 1 / MATERIALS.length;

export default function ActHeritage({ images = [] }: { images?: ImageRef[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);
  /**
   * The ONLY React state here. It changes three times across a 320vh track —
   * once per material — and drives the panel that is mounted-visible and the
   * aria-live announcement. Everything continuous is a CSS custom property
   * written straight to the DOM, so scrolling re-renders nothing.
   */
  const [activeIndex, setActiveIndex] = useState(0);

  useScrollProgress(trackRef, ({ p }) => {
    const index = Math.min(MATERIALS.length - 1, Math.floor(p / SPAN));

    for (let i = 0; i < MATERIALS.length; i++) {
      const el = panelRefs.current[i];
      if (!el) continue;
      // Within this material's share: 0 as it starts, 1 as it ends.
      const local = clamp((p - i * SPAN) / SPAN);
      // The close-up resolves into the bride across the last half of it.
      el.style.setProperty("--local", local.toFixed(4));
      el.style.setProperty("--reveal", norm(local, 0.45, 0.85).toFixed(4));
    }

    setActiveIndex((prev) => (prev === index ? prev : index));
  });

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
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
                aria-hidden={!on}
                className="absolute inset-0"
                style={
                  {
                    opacity: on ? 1 : 0,
                    transition: "opacity var(--d-base) linear",
                    "--local": 0,
                    "--reveal": 0,
                  } as React.CSSProperties
                }
              >
                {/* MATERIAL — the close-up */}
                <div
                  className="absolute inset-0"
                  style={{
                    opacity: "calc(1 - var(--reveal))",
                    transform: "scale(calc(1 + var(--reveal) * 0.12))",
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
                    clipPath: "circle(calc(var(--reveal) * 115%) at 50% 45%)",
                    opacity: "min(1, calc(var(--reveal) * 1.3))",
                    transform: "scale(calc(1.1 - var(--reveal) * 0.1))",
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
                      transform: "translateY(calc((1 - var(--local)) * 14px))",
                      opacity: "min(1, calc(var(--local) * 3))",
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
