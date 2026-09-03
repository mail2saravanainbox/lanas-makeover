"use client";

import { useEffect, useRef, useState } from "react";
import { clamp, cx, sectionEyebrow } from "@/lib/utils";
import { useScrollProgress } from "@/lib/motion/scheduler";
import type { ImageRef, MediaTone } from "@/lib/types";
import EditorialImage from "@/components/ui/EditorialImage";
import { track } from "@/lib/analytics";

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
    note: "The jadai is built. Braid, volume, anchor points.",
    tone: "olive",
    seed: 504,
  },
  {
    index: "05",
    name: "The Jasmine",
    note: "Then the jasmine, measured in muzham, threaded down its length.",
    tone: "olive",
    seed: 505,
  },
  {
    index: "06",
    name: "The Gold",
    note: "Vanki, oddiyanam, temple work — set last, because it changes the balance of everything set before it.",
    tone: "champagne",
    seed: 506,
  },
  {
    index: "07",
    name: "The Silk",
    note: "Kanchipuram, draped to hold its own weight from the first ritual to the last photograph.",
    tone: "bronze",
    seed: 507,
  },
  {
    index: "08",
    name: "The Bride",
    note: "And then she is ready. Still, unmistakably, herself.",
    tone: "rose",
    seed: 508,
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
  const reachedEnd = useRef(false);
  /**
   * Eight stages across a 300vh track. `active` changes eight times; the
   * dissolve and the progress bar are written straight to the DOM and never
   * enter React at all.
   */
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  /**
   * WHICH FRAMES HAVE EVER BEEN NEEDED.
   *
   * All eight frames are stacked full-bleed in one sticky container 1,839px
   * below the fold — close enough that the browser fetched every one on first
   * paint, about 1 MB for a section that shows one frame at a time.
   *
   * Only the active frame and its neighbours are given an image. The set only
   * ever GROWS: once a frame has been mounted it stays, so scrubbing back and
   * forth never re-fetches and a tap straight to stage 8 on mobile does not
   * land on an empty frame.
   */
  const [seen, setSeen] = useState<number[]>([0, 1]);

  useEffect(() => {
    const t = window.setTimeout(
      () => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches),
      0,
    );
    return () => window.clearTimeout(t);
  }, []);

  useScrollProgress(trackRef, ({ p }) => {
    const exact = p * (STAGES.length - 1);

    for (let i = 0; i < STAGES.length; i++) {
      const el = plateRefs.current[i];
      if (!el) continue;
      // How far this frame still has to arrive: 1 = not yet, 0 = fully here.
      const d = clamp(Math.abs(exact - i));
      el.style.opacity = (1 - d).toFixed(4);
      // The mask slides across the frame as it resolves, so the image comes in
      // in clumps rather than as a flat fade — grain resolving into a picture.
      el.style.maskPosition = `${(d * 100).toFixed(1)}% ${(d * 100).toFixed(1)}%`;
      el.style.transform = `scale(${(1 + d * 0.045).toFixed(3)})`;
    }

    if (barRef.current) barRef.current.style.width = `${(p * 100).toFixed(2)}%`;

    const index = Math.round(exact);
    setActive((prev) => (prev === index ? prev : index));
    setSeen((prev) =>
      [index - 1, index, index + 1].every((i) => i < 0 || i >= STAGES.length || prev.includes(i))
        ? prev
        : [...new Set([...prev, index - 1, index, index + 1])].filter(
            (i) => i >= 0 && i < STAGES.length,
          ),
    );

    if (index === STAGES.length - 1 && !reachedEnd.current) {
      reachedEnd.current = true;
      track("ritual_complete", { stages: STAGES.length });
    }
  });

  /** Scroll to a stage. The mobile numerals and the swipe both use this. */
  function goToStage(next: number) {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.max(0, Math.min(STAGES.length - 1, next));
    const top = el.offsetTop + ((el.offsetHeight - window.innerHeight) * i) / (STAGES.length - 1);
    // Lenis is off on touch, so native smooth scrolling is the right tool.
    window.scrollTo({ top, behavior: "smooth" });
  }

  const swipeX = useRef<number | null>(null);

  return (
    <section aria-labelledby="ritual-title" className="section-dark relative">
      {/* Header travels past first, then the track pins */}
      <div className="shell relative z-20 pb-20 pt-28 text-center sm:pt-40">
        <p className="eyebrow mb-8">{sectionEyebrow(index, "The ritual")}</p>
        <h2 id="ritual-title" className="display-md mx-auto max-w-[16ch] text-balance text-ivory">
          Face. Skin. Eyes. Hair.
          <br />
          <span className="italic-serif text-champagne">Jasmine. Gold. Silk. Bride.</span>
        </h2>
        <p className="body-lg mx-auto mt-8 max-w-xl">
          Eight stages, in the order a Tamil bridal morning actually runs.
        </p>
      </div>

      {/* ── Reduced motion: the eight frames, at once, with their captions.
             No track, no dissolve, nothing to scrub. ──────────────────────── */}
      {reduced && (
        <ol className="shell grid grid-cols-2 gap-6 pb-[var(--s-12)] sm:grid-cols-4">
          {STAGES.map((stage, i) => (
            <li key={stage.index}>
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <EditorialImage
                  image={images[i] ?? PLATES[i]}
                  className="h-full w-full"
                  sizes="(max-width: 640px) 46vw, 23vw"
                  decorative
                />
              </div>
              <p className="mt-4 font-mono text-[0.75rem] tracking-[0.2em] text-champagne">
                {stage.index}
              </p>
              <p className="mt-1 font-display text-lg uppercase tracking-[0.22em] text-ivory">
                {stage.name}
              </p>
              <p className="body-base mt-2">{stage.note}</p>
            </li>
          ))}
        </ol>
      )}

      {/* ── The track ─────────────────────────────────────────────────────── */}
      <div ref={trackRef} className="relative h-[300vh] motion-reduce:hidden">
        <div className="sticky top-0 flex h-[100dvh] items-center overflow-hidden">
          {/* The stage plates. These ARE the section now — there is no
              WebGL understudy, because there is no WebGL. */}
          <div
            className="absolute inset-0"
            aria-hidden="true"
            onPointerDown={(e) => {
              swipeX.current = e.clientX;
            }}
            onPointerUp={(e) => {
              const from = swipeX.current;
              swipeX.current = null;
              if (from === null) return;
              const dx = e.clientX - from;
              if (Math.abs(dx) >= 40) goToStage(active + (dx < 0 ? 1 : -1));
            }}
            onPointerCancel={() => {
              swipeX.current = null;
            }}
          >
              {STAGES.map((s, i) => (
                <div
                  key={s.index}
                  ref={(el) => {
                    plateRefs.current[i] = el;
                  }}
                  className="absolute inset-0"
                  style={{
                    opacity: i === 0 ? 1 : 0,
                    // A luminance dissolve, not a crossfade. See
                    // scripts/make-noise-mask.mjs.
                    maskImage: "url('/masks/noise-512.png')",
                    WebkitMaskImage: "url('/masks/noise-512.png')",
                    maskMode: "luminance",
                    maskSize: "200%",
                    WebkitMaskSize: "200%",
                    maskPosition: i === 0 ? "0% 0%" : "100% 100%",
                    WebkitMaskPosition: i === 0 ? "0% 0%" : "100% 100%",
                    transition:
                      "opacity var(--d-fast) linear, transform var(--d-base) var(--ease-silk)",
                  }}
                >
                  {seen.includes(i) && (
                    <EditorialImage
                      image={images[i] ?? PLATES[i]}
                      className="h-full w-full"
                      sizes="100vw"
                      decorative
                    />
                  )}
                </div>
              ))}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/80" />
          </div>

          {/* Readable content, always present */}
          <div className="shell relative z-10 grid w-full items-end gap-10 pb-16 sm:pb-24 lg:grid-cols-[auto_1fr] lg:items-center">
            {/* Phone: the numerals only. Eight full stage names stacked
                horizontally on a 390px screen is a wall, not a list. */}
            <ol
              className="flex gap-4 sm:hidden"
              aria-label="Ritual stages"
            >
              {STAGES.map((stage, i) => (
                <li key={stage.index}>
                  <button
                    type="button"
                    onClick={() => goToStage(i)}
                    aria-current={i === active ? "step" : undefined}
                    aria-label={`Stage ${stage.index}, ${stage.name}`}
                    className={cx(
                      "min-h-11 px-1 font-mono text-[0.75rem] tracking-[0.2em] transition-colors duration-[var(--d-base)]",
                      i === active ? "text-champagne" : "text-inactive",
                    )}
                  >
                    {stage.index}
                  </button>
                </li>
              ))}
            </ol>

            <ol
              className="hidden gap-6 sm:flex lg:flex-col lg:gap-5"
              aria-label="Transformation stages"
            >
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
