"use client";

import { useRef, useState } from "react";
import { clamp, cx, sectionEyebrow } from "@/lib/utils";
import { useScrollProgress } from "@/lib/motion/scheduler";
import type { ImageRef, MediaTone } from "@/lib/types";
import EditorialImage from "@/components/ui/EditorialImage";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ACT III — THE BRIDAL TRANSFORMATION (§7)
 * ═══════════════════════════════════════════════════════════════════════════
 *  The primary interaction of the site. A tall scroll track with a pinned
 *  frame; scroll position maps continuously onto five stages.
 *
 *  WITH WEBGL   the pinned frame is transparent and `TransformationScene`
 *               renders a displaced, dissolving image plane behind this type.
 *  WITHOUT      the same five stages crossfade as layered plates in the DOM.
 *
 *  Either way the stage list is real text: readable, crawlable, and navigable
 *  by keyboard. There is no scroll-jacking — the page scrolls natively and the
 *  visual simply follows.
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface Stage {
  index: string;
  name: string;
  note: string;
  tone: MediaTone;
  seed: number;
}

const STAGES: Stage[] = [
  {
    index: "01",
    name: "The Face",
    note: "Before anything is added. This is where the look is actually decided — what is there, what is not, and what will be left alone.",
    tone: "ink",
    seed: 501,
  },
  {
    index: "02",
    name: "The Skin",
    note: "Cleanse, correct, protect. The half hour nobody photographs, and the one every finish depends on.",
    tone: "ivory",
    seed: 502,
  },
  {
    index: "03",
    name: "The Eyes",
    note: "Definition arrives. The brow, the lash line, the shape of the eye — drawn out rather than drawn on.",
    tone: "bronze",
    seed: 503,
  },
  {
    index: "04",
    name: "The Hair",
    note: "The jadai is built. Braid, volume, anchor points — then the jasmine, measured in muzham, threaded down its length.",
    tone: "olive",
    seed: 504,
  },
  {
    index: "05",
    name: "The Adornment",
    note: "Kanchipuram silk, and gold set last. Vanki, oddiyanam, the weight of the ceremony settling onto her.",
    tone: "champagne",
    seed: 505,
  },
  {
    index: "06",
    name: "The Bride",
    note: "And then she is ready. Still, unmistakably, herself.",
    tone: "rose",
    seed: 506,
  },
];

const PLATES: ImageRef[] = STAGES.map((s) => ({ alt: s.name, tone: s.tone, seed: s.seed }));

export default function ActRitual({
  index,
  images = PLATES,
}: {
  index: number;
  images?: ImageRef[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const plateRefs = useRef<Array<HTMLDivElement | null>>([]);
  const barRef = useRef<HTMLDivElement>(null);
  /**
   * Six stages across a 500vh track. `active` changes six times; the plate
   * crossfade and the progress bar are written directly to the DOM and never
   * enter React at all.
   */
  const [active, setActive] = useState(0);

  useScrollProgress(trackRef, ({ p }) => {
    const exact = p * (STAGES.length - 1);

    for (let i = 0; i < STAGES.length; i++) {
      const el = plateRefs.current[i];
      if (!el) continue;
      const d = Math.abs(exact - i);
      el.style.opacity = clamp(1 - d).toFixed(4);
      el.style.transform = `scale(${(1 + d * 0.045).toFixed(3)})`;
    }

    if (barRef.current) barRef.current.style.width = `${(p * 100).toFixed(2)}%`;

    const index = Math.round(exact);
    setActive((prev) => (prev === index ? prev : index));
  });

  return (
    <section aria-labelledby="ritual-title" className="section-dark relative">
      {/* Header travels past first, then the track pins */}
      <div className="shell relative z-20 pb-20 pt-28 text-center sm:pt-40">
        <p className="eyebrow mb-8">{sectionEyebrow(index, "The ritual")}</p>
        <h2 id="ritual-title" className="display-md mx-auto max-w-[16ch] text-balance text-ivory">
          Face. Skin. Eyes. Hair.
          <br />
          <span className="italic-serif text-champagne">Gold. Bride.</span>
        </h2>
        <p className="body-lg mx-auto mt-8 max-w-xl">
          Six stages, in the order a Tamil bridal morning actually runs.
        </p>
      </div>

      {/* ── The track ─────────────────────────────────────────────────────── */}
      <div ref={trackRef} className="relative h-[500vh]">
        <div className="sticky top-0 flex h-[100dvh] items-center overflow-hidden">
          {/* The stage plates. These ARE the section now — there is no
              WebGL understudy, because there is no WebGL. */}
          <div className="absolute inset-0" aria-hidden="true">
              {STAGES.map((s, i) => (
                <div
                  key={s.index}
                  ref={(el) => {
                    plateRefs.current[i] = el;
                  }}
                  className="absolute inset-0"
                  style={{
                    opacity: i === 0 ? 1 : 0,
                    transition:
                      "opacity var(--d-fast) linear, transform var(--d-base) var(--ease-silk)",
                  }}
                >
                  <EditorialImage
                    image={images[i] ?? PLATES[i]}
                    className="h-full w-full"
                    sizes="100vw"
                    decorative
                  />
                </div>
              ))}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/80" />
          </div>

          {/* Readable content, always present */}
          <div className="shell relative z-10 grid w-full items-end gap-10 pb-16 sm:pb-24 lg:grid-cols-[auto_1fr] lg:items-center">
            <ol className="flex gap-6 lg:flex-col lg:gap-5" aria-label="Transformation stages">
              {STAGES.map((s, i) => {
                const on = i === active;
                return (
                  <li key={s.index} className="flex items-baseline gap-3">
                    <span
                      className={cx(
                        "font-mono text-[0.75rem] tracking-[0.2em] transition-colors duration-[var(--d-base)]",
                        on ? "text-champagne" : "text-inactive",
                      )}
                    >
                      {s.index}
                    </span>
                    <span
                      className={cx(
                        "font-display text-lg uppercase tracking-[0.22em] transition-all duration-[var(--d-base)] sm:text-xl",
                        on ? "text-ivory opacity-100" : "text-inactive opacity-70",
                      )}
                    >
                      {s.name}
                    </span>
                  </li>
                );
              })}
            </ol>

            <div className="max-w-xl lg:justify-self-end lg:text-right">
              <p
                key={active}
                className="display-sm text-balance text-ivory/90"
                style={{ animation: "stage-in var(--d-slow) var(--ease-silk) both" }}
              >
                {STAGES[active].note}
              </p>

              <div className="mt-10 h-px w-full bg-ivory/12 lg:ml-auto lg:w-56">
                <div
                  ref={barRef}
                  className="h-px bg-champagne"
                  style={{ width: 0, transition: "width 120ms linear" }}
                />
              </div>
              <p className="sr-only" aria-live="polite">
                Stage {STAGES[active].index}: {STAGES[active].name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes stage-in {
          from { opacity: 0; transform: translate3d(0, 14px, 0); filter: blur(6px); }
          to   { opacity: 1; transform: none; filter: blur(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes stage-in { from { opacity: 1; } to { opacity: 1; } }
        }
      `}</style>
    </section>
  );
}
