"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ImageRef } from "@/lib/types";
import { PLATES, STAGES } from "@/content/ritual-stages";
import EditorialImage from "@/components/ui/EditorialImage";
import { cx } from "@/lib/utils";
import { track } from "@/lib/analytics";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE RITUAL, ON A PHONE
 * ═══════════════════════════════════════════════════════════════════════════
 *  The desktop version scrubs eight stages against 800vh of scroll. Linearised
 *  onto a phone that became eight stacked photographs with captions — about
 *  six screens of scrolling for a sequence whose whole point is that you watch
 *  it change in one place.
 *
 *  This is the same eight stages as a carousel: one frame that stays put, a
 *  progress rail, and thumbnails you can flick. Under 1.3 screens.
 *
 *  ── NATIVE SCROLL, NOT SIMULATED ──────────────────────────────────────────
 *  The horizontal rail IS the state. It is a real overflow container with
 *  `scroll-snap`, so the flick is the browser's own — momentum, rubber-band,
 *  accessibility, all of it free — and an IntersectionObserver reads which
 *  thumbnail settled under the centre. Nothing here sets `scrollTop`, and the
 *  page's vertical scroll is never touched.
 *
 *  ── NO LAYOUT SHIFT ───────────────────────────────────────────────────────
 *  The frame is a fixed 4:5 box that exists before any image loads, and all
 *  eight images are stacked inside it with opacity as the only thing that
 *  changes. Nothing reflows when a stage arrives.
 *
 *  ── WITHOUT JAVASCRIPT ────────────────────────────────────────────────────
 *  The first frame renders and the rail is a plain scrollable list of eight
 *  labelled buttons. No blank box, no dead control.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Long enough to read a caption, short enough not to feel stuck. */
const AUTOPLAY_MS = 3500;

