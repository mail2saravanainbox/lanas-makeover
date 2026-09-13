"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ImageRef } from "@/lib/types";
import { PLATES, STAGES } from "@/content/ritual-stages";
import EditorialImage from "@/components/ui/EditorialImage";
import { cx } from "@/lib/utils";
import { track } from "@/lib/analytics";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE RITUAL, ON A PHONE  (§16–§24)
 * ═══════════════════════════════════════════════════════════════════════════
 *  The desktop version scrubs eight stages against 800vh of scroll. Linearised
 *  onto a phone that became eight stacked photographs with captions — about
 *  six screens of scrolling for a sequence whose whole point is that you watch
 *  it change in one place.
 *
 *  One frame. One stage at a time. Counter, dots, and two arrows.
 *
 *  ── WHAT CHANGED, AND WHY ─────────────────────────────────────────────────
 *  This replaced a scroll-snap rail of eight 56px thumbnails. The rail worked,
 *  and it is gone for three reasons:
 *
 *    · Eight numbered buttons on screen at once is eight decisions offered for
 *      a sequence that has an order. A bride reads 01→08; she does not pick.
 *    · There were no previous/next controls at all. The rail was the only way
 *      forward, and a thumbnail is a smaller, vaguer target than an arrow.
 *    · It autoplayed at 3.5s until first touch. A photograph that changes
 *      while you are reading its caption is a photograph you cannot read.
 *
 *  ── THE FRAME NEVER REFLOWS ───────────────────────────────────────────────
 *  A fixed 4:5 box exists before any image loads, and the stages cross-fade
 *  inside it. Nothing on this page moves when a photograph arrives.
 *
 *  ── ONLY THREE FRAMES ARE EVER MOUNTED ────────────────────────────────────
 *  All eight plates share one box, so all eight are inside the viewport and
 *  `loading="lazy"` would fetch every one on arrival — eight bridal
 *  photographs down a phone connection to show one. The current stage and its
 *  two neighbours are mounted, which is enough that a swipe in either
 *  direction lands on something already decoded (§22).
 *
 *  ── WITHOUT JAVASCRIPT ────────────────────────────────────────────────────
 *  The first frame renders and the eight stages print as a list. No blank box,
 *  no dead control.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** §21 — long enough to read as a dissolve, short enough not to wait on it. */
const FADE_MS = 400;

/**
 * §23 — a swipe is horizontal travel that clearly beats the vertical. Below
 * this the gesture was a scroll that wobbled, and stealing it would mean the
 * page fights the thumb every time a bride tries to read past the ritual.
 */
const SWIPE_MIN_X = 44;
const SWIPE_DOMINANCE = 1.4;

