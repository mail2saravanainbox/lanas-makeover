"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ImageRef } from "@/lib/types";
import EditorialImage from "@/components/ui/EditorialImage";
import { clamp, sectionEyebrow } from "@/lib/utils";
import { useScrollProgress } from "@/lib/motion/scheduler";
import { track } from "@/lib/analytics";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE FINAL MIRROR (§50)
 * ═══════════════════════════════════════════════════════════════════════════
 *  The last beat of the film. Three lines, held and released by scroll, then
 *  the name and one door out.
 *
 *  Everything here is a window function on a single 0→1 progress value. No
 *  timeline library, no pinning plugin — just a rect and some arithmetic.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Fades in over [a,b], holds, fades out over [c,d]. */
function window4(p: number, a: number, b: number, c: number, d: number): number {
  if (p < a || p > d) return 0;
  if (p < b) return clamp((p - a) / (b - a));
  if (p <= c) return 1;
  return clamp(1 - (p - c) / (d - c));
}

const PLATE: ImageRef = { alt: "The final look", tone: "bronze", seed: 999 };

export default function FinalMirror({
  index,
  brand,
  cta,
  image = PLATE,
}: {
  index: number;
  brand: string;
  cta: string;
  image?: ImageRef;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  /**
   * Which of the four beats is on screen. The only state in the component: it
   * changes four times across the whole track and exists so `aria-hidden` and
   * the CTA's tabIndex are correct. Opacity and blur never touch React.
   */
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    const t = window.setTimeout(
      () => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches),
      0,
    );
    return () => window.clearTimeout(t);
  }, []);

  useScrollProgress(trackRef, ({ p }) => {
    if (reduced) return;

    // Rescaled for a 200vh track: the same three beats, proportionally wider
    // windows, so each line still has room to land at the new speed.
    const l = [
      window4(p, 0.04, 0.12, 0.24, 0.3),
      window4(p, 0.32, 0.4, 0.5, 0.58),
      window4(p, 0.6, 0.67, 0.75, 0.82),
    ];
    const end = clamp((p - 0.84) / 0.1);
    const portrait = clamp((p - 0.02) / 0.2) * (1 - clamp((p - 0.8) / 0.12) * 0.55);

    if (portraitRef.current) {
      portraitRef.current.style.opacity = portrait.toFixed(4);
      portraitRef.current.style.transform = `scale(${(1.1 - p * 0.08).toFixed(3)})`;
    }

    for (let i = 0; i < 3; i++) {
      const el = lineRefs.current[i];
      if (!el) continue;
      el.style.opacity = l[i].toFixed(4);
      el.style.filter = `blur(${((1 - l[i]) * 10).toFixed(1)}px)`;
    }

    if (endRef.current) {
      endRef.current.style.opacity = end.toFixed(4);
      endRef.current.style.transform = `translateY(calc(-50% + ${((1 - end) * 24).toFixed(1)}px))`;
    }

    const next = p < 0.31 ? 0 : p < 0.59 ? 1 : p < 0.84 ? 2 : 3;
    setBeat((prev) => (prev === next ? prev : next));
  }, [reduced]);

  return (
    <section aria-labelledby="mirror-title" className="section-dark relative">
      <h2 id="mirror-title" className="sr-only">
        The mirror
      </h2>

      <p className="shell eyebrow absolute inset-x-0 top-[calc(var(--nav-h)+2rem)] z-20">
        {sectionEyebrow(index, "The mirror")}
      </p>

      <div ref={trackRef} className="relative h-[200vh]">
        <div className="sticky top-0 flex h-[100dvh] items-center justify-center overflow-hidden">
          {/* The portrait, held behind everything */}
          <div
            ref={portraitRef}
            aria-hidden="true"
            className="absolute inset-0"
            style={{ opacity: reduced ? 0.55 : 0, transform: "scale(1.1)" }}
          >
            <EditorialImage image={image} className="h-full w-full" sizes="100vw" decorative />
            <div className="absolute inset-0 bg-ink/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink" />
          </div>

          {/* The three lines */}
          <div className="shell relative z-10 text-center">
            <p
              className="display-lg absolute inset-x-0 top-1/2 mx-auto max-w-[18ch] -translate-y-1/2 text-balance text-ivory"
              ref={(el) => {
                lineRefs.current[0] = el;
              }}
              style={{ opacity: reduced ? 1 : 0 }}
              aria-hidden={!reduced && beat !== 0}
            >
              And then, she looked
              <br /> in the mirror.
            </p>

            <p
              className="display-lg absolute inset-x-0 top-1/2 mx-auto max-w-[18ch] -translate-y-1/2 text-balance text-ivory"
              ref={(el) => {
                lineRefs.current[1] = el;
              }}
              style={{ opacity: reduced ? 1 : 0 }}
              aria-hidden={!reduced && beat !== 1}
            >
              She didn’t see
              <br /> someone else.
            </p>

            <p
              className="display-lg absolute inset-x-0 top-1/2 mx-auto max-w-[18ch] -translate-y-1/2 text-balance"
              ref={(el) => {
                lineRefs.current[2] = el;
              }}
              style={{ opacity: reduced ? 1 : 0 }}
              aria-hidden={!reduced && beat !== 2}
            >
              <span className="italic-serif text-champagne">She saw herself.</span>
            </p>

            {/* Resolution */}
            <div
              ref={endRef}
              className="absolute inset-x-0 top-1/2"
              style={{
                opacity: reduced ? 1 : 0,
                transform: reduced ? "translateY(-50%)" : "translateY(calc(-50% + 24px))",
              }}
              aria-hidden={!reduced && beat !== 3}
            >
              <p className="display-md uppercase tracking-[0.14em] text-ivory">
                {brand.replace(/'s/i, "’s")}
              </p>
              <p className="italic-serif mt-6 text-[clamp(1.1rem,2vw,1.6rem)] text-champagne">
                Your story starts here.
              </p>
              <Link
                href="/contact"
                onClick={() => track("booking_click", { placement: "final-mirror" })}
                className="btn mt-11"
                tabIndex={reduced || beat === 3 ? 0 : -1}
              >
                {cta}
              </Link>
            </div>
          </div>

          {/* Screen-reader linear version — the story without the scrubbing */}
          <p className="sr-only">
            And then, she looked in the mirror. She didn’t see someone else. She saw herself.{" "}
            {brand}. Your story starts here.
          </p>
        </div>
      </div>
    </section>
  );
}
