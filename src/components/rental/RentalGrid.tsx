"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { RentalItem } from "@/lib/types";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE RENTAL GRID
 * ═══════════════════════════════════════════════════════════════════════════
 *  Fifty-six photographs of a necklace on a velvet stand is a different
 *  problem from the portfolio's editorial field. These are catalogue frames,
 *  all the same shape, and what a bride is doing is scanning them — so the
 *  grid is even, dense, and gets out of the way.
 *
 *  ── IT PAGES, BECAUSE FIFTY-SIX IS TOO MANY ───────────────────────────────
 *  Twenty-four at a time. The rest are not in the DOM at all, so the first
 *  paint of the largest category costs the same as the smallest — the lesson
 *  the ritual carousel taught, applied where it matters far more.
 *
 *  ── AND IT OPENS FULL SIZE ────────────────────────────────────────────────
 *  A thumbnail cannot show whether a haram is one strand or three. Tapping
 *  opens the full frame in a native <dialog>, so the focus trap, Escape and
 *  the inert background come from the browser rather than from us. Arrow keys
 *  move through the set without closing it, which is the whole point: she is
 *  comparing, not viewing.
 * ═══════════════════════════════════════════════════════════════════════════
 */
const PAGE = 24;

const navBtn =
  "flex h-11 w-11 items-center justify-center rounded-full border border-ivory/20 text-ivory/80 transition-colors duration-[var(--d-base)] hover:border-champagne/60 hover:text-champagne";

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
      <path d={dir === "left" ? "M10 2L4 8l6 6" : "M6 2l6 6-6 6"} stroke="currentColor" fill="none" />
    </svg>
  );
}

export default function RentalGrid({ items }: { items: RentalItem[] }) {
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const visible = items.slice(0, shown);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open !== null && !el.open) el.showModal();
    if (open === null && el.open) el.close();
  }, [open]);

  const move = useCallback(
    (delta: number) =>
      setOpen((i) => (i === null ? i : (i + delta + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      move(e.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, move]);

  const current = open === null ? null : items[open];

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {visible.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              data-cursor="view"
              aria-label={`Open ${item.title}, ${i + 1} of ${items.length}`}
              className="group block w-full overflow-hidden bg-ink-2"
            >
              {/*
                CONTAIN, NOT COVER — AND THIS IS THE WHOLE POINT OF THE PAGE.

                These are catalogue photographs of a long haram, and their
                aspect runs from 1:2.3 to 1:1.4. Covering a 3:4 tile with a
                1:2.3 frame shows fifty-nine per cent of its height: the crop
                takes the top of the necklace and the bottom of the jhumka,
                which are the two things a bride is looking at. Cropping the
                WIDTH instead is worse — the earrings stand at the left and
                right edges of every one of these frames.

                So nothing is cropped. The box is 5:8, which is close to the
                median frame, and what is left over is letterboxed against the
                same near-black the photographs are shot on, so it reads as
                margin rather than as a gap.

                The box is still fixed, so a grid of twenty-four never reflows
                as the images arrive.
              */}
              <div className="relative aspect-[5/8] w-full overflow-hidden">
                <Image
                  src={item.thumbnailUrl}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 48vw, (max-width: 1024px) 31vw, 23vw"
                  placeholder={item.blurDataURL ? "blur" : undefined}
                  blurDataURL={item.blurDataURL}
                  className="object-contain transition-transform duration-[var(--d-slow)] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 motion-reduce:transition-none"
                />
              </div>
            </button>
          </li>
        ))}
      </ul>

      {shown < items.length && (
        <div className="mt-12 text-center">
          <button type="button" onClick={() => setShown((n) => n + PAGE)} className="btn btn-ghost">
            Show more — {items.length - shown} left
          </button>
        </div>
      )}

      <dialog
        ref={dialogRef}
        aria-label="Jewellery set"
        onClose={() => setOpen(null)}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="lm-lightbox"
      >
        {current && (
          <div className="lm-lightbox__panel">
            <Image
              src={current.imageUrl}
              alt={current.alt}
              width={current.width}
              height={current.height}
              placeholder={current.blurDataURL ? "blur" : undefined}
              blurDataURL={current.blurDataURL}
              className="mx-auto max-h-[74dvh] w-auto max-w-full object-contain"
            />

            <div className="mt-4 flex items-center justify-between gap-4">
              <p aria-live="polite" className="text-[0.75rem] uppercase tracking-[0.22em] text-muted">
                {open !== null ? open + 1 : 0} of {items.length}
              </p>

              <div className="flex items-center gap-2">
                <button type="button" onClick={() => move(-1)} aria-label="Previous set" className={navBtn}>
                  <Chevron dir="left" />
                </button>
                <button type="button" onClick={() => move(1)} aria-label="Next set" className={navBtn}>
                  <Chevron dir="right" />
                </button>
                <button
                  type="button"
                  onClick={() => dialogRef.current?.close()}
                  aria-label="Close"
                  className={navBtn}
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" fill="none" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
