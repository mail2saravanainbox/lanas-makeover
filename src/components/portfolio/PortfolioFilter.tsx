"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cx } from "@/lib/utils";
import {
  type FacetKey,
  type FacetSelection,
  hasSelection,
  selectionCount,
} from "@/lib/portfolio/facets";

/**
 * THE FACET FILTER (§15)
 *
 * Four axes, combinable. Every control is a real toggle button carrying
 * `aria-pressed`, grouped under a labelled heading, so a screen reader hears
 * "Look, Traditional, toggle button, pressed" rather than a row of anonymous
 * chips. Nothing here is a custom widget.
 *
 * The axes and their values are computed from the archive by
 * `availableFacets`, so a room that has no work in it is never offered.
 *
 * On a phone each axis scrolls horizontally inside its own track rather than
 * wrapping to four lines and pushing the photographs below the fold — but the
 * track is a plain overflow container, so it is still reachable by keyboard
 * and still selectable by touch.
 */
function Chip({
  value,
  on,
  onClick,
}: {
  value: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cx(
        // min-h-11 = 44px (§14). Padding alone left these at 39px, which is
        // under the minimum on exactly the control a bride taps most.
        "inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full border px-4 py-2.5 text-[0.7rem] uppercase tracking-[0.2em] transition-colors duration-[var(--d-base)]",
        on
          ? "border-champagne bg-champagne text-ink"
          : "border-ivory/20 text-ivory/60 hover:border-ivory/45 hover:text-ivory",
      )}
    >
      {value}
    </button>
  );
}

type Axis = { key: FacetKey; label: string; values: string[] };

