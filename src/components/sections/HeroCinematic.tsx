"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDeviceCapability } from "@/components/ui/useDeviceCapability";
import { cx } from "@/lib/utils";
import JasmineSvg from "./JasmineSvg";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE OPENING (§3)
 * ═══════════════════════════════════════════════════════════════════════════
 *  No navbar. No logo bar. No hero-with-a-button.
 *
 *  A held line of type, a single flower in the dark, and then the name. The
 *  whole sequence is 4.4 seconds and never blocks the scroll — the moment a
 *  visitor moves the page, the sequence resolves to its final state.
 *
 *  Under prefers-reduced-motion the final frame is simply the first frame.
 * ═══════════════════════════════════════════════════════════════════════════
 */

type Phase = 0 | 1 | 2 | 3;

export default function HeroCinematic({
  brand,
  tagline,
  cta,
}: {
  brand: string;
  tagline: string;
  cta: string;
}) {
  const cap = useDeviceCapability();
  const [phase, setPhase] = useState<Phase>(0);
  const sectionRef = useRef<HTMLElement>(null);

  // ── The sequence ────────────────────────────────────────────────────────
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const skipAll = window.setTimeout(() => setPhase(3), 0);
      return () => window.clearTimeout(skipAll);
    }

    const timers = [
      window.setTimeout(() => setPhase(1), 260),
      window.setTimeout(() => setPhase(2), 3300),
      window.setTimeout(() => setPhase(3), 4500),
    ];

    // Any scroll intent skips straight to the resolved frame.
    const skip = () => {
      if (window.scrollY > 24) {
        timers.forEach(clearTimeout);
        setPhase(3);
        window.removeEventListener("scroll", skip);
      }
    };
    window.addEventListener("scroll", skip, { passive: true });

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("scroll", skip);
    };
  }, []);

  // ── Scroll-linked depth, written straight to a CSS variable ─────────────
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));
      el.style.setProperty("--hero-p", p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const has3D = cap.ready && cap.allow3D;
  const showOpening = phase >= 1 && phase < 2;
  const showBrand = phase >= 2;

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[100dvh] items-center justify-center overflow-hidden"
      style={{ ["--hero-p" as string]: 0 }}
      aria-label="Introduction"
    >
      {/* The flower. An empty anchor box — the WebGL bloom binds to it. */}
      <div
        data-scene="hero-jasmine"
        className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(60vmin,34rem)] -translate-x-1/2 -translate-y-1/2"
        style={{
          opacity: "calc(1 - var(--hero-p) * 0.85)",
          transform: "translate(-50%, -50%) scale(calc(1 + var(--hero-p) * 0.22))",
        }}
      >
        {!has3D && <JasmineSvg className="h-full w-full opacity-90" />}
      </div>

      {/* Warm pool of light behind the type */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(58% 46% at 50% 46%, rgba(160,122,78,0.20) 0%, rgba(10,8,6,0) 70%)",
        }}
      />

      {/* ── Type ────────────────────────────────────────────────────────── */}
      <div
        className="shell relative flex flex-col items-center text-center"
        style={{
          opacity: "calc(1 - var(--hero-p) * 1.35)",
          transform: "translate3d(0, calc(var(--hero-p) * -3rem), 0)",
        }}
      >
        {/* Act I line */}
        <h1
          className={cx(
            "display-lg max-w-[22ch] text-balance text-ivory transition-[opacity,transform,filter] duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
            showOpening
              ? "translate-y-0 opacity-100 blur-0"
              : phase === 0
                ? "translate-y-6 opacity-0 blur-md"
                : "pointer-events-none absolute -translate-y-6 opacity-0 blur-md",
          )}
          aria-hidden={!showOpening}
        >
          Every bride has a moment
          <br />
          <span className="italic-serif text-champagne">before she becomes the bride.</span>
        </h1>

        {/* Identity */}
        <div
          className={cx(
            "flex flex-col items-center transition-[opacity,transform,filter] duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
            showBrand
              ? "translate-y-0 opacity-100 blur-0"
              : "pointer-events-none absolute translate-y-8 opacity-0 blur-lg",
          )}
        >
          <p className="display-xl uppercase leading-[0.9] text-ivory">
            {brand.replace(/'s/i, "’s")}
          </p>
          <p className="eyebrow mt-7 text-champagne/85">{tagline}</p>

          <div
            className={cx(
              "mt-11 transition-[opacity,transform] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]",
              phase >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
          >
            <Link href="/contact" className="btn">
              {cta}
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden="true"
        className={cx(
          "absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 transition-opacity duration-1000",
          phase >= 3 ? "opacity-100" : "opacity-0",
        )}
        style={{ opacity: "calc(1 - var(--hero-p) * 2)" }}
      >
        <span className="text-[0.55rem] uppercase tracking-[0.34em] text-muted">Scroll</span>
        <span className="relative block h-12 w-px overflow-hidden bg-ivory/15">
          <span className="absolute inset-x-0 top-0 h-4 animate-[scroll-cue_2.6s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-champagne" />
        </span>
      </div>

      <style>{`
        @keyframes scroll-cue {
          0%   { transform: translateY(-100%); }
          55%  { transform: translateY(300%); }
          100% { transform: translateY(300%); }
        }
      `}</style>
    </section>
  );
}
