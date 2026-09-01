"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import EditorialImage from "@/components/ui/EditorialImage";
import Reveal from "@/components/ui/Reveal";
import SplitLines from "@/components/ui/SplitLines";
import { clamp, cx } from "@/lib/utils";
import type { ImageRef, MediaTone } from "@/lib/types";

/**
 * THE SILHOUETTE OF THE BRIDE (§19)
 *
 * Hair gets its own act. Scrolling the track advances the silhouette through
 * six states; no fake 3D head, no CG hair — real photography is the plan, and
 * placeholder plates hold the composition until it arrives.
 */
const LOOKS: Array<{ name: string; note: string; tone: MediaTone; seed: number }> = [
  { name: "Open", note: "Nothing set. The natural fall of the hair.", tone: "ink", seed: 801 },
  { name: "Waved", note: "Texture worked in first — structure holds better on it.", tone: "bronze", seed: 802 },
  { name: "Braided", note: "The base tension that everything else is pinned to.", tone: "champagne", seed: 803 },
  { name: "Jadai", note: "Ornamental plates graduated down the length of the braid.", tone: "bronze", seed: 804 },
  { name: "Flowered", note: "Jasmine, measured in muzham. The clock starts here.", tone: "olive", seed: 805 },
  { name: "Bridal", note: "The silhouette that reads from the back of the hall.", tone: "rose", seed: 806 },
];

const PLATES: ImageRef[] = LOOKS.map((l) => ({ alt: `${l.name} bridal hair`, tone: l.tone, seed: l.seed }));

export default function HairSilhouette({ images = PLATES }: { images?: ImageRef[] }) {
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

  const exact = p * (LOOKS.length - 1);
  const active = Math.round(exact);

  return (
    <section aria-labelledby="hair-title" className="section-dark relative">
      <div ref={trackRef} className="relative h-[380vh]">
        <div className="sticky top-0 flex h-[100dvh] items-center overflow-hidden">
          <div className="shell grid w-full items-center gap-10 lg:grid-cols-[1fr_0.95fr] lg:gap-20">
            <div className="order-2 lg:order-1">
              <Reveal>
                <p className="eyebrow mb-8">The silhouette</p>
              </Reveal>
              <SplitLines
                as="h2"
                id="hair-title"
                className="display-md text-ivory"
                lines={["The silhouette", "of the bride."]}
              />

              <p className="body-lg mt-8 max-w-md">
                From the back of a wedding hall nobody can see a lip line. What they can see is a
                silhouette — and that is built, not styled.
              </p>

              <ol className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
                {LOOKS.map((l, i) => (
                  <li key={l.name}>
                    <span
                      className={cx(
                        "text-[0.8rem] uppercase tracking-[0.24em] transition-colors duration-[var(--d-base)]",
                        i === active ? "text-champagne" : "text-inactive",
                      )}
                    >
                      {l.name}
                    </span>
                  </li>
                ))}
              </ol>

              <p key={active} className="body-base mt-8 max-w-md" style={{ animation: "hair-in var(--d-slow) var(--ease-silk) both" }}>
                {LOOKS[active].note}
              </p>

              <Link href="/hair" className="btn btn-ghost mt-10">
                Bridal hair
              </Link>
            </div>

            <div className="relative order-1 aspect-[4/5] w-full overflow-hidden lg:order-2 lg:h-[70vh] lg:aspect-auto">
              {LOOKS.map((l, i) => (
                <div
                  key={l.name}
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    opacity: clamp(1 - Math.abs(exact - i) * 1.15),
                    transform: `scale(${(1 + Math.abs(exact - i) * 0.06).toFixed(3)}) translateY(${((exact - i) * 3).toFixed(2)}%)`,
                    transition: "opacity var(--d-fast) linear, transform var(--d-base) var(--ease-silk)",
                  }}
                >
                  <EditorialImage
                    image={images[i] ?? PLATES[i]}
                    className="h-full w-full"
                    sizes="(max-width: 1024px) 92vw, 45vw"
                    decorative
                  />
                </div>
              ))}
              <p className="sr-only" aria-live="polite">
                Hair stage: {LOOKS[active].name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hair-in {
          from { opacity: 0; transform: translate3d(0, 10px, 0); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </section>
  );
}
