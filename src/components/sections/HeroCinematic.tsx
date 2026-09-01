"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ImageRef } from "@/lib/types";
import { useDeviceCapability } from "@/components/ui/useDeviceCapability";
import EditorialImage from "@/components/ui/EditorialImage";
import { clamp, cx, norm } from "@/lib/utils";
import { useScrollProgress } from "@/lib/motion/scheduler";
import JasmineSvg from "./JasmineSvg";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE FIRST FLOWER — the opening
 * ═══════════════════════════════════════════════════════════════════════════
 *  One jasmine flower, held close. The camera discovers it belongs to a
 *  strand. The strand crosses the lens and becomes the mask through which the
 *  bride arrives.
 *
 *  THE FLOWER IS THE PORTAL. That is the whole idea, and every value below
 *  serves it — nothing moves for decoration.
 *
 *  Scroll-driven, never scroll-jacked: the page scrolls natively and the
 *  sequence reads its position. Under reduced motion the whole thing resolves
 *  to its final frame immediately, with every word still present.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export default function HeroCinematic({
  brand,
  tagline,
  cta,
  portrait,
}: {
  brand: string;
  tagline: string;
  cta: string;
  portrait: ImageRef;
}) {
  const cap = useDeviceCapability();
  const trackRef = useRef<HTMLDivElement>(null);
  const brideRef = useRef<HTMLDivElement>(null);
  const flowerRef = useRef<HTMLDivElement>(null);
  const poolRef = useRef<HTMLDivElement>(null);
  const heldRef = useRef<HTMLParagraphElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  /**
   * Two booleans, flipped at most once each on the way down: whether the held
   * opening line and the bride are exposed to assistive technology. Every
   * other value in the sequence is written straight to the DOM.
   */
  const [openingOn, setOpeningOn] = useState(true);
  const [brideOn, setBrideOn] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(
      () => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches),
      0,
    );
    return () => window.clearTimeout(t);
  }, []);

  const has3D = cap.ready && cap.allow3D;

  useScrollProgress(trackRef, ({ p }) => {
    // ── Phase weights. One scroll value, five beats. ──────────────────────
    const P = reduced ? 1 : p;
    const opening = 1 - norm(P, 0.1, 0.2); // "before she becomes a bride…"
    const discover = norm(P, 0.18, 0.38);
    const travel = norm(P, 0.38, 0.58);
    const cross = norm(P, 0.58, 0.78);
    const pullback = norm(P, 0.78, 1.0);
    // The bride is revealed *through* the strand: an aperture opening from
    // the centre as the flower crosses the lens.
    const aperture = reduced ? 1 : norm(P, 0.6, 0.9);

    if (brideRef.current) {
      const el = brideRef.current;
      el.style.clipPath = `circle(${(aperture * 120).toFixed(1)}% at 50% 45%)`;
      el.style.opacity = (reduced ? 1 : clamp(aperture * 1.2)).toFixed(4);
      el.style.transform = `scale(${(1.18 - pullback * 0.18).toFixed(3)})`;
    }

    if (flowerRef.current) {
      const el = flowerRef.current;
      el.style.opacity = has3D ? "0" : clamp(1 - pullback * 1.4).toFixed(4);
      el.style.transform =
        `translate(-50%, -50%) translateX(${(travel * 22 - cross * 62).toFixed(1)}%)` +
        ` scale(${(1 + discover * 0.2 - pullback * 0.3).toFixed(3)})`;
      el.style.filter = `blur(${(cross * 6).toFixed(1)}px)`;
    }

    if (poolRef.current) poolRef.current.style.opacity = clamp(1 - aperture).toFixed(4);

    if (heldRef.current) {
      const el = heldRef.current;
      el.style.opacity = (reduced ? 0 : opening).toFixed(4);
      el.style.transform = `translateY(${((1 - opening) * -18).toFixed(1)}px)`;
      el.style.filter = `blur(${((1 - opening) * 8).toFixed(1)}px)`;
    }

    if (cueRef.current) {
      cueRef.current.style.opacity = (reduced ? 0 : clamp(1 - P * 4)).toFixed(4);
    }

    setOpeningOn((prev) => (prev === opening >= 0.5 ? prev : opening >= 0.5));
    setBrideOn((prev) => (prev === aperture >= 0.5 ? prev : aperture >= 0.5));
  }, [reduced, has3D]);
  // INTERIM (Task 1.2 → replaced wholesale by Task 2.3's Hero).
  // The identity is present in frame one. Nobody should have to scroll four
  // viewports to learn whose site this is.
  const brandIn = 1;

  return (
    <section aria-label="Introduction" className="relative">
      <div ref={trackRef} data-scene="hero-track" className="relative h-[420vh]">
        <div className="sticky top-0 flex h-[100dvh] items-center justify-center overflow-hidden">
          {/* ── The bride, behind the flower ──────────────────────────────── */}
          <div
            ref={brideRef}
            aria-hidden={!brideOn}
            className="absolute inset-0"
            style={{
              // The aperture: the flower is the portal, so the portrait opens
              // outward from the centre of the frame rather than fading in.
              clipPath: "circle(0% at 50% 45%)",
              opacity: 0,
              transform: "scale(1.18)",
              transition: reduced ? "none" : "transform 120ms linear",
            }}
          >
            <EditorialImage
              image={portrait}
              className="h-full w-full"
              sizes="100vw"
              priority
              decorative
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/65" />
          </div>

          {/* ── The flower ────────────────────────────────────────────────── */}
          <div
            ref={flowerRef}
            data-scene="hero-jasmine"
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(78vmin,44rem)]"
            style={{
              // 2D understudy mirrors the same five beats.
              opacity: has3D ? 0 : 1,
              transform: "translate(-50%, -50%)",
            }}
          >
            {!has3D && <JasmineSvg className="h-full w-full" />}
          </div>

          {/* Warm pool of light — the room the flower sits in */}
          <div
            ref={poolRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(50% 40% at 50% 46%, rgba(160,122,78,0.22) 0%, rgba(10,8,6,0) 72%)",
              opacity: 1,
            }}
          />

          {/* ── PHASE 1 — the held line ───────────────────────────────────── */}
          <p
            ref={heldRef}
            aria-hidden={!openingOn}
            className="shell absolute text-center font-display text-[clamp(1.5rem,3.6vw,2.9rem)] font-light italic leading-snug text-champagne"
            style={{ opacity: reduced ? 0 : 1 }}
          >
            Before she becomes a bride&hellip;
          </p>

          {/* ── THE IDENTITY — bottom-left, from scroll zero ──────────────── */}
          <div
            className="shell absolute inset-x-0 bottom-[12vh] z-10 flex flex-col items-start text-left"
            style={{ opacity: brandIn }}
          >
            {/* The wordmark is the brand's name, not the page's subject. The
                H1 below carries what this business actually is — the one
                sentence a search result should be able to quote. */}
            <p className="display-xl wordmark-mobile uppercase leading-[0.9] text-ivory">
              {brand.replace(/'s/i, "’s")}
            </p>
            <h1 className="eyebrow mt-6 text-champagne/85">
              Tamil bridal makeup &amp; hair artist, Trichy
            </h1>

            <p className="display-sm mt-8 max-w-[22ch] text-balance text-ivory/85">
              Every bride has a moment
              <br />
              <span className="italic-serif text-champagne">before she becomes the bride.</span>
            </p>

            <Link href="/contact" className="btn mt-9">
              {cta}
            </Link>
          </div>

          {/* Scroll cue — only while there is still sequence left to run */}
          <div
            ref={cueRef}
            aria-hidden="true"
            className={cx(
              "absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 transition-opacity duration-[var(--d-base)]",
            )}
            style={{ opacity: reduced ? 0 : 1 }}
          >
            <span className="text-[0.75rem] uppercase tracking-[0.34em] text-muted">
              Scroll to begin
            </span>
            <span className="relative block h-12 w-px overflow-hidden bg-ivory/15">
              <span className="absolute inset-x-0 top-0 h-4 animate-[scroll-cue_2.6s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-champagne" />
            </span>
          </div>

          {/* The sequence, linearly, for assistive technology */}
          <p className="sr-only">
            {brand}. {tagline}. Every bride has a moment before she becomes the
            bride.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scroll-cue {
          0%   { transform: translateY(-100%); }
          55%  { transform: translateY(300%); }
          100% { transform: translateY(300%); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes scroll-cue { 0%,100% { transform: translateY(100%); } }
        }
      `}</style>
    </section>
  );
}
