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
 *  Twenty-four visible at a time, and the button reveals the next twenty-four.
 *
 *  ── BUT ALL OF THEM ARE IN THE HTML, AND THAT IS A DELIBERATE REVERSAL ────
 *  They used not to be: the grid sliced the array and the remaining hundred
 *  and nine sets did not exist until someone clicked. That is defensible as
 *  performance and indefensible as everything else. Eighty-two per cent of a
 *  rental catalogue was invisible to image search, to a crawler, and to a
 *  browser's own find-in-page — on the pages whose entire purpose is the
 *  collection.
 *
 *  So every set is server-rendered and the ones past the fold carry the
 *  `hidden` attribute. What that costs is HTML bytes; what it does NOT cost
 *  is a single extra image request, because `display:none` plus lazy loading
 *  means the browser never fetches a hidden frame. First paint is unchanged:
 *  nothing extra is decoded, laid out or painted.
 *
 *  The blur placeholders are the one thing that does not scale — 334 bytes of
 *  base64 each, which is 35 KB for the hidden hundred and nine and gzips
 *  badly. They are emitted for the first page only. A revealed set fades in
 *  without one, which is the correct trade: a placeholder exists to hold a
 *  space during first paint, and these are not in the first paint.
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
        {items.map((item, i) => (
          /*
            `hidden` rather than a sliced array: the markup is identical for a
            crawler and for a visitor who has clicked Show more, which is the
            only arrangement that is honest. It is progressive disclosure — the
            content is one click away and the same content either way — not a
            crawler being shown something a person cannot reach.
          */
          <li key={item.id} hidden={i >= shown}>
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
                  placeholder={i < PAGE && item.blurDataURL ? "blur" : undefined}
                  blurDataURL={i < PAGE ? item.blurDataURL : undefined}
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