export default function StagesMobile({ images }: { images: ImageRef[] }) {
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  /** Autoplay stops for good at the first deliberate input. */
  const touched = useRef(false);
  const [inView, setInView] = useState(false);
  /**
   * WHICH FRAMES HAVE EARNED THEIR BYTES.
   *
   * All eight plates live in the same box, so all eight are inside the viewport
   * — `loading="lazy"` would fetch every one of them on arrival. That is eight
   * bridal photographs on a phone to show one. Only the current frame and its
   * two neighbours are mounted, which is enough that a flick in either
   * direction lands on something already decoded.
   */
  const [seen, setSeen] = useState<number[]>([0, 1]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  /** Scroll a thumbnail to the centre of the rail. The observer does the rest. */
  const goTo = useCallback((i: number) => {
    const clamped = Math.max(0, Math.min(STAGES.length - 1, i));
    itemRefs.current[clamped]?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: reduced.current ? "auto" : "smooth",
    });
  }, []);

  /** Any deliberate input ends autoplay permanently. */
  const interact = useCallback(() => {
    if (touched.current) return;
    touched.current = true;
  }, []);

  // ── Which thumbnail is under the centre ────────────────────────────────
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    /**
     * A CENTRE LINE, NOT A VIEWPORT.
     *
     * The obvious observer — "which thumbnails can I see" — is wrong here: five
     * of the eight are visible in a 390px rail at once, so every one of them
     * reported itself on mount and the last callback won. `active` landed on
     * stage six before anyone had touched anything, and the neighbour window
     * dragged six photographs down with it.
     *
     * Insetting the root by 49% on each side leaves a sliver two per cent of
     * the rail wide. Exactly one thumbnail can be in it, and it is the one the
     * scroll-snap has settled under the middle.
     */
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = itemRefs.current.indexOf(e.target as HTMLLIElement);
          if (i < 0) continue;
          setActive((prev) => (prev === i ? prev : i));
          setSeen((prev) =>
            [i - 1, i, i + 1].every(
              (n) => n < 0 || n >= STAGES.length || prev.includes(n),
            )
              ? prev
              : [...new Set([...prev, i - 1, i, i + 1])].filter(
                  (n) => n >= 0 && n < STAGES.length,
                ),
          );
        }
      },
      { root: rail, rootMargin: "0px -49% 0px -49%", threshold: 0 },
    );

    itemRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  // ── Autoplay, only while genuinely on screen and never after a touch ────
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.5,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || touched.current || reduced.current) return;
    const t = window.setInterval(() => {
      if (touched.current) return;
      goTo((active + 1) % STAGES.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(t);
  }, [inView, active, goTo]);

  // ── Swipe on the frame ──────────────────────────────────────────────────
  const down = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    down.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const start = down.current;
    down.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    // Ignore anything that is really a vertical scroll.
    if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return;
    interact();
    goTo(active + (dx < 0 ? 1 : -1));
  };

  // Once per page view, on the same event the desktop track fires, so the two
  // renderings are one number rather than two.
  const completed = useRef(false);
  useEffect(() => {
    if (completed.current || active !== STAGES.length - 1) return;
    completed.current = true;
    track("ritual_complete", { stages: STAGES.length, placement: "mobile" });
  }, [active]);

  const stage = STAGES[active];

  return (
    <div ref={sectionRef} className="lg:hidden">
      {/* ── The frame ──────────────────────────────────────────────────────
          Sticky, so it holds its place while the caption and rail beneath it
          move. All eight images are mounted and cross-faded; only opacity
          changes, so there is nothing to reflow. */}
      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        className="sticky top-[calc(var(--nav-h)+0.5rem)] mx-auto aspect-[4/5] w-[86vw] touch-pan-y select-none overflow-hidden"
      >
        {/* One frame per STAGE, never per supplied image: with fewer than eight
            photographs imported the rail would otherwise offer stages that have
            no frame behind them. PLATES is the same fallback the desktop uses. */}
        {STAGES.map((s, i) => (
          <div
            key={s.index}
            aria-hidden={i !== active}
            className="absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none"
            style={{ opacity: i === active ? 1 : 0 }}
          >
            {seen.includes(i) && (
              <EditorialImage
                image={images[i] ?? PLATES[i]}
                className="h-full w-full"
                sizes="86vw"
                decorative
                // The first frame is the one on screen before any interaction.
                priority={i === 0}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Progress ───────────────────────────────────────────────────────
          Eight segments, not a bar: a bride can see there are eight stages
          and which one she is on. */}
      <ol aria-hidden="true" className="mx-auto mt-5 flex w-[86vw] gap-1.5">
        {STAGES.map((s, i) => (
          <li
            key={s.index}
            className={cx(
              "h-[2px] flex-1 transition-colors duration-300",
              i <= active ? "bg-champagne" : "bg-ivory/18",
            )}
          />
        ))}
      </ol>

      {/* ── Caption ────────────────────────────────────────────────────────
          Clamped to two lines rather than truncated: five of the eight notes
          were written for a desktop column and run past 90 characters, and a
          screen reader should still get the whole sentence. */}
      <div className="mx-auto mt-5 w-[86vw]">
        <p className="text-[0.72rem] uppercase tracking-[0.24em] text-champagne/80">
          {stage.index} &middot; {stage.name}
        </p>
        <p className="body-base mt-2 line-clamp-2 text-[0.95rem]">
          {stage.note}
        </p>
      </div>

      {/* The only thing announced when the stage changes. */}
      <p aria-live="polite" className="sr-only">
        Stage {active + 1} of {STAGES.length}, {stage.name}
      </p>

      {/* Without JavaScript the rail is eight inert circles reading 01–08, which
          is a control that does nothing and names nothing. The stages themselves
          are content, so they are printed. */}
      <noscript>
        <ol className="mx-auto mt-8 w-[86vw] space-y-4">
          {STAGES.map((s) => (
            <li key={s.index} className="border-t border-ivory/12 pt-3">
              <p className="font-mono text-[0.7rem] tracking-[0.2em] text-champagne">
                {s.index}
              </p>
              <p className="mt-1 font-display text-lg uppercase tracking-[0.2em] text-ivory">
                {s.name}
              </p>
            </li>
          ))}
        </ol>
      </noscript>

      {/* ── Thumbnail rail ─────────────────────────────────────────────────
          A real scroll container with snap points. `scroll-padding-inline`
          keeps the first and last thumb reachable at the centre. */}
      <ul
        ref={railRef}
        /**
         * THE PADDING IS WHAT PUTS STAGE ONE UNDER THE CENTRE LINE.
         *
         * `scroll-padding` only governs where a snap lands; it does nothing to
         * where the rail STARTS. With ordinary side padding the rail opened at
         * scrollLeft 0 with stage one at the left edge and stage three under
         * the centre — so the carousel decided it was on stage three before
         * anyone had touched it, and pulled two more photographs down with it.
         *
         * Half the rail minus half a thumbnail on each side means scrollLeft 0
         * IS stage one centred, and the eighth is still reachable at the middle
         * rather than stranded against the right edge.
         */
        className="mt-7 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 [padding-inline:calc(50%-1.75rem)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {STAGES.map((s, i) => (
          <li
            key={s.index}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="shrink-0 snap-center"
          >
            <button
              type="button"
              onClick={() => {
                interact();
                goTo(i);
              }}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                e.preventDefault();
                interact();
                goTo(active + (e.key === "ArrowRight" ? 1 : -1));
              }}
              aria-current={i === active ? "true" : undefined}
              aria-label={`Stage ${i + 1}, ${s.name}`}
              className={cx(
                // 56px round, which is also comfortably past the 44px minimum.
                "flex h-14 w-14 items-center justify-center rounded-full border font-mono text-[0.7rem] tracking-[0.1em] transition-colors duration-[var(--d-base)]",
                i === active
                  ? "border-champagne bg-champagne text-ink"
                  : "border-ivory/22 text-ivory/60",
              )}
            >
              {s.index}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