export default function StagesMobile({ images }: { images: ImageRef[] }) {
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState<number[]>([0, 1]);
  const last = STAGES.length - 1;

  const go = useCallback(
    (next: number) => {
      const i = Math.max(0, Math.min(last, next));
      setActive(i);
      setSeen((prev) =>
        [i - 1, i, i + 1].every((n) => n < 0 || n > last || prev.includes(n))
          ? prev
          : [...new Set([...prev, i - 1, i, i + 1])].filter(
              (n) => n >= 0 && n <= last,
            ),
      );
    },
    [last],
  );

  // ── Swipe, and only swipe (§18, §23) ───────────────────────────────────
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
    // Horizontal has to dominate, or this was a scroll and the page keeps it.
    if (Math.abs(dx) < SWIPE_MIN_X) return;
    if (Math.abs(dx) < Math.abs(dy) * SWIPE_DOMINANCE) return;
    go(active + (dx < 0 ? 1 : -1));
  };

  // Once per page view, on the same event the desktop track fires, so the two
  // renderings are one number rather than two.
  const completed = useRef(false);
  useEffect(() => {
    if (completed.current || active !== last) return;
    completed.current = true;
    track("ritual_complete", { stages: STAGES.length, placement: "mobile" });
  }, [active, last]);

  const stage = STAGES[active];

  return (
    <div className="lg:hidden">
      {/* ── Counter (§19) ───────────────────────────────────────────────── */}
      <div className="mx-auto flex w-[86vw] items-baseline justify-between">
        {/* §19, §64. Two fixes from the contrast and type sweep: the total was
            `ivory/35`, which is 2.81 : 1 on this background and unreadable, and
            the whole counter was 11.5px — under the floor for something a
            bride uses to know where she is. */}
        <p className="text-data-sm font-mono tracking-[0.2em] text-champagne">
          {/* Padded to match `stage.index`: "01 / 8" reads as a typo. */}
          {stage.index}{" "}
          <span className="text-muted">
            / {String(STAGES.length).padStart(2, "0")}
          </span>
        </p>
        <p className="text-data-sm uppercase tracking-[0.22em] text-muted">
          {active === last ? "Complete" : "Swipe"}
        </p>
      </div>

      {/* ── The frame ───────────────────────────────────────────────────────
          `touch-pan-y` is the whole scroll-safety story: the browser keeps
          vertical panning for the page and only hands us the horizontal, so a
          swipe can never eat a scroll (§23). */}
      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          down.current = null;
        }}
        className="relative mx-auto mt-3 aspect-[4/5] w-[86vw] touch-pan-y select-none overflow-hidden"
      >
        {/* One frame per STAGE, never per supplied image: with fewer than eight
            photographs imported the dots would otherwise offer stages that have
            no frame behind them. PLATES is the same fallback the desktop uses. */}
        {STAGES.map((s, i) => (
          <div
            key={s.index}
            aria-hidden={i !== active}
            className="absolute inset-0 motion-reduce:!transition-none"
            style={{
              opacity: i === active ? 1 : 0,
              transition: `opacity ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            }}
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

      {/* ── Dots (§19) ──────────────────────────────────────────────────────
          Eight of them, because a bride should be able to see how long this is
          before she starts. Not buttons: the arrows and the swipe move it, and
          eight more targets here is the grid this replaced. */}
      <ol
        aria-hidden="true"
        className="mx-auto mt-6 flex w-[86vw] items-center gap-2"
      >
        {STAGES.map((s, i) => (
          <li
            key={s.index}
            className={cx(
              "h-[3px] rounded-full transition-[background-color,flex-grow] duration-300 motion-reduce:transition-none",
              i === active ? "flex-[2.2] bg-champagne" : "flex-1 bg-ivory/18",
            )}
          />
        ))}
      </ol>

      {/* ── Caption ────────────────────────────────────────────────────────
          Clamped to two lines rather than truncated: five of the eight notes
          were written for a desktop column and run past 90 characters, and a
          screen reader should still get the whole sentence. */}
      <div className="mx-auto mt-5 w-[86vw]">
        <h3 className="font-display text-[1.35rem] uppercase tracking-[0.16em] text-ivory">
          {stage.name}
        </h3>
        <p className="body-base mt-2 line-clamp-2 text-[0.95rem]">
          {stage.note}
        </p>
      </div>

      {/* ── Previous / next (§17, §18) ──────────────────────────────────────
          48px round targets, disabled at the ends rather than wrapping — a
          sequence that silently restarts at 01 reads as a bug, and the eighth
          stage is the one we want her to arrive at. */}
      <div className="mx-auto mt-6 flex w-[86vw] items-center gap-3">
        <button
          type="button"
          onClick={() => go(active - 1)}
          disabled={active === 0}
          aria-label="Previous stage"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ivory/22 text-ivory transition-colors duration-[var(--d-base)] active:border-champagne active:text-champagne disabled:pointer-events-none disabled:opacity-25"
        >
          <Chevron dir="left" />
        </button>
        <button
          type="button"
          onClick={() => go(active + 1)}
          disabled={active === last}
          aria-label="Next stage"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ivory/22 text-ivory transition-colors duration-[var(--d-base)] active:border-champagne active:text-champagne disabled:pointer-events-none disabled:opacity-25"
        >
          <Chevron dir="right" />
        </button>

        {/* §24 — the way out, and only once there is somewhere to go. */}
        {active === last && (
          <a
            href="#after-ritual"
            className="ml-auto inline-flex min-h-12 items-center gap-2 text-[0.72rem] uppercase tracking-[0.2em] text-champagne"
          >
            Continue
            <span aria-hidden="true">↓</span>
          </a>
        )}
      </div>

      {/* The only thing announced when the stage changes. */}
      <p aria-live="polite" className="sr-only">
        Stage {active + 1} of {STAGES.length}, {stage.name}
      </p>

      {/* The stages are content, not chrome, so without JavaScript they print. */}
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
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={dir === "left" ? "M10.5 3.5L5.5 8.5l5 5" : "M6.5 3.5l5 5-5 5"}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
