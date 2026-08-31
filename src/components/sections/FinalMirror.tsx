"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import PlaceholderPlate from "@/components/ui/PlaceholderPlate";
import { clamp } from "@/lib/utils";
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

export default function FinalMirror({ brand, cta }: { brand: string; cta: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(
      () => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches),
      0,
    );
    return () => window.clearTimeout(t);
  }, []);

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

  const l1 = reduced ? 1 : window4(p, 0.04, 0.14, 0.26, 0.34);
  const l2 = reduced ? 1 : window4(p, 0.36, 0.44, 0.54, 0.61);
  const l3 = reduced ? 1 : window4(p, 0.63, 0.70, 0.78, 0.84);
  const end = reduced ? 1 : clamp((p - 0.84) / 0.1);
  const portrait = reduced ? 0.55 : clamp((p - 0.02) / 0.2) * (1 - clamp((p - 0.8) / 0.12) * 0.55);

  return (
    <section aria-labelledby="mirror-title" className="section-dark relative">
      <h2 id="mirror-title" className="sr-only">
        The final mirror
      </h2>

      <div ref={trackRef} className="relative h-[340vh]">
        <div className="sticky top-0 flex h-[100dvh] items-center justify-center overflow-hidden">
          {/* The portrait, held behind everything */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              opacity: portrait,
              transform: `scale(${(1.1 - p * 0.08).toFixed(3)})`,
            }}
          >
            <PlaceholderPlate tone="bronze" seed={999} className="h-full w-full" />
            <div className="absolute inset-0 bg-ink/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink" />
          </div>

          {/* The three lines */}
          <div className="shell relative z-10 text-center">
            <p
              className="display-lg absolute inset-x-0 top-1/2 mx-auto max-w-[18ch] -translate-y-1/2 text-balance text-ivory"
              style={{ opacity: l1, filter: `blur(${((1 - l1) * 10).toFixed(1)}px)` }}
              aria-hidden={l1 < 0.5}
            >
              And then, she looked
              <br /> in the mirror.
            </p>

            <p
              className="display-lg absolute inset-x-0 top-1/2 mx-auto max-w-[18ch] -translate-y-1/2 text-balance text-ivory"
              style={{ opacity: l2, filter: `blur(${((1 - l2) * 10).toFixed(1)}px)` }}
              aria-hidden={l2 < 0.5}
            >
              She didn’t see
              <br /> someone else.
            </p>

            <p
              className="display-lg absolute inset-x-0 top-1/2 mx-auto max-w-[18ch] -translate-y-1/2 text-balance"
              style={{ opacity: l3, filter: `blur(${((1 - l3) * 10).toFixed(1)}px)` }}
              aria-hidden={l3 < 0.5}
            >
              <span className="italic-serif text-champagne">She saw herself.</span>
            </p>

            {/* Resolution */}
            <div
              className="absolute inset-x-0 top-1/2 -translate-y-1/2"
              style={{
                opacity: end,
                transform: `translateY(calc(-50% + ${((1 - end) * 24).toFixed(1)}px))`,
              }}
              aria-hidden={end < 0.5}
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
                tabIndex={end > 0.5 ? 0 : -1}
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
