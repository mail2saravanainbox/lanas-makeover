"use client";

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
export default function PortfolioFilter({
  axes,
  selection,
  onToggle,
  onClear,
  resultCount,
}: {
  axes: Array<{ key: FacetKey; label: string; values: string[] }>;
  selection: FacetSelection;
  onToggle: (axis: FacetKey, value: string) => void;
  onClear: () => void;
  resultCount: number;
}) {
  if (axes.length === 0) return null;

  const active = hasSelection(selection);

  return (
    <div className="shell mb-14">
      <div className="space-y-6">
        {axes.map((axis) => (
          <div key={axis.key} className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-6">
            <h2
              id={`facet-${axis.key}`}
              className="eyebrow shrink-0 sm:w-24 sm:!text-[0.7rem]"
            >
              {axis.label}
            </h2>

            <div
              role="group"
              aria-labelledby={`facet-${axis.key}`}
              className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
            >
              {axis.values.map((value) => {
                const on = selection[axis.key]?.includes(value) ?? false;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onToggle(axis.key, value)}
                    className={cx(
                      // min-h-11 = 44px (§14). Padding alone left these at
                      // 39px, which is under the minimum on exactly the
                      // control a bride taps most on a phone.
                      "inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full border px-4 py-2.5 text-[0.7rem] uppercase tracking-[0.2em] transition-colors duration-[var(--d-base)]",
                      on
                        ? "border-champagne bg-champagne text-ink"
                        : "border-ivory/20 text-ivory/60 hover:border-ivory/45 hover:text-ivory",
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* The count is a live region: filtering changes the page below without
          moving focus, and a keyboard user is otherwise told nothing at all. */}
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-ivory/10 pt-6">
        <p role="status" aria-live="polite" className="text-[0.75rem] uppercase tracking-[0.24em] text-muted">
          {resultCount} {resultCount === 1 ? "look" : "looks"}
          {active ? ` · ${selectionCount(selection)} filter${selectionCount(selection) === 1 ? "" : "s"}` : ""}
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
  );
}