export default function PortfolioFilter({
  axes,
  selection,
  onToggle,
  onClear,
  resultCount,
}: {
  axes: Axis[];
  selection: FacetSelection;
  onToggle: (axis: FacetKey, value: string) => void;
  onClear: () => void;
  resultCount: number;
}) {
  const [sheet, setSheet] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sheetId = useId();

  /**
   * `open` on a <dialog> is not the same thing as showModal(): the attribute
   * alone gives a non-modal dialog with no focus trap, no Escape and no top
   * layer. The state is React's; the modality has to be asked for.
   */
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (sheet && !el.open) el.showModal();
    if (!sheet && el.open) el.close();
  }, [sheet]);

  if (axes.length === 0) return null;

  const active = hasSelection(selection);
  const count = selectionCount(selection);
  /** The one axis worth spending a row on: the first the archive offers. */
  const primary = axes[0];

  const status = (
    <>
      {resultCount} {resultCount === 1 ? "look" : "looks"}
      {active ? ` \u00b7 ${count} filter${count === 1 ? "" : "s"}` : ""}
    </>
  );

  return (
    <div className="mb-14">
      {/* ═══════════════════════════════════════════════════════════════════
          BELOW lg — ONE RAIL, AND A SHEET FOR THE REST
          ═══════════════════════════════════════════════════════════════════
          Four axes, each on its own labelled row, is four rows of chips and a
          count line — around a screen and a half of controls standing between
          a bride and the first photograph on a page she came to look at
          photographs on.

          The archive's primary axis stays visible, because a rail of chips is
          also the fastest way to understand what is IN the archive. The other
          three go behind one button that says how many are on. */}
      <div className="lg:hidden">
        <div className="shell flex items-center gap-3">
          <div
            role="group"
            aria-labelledby={`${sheetId}-primary`}
            className="-mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <h2 id={`${sheetId}-primary`} className="sr-only">
              {primary.label}
            </h2>
            {primary.values.map((value) => (
              <Chip
                key={value}
                value={value}
                on={selection[primary.key]?.includes(value) ?? false}
                onClick={() => onToggle(primary.key, value)}
              />
            ))}
          </div>

          {axes.length > 1 && (
            <button
              type="button"
              onClick={() => setSheet(true)}
              aria-haspopup="dialog"
              className={cx(
                "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-[0.7rem] uppercase tracking-[0.2em] transition-colors duration-[var(--d-base)]",
                active
                  ? "border-champagne text-champagne"
                  : "border-ivory/20 text-ivory/60",
              )}
            >
              Filters
              {count > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-champagne px-1 font-mono text-[0.65rem] text-ink">
                  {count}
                </span>
              )}
            </button>
          )}
        </div>

        <div className="shell mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <p
            role="status"
            aria-live="polite"
            className="text-[0.75rem] uppercase tracking-[0.24em] text-muted"
          >
            {status}
          </p>
          {active && (
            <button
              type="button"
              onClick={onClear}
              className="min-h-11 text-[0.75rem] uppercase tracking-[0.24em] text-champagne"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ── The sheet ────────────────────────────────────────────────────
            A native <dialog> opened with showModal(), so the focus trap, the
            Escape key, the inert background and the top layer are the
            browser's rather than three hundred lines of ours. Closed, it is
            display:none — its chips are not a second copy in the
            accessibility tree.

            ::backdrop and the slide-up live in globals.css, where the
            reduced-motion variant can sit next to them. */}
        <dialog
          ref={dialogRef}
          id={sheetId}
          aria-label="Filter the archive"
          onClose={() => setSheet(false)}
          /* A click on the backdrop lands on the dialog itself, never on a
             child — which is how a sheet is dismissed by tapping away. */
          onClick={(e) => {
            if (e.target === dialogRef.current) dialogRef.current?.close();
          }}
          className="lm-sheet"
        >
          <div className="lm-sheet__panel">
            <div className="flex items-center justify-between gap-4 border-b border-ivory/10 px-6 py-5">
              <h2 className="font-display text-xl uppercase tracking-[0.2em] text-ivory">
                Filter
              </h2>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="-mr-2 flex h-11 w-11 items-center justify-center text-ivory/60"
                aria-label="Close filters"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path
                    d="M2 2l12 12M14 2L2 14"
                    stroke="currentColor"
                    fill="none"
                  />
                </svg>
              </button>
            </div>

            <div className="max-h-[60vh] space-y-7 overflow-y-auto px-6 py-7">
              {axes.map((axis) => (
                <div key={axis.key}>
                  <h3 id={`sheet-${axis.key}`} className="eyebrow mb-4">
                    {axis.label}
                  </h3>
                  <div
                    role="group"
                    aria-labelledby={`sheet-${axis.key}`}
                    className="flex flex-wrap gap-2"
                  >
                    {axis.values.map((value) => (
                      <Chip
                        key={value}
                        value={value}
                        on={selection[axis.key]?.includes(value) ?? false}
                        onClick={() => onToggle(axis.key, value)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* The result count is the whole reason to keep the sheet open:
                she is watching the number move as she taps. */}
            <div className="flex items-center gap-4 border-t border-ivory/10 px-6 py-5">
              <p
                role="status"
                aria-live="polite"
                className="flex-1 text-[0.75rem] uppercase tracking-[0.24em] text-muted"
              >
                {status}
              </p>
              {active && (
                <button
                  type="button"
                  onClick={onClear}
                  className="min-h-11 text-[0.75rem] uppercase tracking-[0.24em] text-champagne"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="btn btn-ghost !min-h-11 !py-2"
              >
                Done
              </button>
            </div>
          </div>
        </dialog>
      </div>

      {/* ═══ lg AND UP — every axis on its own labelled row ═══════════════ */}
      <div className="shell hidden lg:block">
        <div className="space-y-6">
          {axes.map((axis) => (
            <div
              key={axis.key}
              className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <h2
                id={`facet-${axis.key}`}
                className="eyebrow shrink-0 sm:w-24 sm:!text-[0.7rem]"
              >
                {axis.label}
              </h2>
              <div
                role="group"
                aria-labelledby={`facet-${axis.key}`}
                className="flex flex-wrap gap-2"
              >
                {axis.values.map((value) => (
                  <Chip
                    key={value}
                    value={value}
                    on={selection[axis.key]?.includes(value) ?? false}
                    onClick={() => onToggle(axis.key, value)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* The count is a live region: filtering changes the page below
            without moving focus, and a keyboard user is otherwise told
            nothing at all. */}
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-ivory/10 pt-6">
          <p
            role="status"
            aria-live="polite"
            className="text-[0.75rem] uppercase tracking-[0.24em] text-muted"
          >
            {status}
          </p>
          {active && (
            <button
              type="button"
              onClick={onClear}
              className="link-wipe text-[0.75rem] uppercase tracking-[0.24em] text-champagne hover:text-ivory"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
