"use client";

import { useState } from "react";
import EditorialImage from "@/components/ui/EditorialImage";
import Reveal from "@/components/ui/Reveal";
import SplitLines from "@/components/ui/SplitLines";
import { cx } from "@/lib/utils";
import type { ImageRef, MediaTone } from "@/lib/types";

/**
 * THE ART OF THE DETAIL (§20)
 *
 * Six disciplines. Hovering — or focusing, or tapping — swaps the close-up
 * behind the list with a scale-and-blur crossfade.
 *
 * Keyboard-operable by design: these are buttons, not hover-only divs.
 */
const DETAILS: Array<{
  key: string;
  label: string;
  note: string;
  tone: MediaTone;
  seed: number;
}> = [
  { key: "skin", label: "Skin", note: "Treated as skin. Prepared long before any colour is chosen.", tone: "ivory", seed: 701 },
  { key: "eyes", label: "Eyes", note: "Structure over statement — the shape of the eye, not the shape of a trend.", tone: "ink", seed: 702 },
  { key: "lips", label: "Lips", note: "Built to survive a ceremony, a meal and several hundred embraces.", tone: "rose", seed: 703 },
  { key: "hair", label: "Hair", note: "The silhouette. Half the look, decided from across the hall.", tone: "bronze", seed: 704 },
  { key: "draping", label: "Draping", note: "Nine yards of silk that has to fall correctly for twelve hours.", tone: "champagne", seed: 705 },
  { key: "jewellery", label: "Jewellery", note: "Set last, and it changes everything set before it.", tone: "bronze", seed: 706 },
];

const PLATES: ImageRef[] = DETAILS.map((d) => ({ alt: d.label, tone: d.tone, seed: d.seed }));

export default function DetailArt({ images = PLATES }: { images?: ImageRef[] }) {
  const [active, setActive] = useState(0);

  return (
    <section className="section-dark relative py-[var(--s-12)] sm:py-[var(--s-16)]" aria-labelledby="detail-title">
      <div className="shell">
        <Reveal>
          <p className="eyebrow mb-8">10 — The detail</p>
        </Reveal>
        <SplitLines
          as="h2"
          id="detail-title"
          className="display-md text-ivory"
          lines={["The art of the detail."]}
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
          <ul className="divide-y divide-ivory/10 border-y border-ivory/10">
            {DETAILS.map((d, i) => (
              <li key={d.key}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-pressed={active === i}
                  className="group flex w-full items-baseline justify-between gap-6 py-6 text-left transition-colors duration-[var(--d-base)]"
                >
                  <span
                    className={cx(
                      "font-display text-[clamp(1.8rem,4vw,3rem)] uppercase leading-none tracking-[0.04em] transition-all duration-[var(--d-base)] ease-[cubic-bezier(0.16,1,0.3,1)]",
                      active === i
                        ? "translate-x-2 text-ivory"
                        : "translate-x-0 text-inactive group-hover:text-ivory/70",
                    )}
                  >
                    {d.label}
                  </span>
                  <span
                    className={cx(
                      "hidden max-w-[22ch] shrink-0 text-right text-xs leading-relaxed transition-opacity duration-[var(--d-base)] sm:block",
                      active === i ? "text-muted opacity-100" : "opacity-0",
                    )}
                  >
                    {d.note}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="relative aspect-[4/5] w-full overflow-hidden lg:aspect-auto lg:min-h-[34rem]">
            {DETAILS.map((d, i) => (
              <div
                key={d.key}
                aria-hidden={active !== i}
                className="absolute inset-0 transition-[opacity,transform,filter] duration-[var(--d-slow)] ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  opacity: active === i ? 1 : 0,
                  transform: active === i ? "scale(1)" : "scale(1.07)",
                  filter: active === i ? "blur(0)" : "blur(12px)",
                }}
              >
                <EditorialImage
                  image={images[i] ?? PLATES[i]}
                  className="h-full w-full"
                  sizes="(max-width: 1024px) 92vw, 42vw"
                  decorative
                />
              </div>
            ))}
            <p className="absolute bottom-5 left-5 z-10 text-xs text-ivory/70 sm:hidden">
              {DETAILS[active].note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
