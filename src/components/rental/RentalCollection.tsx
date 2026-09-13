"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { RentalItem } from "@/lib/types";
import type { RentalCategory } from "@/content/rental-categories";
import RentalGrid from "./RentalGrid";
import { cx } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE COLLECTION, AS A COLLECTION  (§28–§31)
 * ═══════════════════════════════════════════════════════════════════════════
 *  The front door used to be four rooms: a cover photograph, a name and a
 *  count each, and a bride had to choose a room before she saw any jewellery.
 *  That is a good index and a bad shop window. Most of the traffic that
 *  reaches this page arrives from a search for "bridal jewellery rental" and
 *  wants to see necklaces, not a menu of four kinds of necklace.
 *
 *  Now: the total, a row of chips, and the jewellery. Choosing a chip filters
 *  in place — no page load, no scroll jump, and "All" is the state she lands
 *  in, so the first thing on the page is the collection (§28).
 *
 *  ── THE FOUR PAGES STILL EXIST, AND STILL MATTER ──────────────────────────
 *  Each category has a real URL that ranks for a real phrase — "temple
 *  jewellery rental", "AD stone bridal set". Filtering in place would have
 *  quietly orphaned them, so a chip with a selection also offers its own page
 *  underneath the grid. The internal link graph is unchanged; what changed is
 *  that a bride can see the jewellery before she has to commit to a room.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export default function RentalCollection({
  categories,
  items,
}: {
  categories: RentalCategory[];
  items: RentalItem[];
}) {
  const [key, setKey] = useState<string | null>(null);

  const shown = useMemo(
    () => (key ? items.filter((i) => i.category === key) : items),
    [items, key],
  );
  const active = categories.find((c) => c.key === key) ?? null;

  return (
    <div className="shell pb-20">
      {/* ── The count, first (§28) ─────────────────────────────────────────
          Counted from the catalogue, never typed — the number cannot outlive
          the photographs behind it. */}
      <p className="font-display text-[1.6rem] text-ivory">
        {shown.length} bridal {shown.length === 1 ? "set" : "sets"}
      </p>

      {/* ── Chips ──────────────────────────────────────────────────────────
          A rail, because five chips at 320px do not fit on one line and
          wrapping them makes the page jump by a row every time one is
          pressed. 44px targets, and the selected state is a fill rather than
          a border so it survives a glance. */}
      <div
        role="group"
        aria-label="Filter by kind of set"
        className="-mx-[clamp(1.25rem,5vw,5rem)] mt-6 flex gap-2 overflow-x-auto px-[clamp(1.25rem,5vw,5rem)] pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <Chip
          label="All"
          count={items.length}
          on={key === null}
          onClick={() => setKey(null)}
        />
        {categories.map((c) => (
          <Chip
            key={c.key}
            label={c.name}
            count={items.filter((i) => i.category === c.key).length}
            on={key === c.key}
            onClick={() => setKey(c.key)}
          />
        ))}
      </div>

      {/* The grid announces its own change for anyone not watching it. */}
      <p aria-live="polite" className="sr-only">
        {shown.length} sets shown{active ? `, ${active.name}` : ""}
      </p>

      <div className="mt-8">
        <RentalGrid items={shown} />
      </div>

      {/* ── THE FOUR ROOMS KEEP THEIR DOORS (§82) ────────────────────────
          The chips filter in place, which is right for a bride and wrong for a
          crawler: each category has a real URL that ranks for a real phrase —
          "temple jewellery rental", "AD stone bridal set" — and filtering
          alone would have quietly orphaned all four. They are listed here in
          full, always, whatever the chips are doing. */}
      <nav
        aria-labelledby="rooms-head"
        className="mt-14 border-t border-ivory/12 pt-8"
      >
        <h2 id="rooms-head" className="eyebrow mb-5">
          Browse by kind
        </h2>
        <ul className="flex flex-wrap gap-x-8 gap-y-1">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/rental-jewellery/${c.slug}`}
                className="tap link-wipe text-[0.95rem] text-ivory/70 transition-colors duration-[var(--d-base)] hover:text-champagne"
              >
                {c.name}{" "}
                <span className="text-muted">
                  {items.filter((i) => i.category === c.key).length} sets
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function Chip({
  label,
  count,
  on,
  onClick,
}: {
  label: string;
  count: number;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cx(
        "inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-[0.72rem] uppercase tracking-[0.16em] transition-colors duration-[var(--d-base)]",
        on
          ? "border-champagne bg-champagne text-ink"
          : "border-ivory/20 text-ivory/65 active:border-champagne/60",
      )}
    >
      {label}
      <span
        className={cx(
          "font-mono text-[0.65rem]",
          on ? "text-ink/55" : "text-ivory/35",
        )}
      >
        {count}
      </span>
    </button>
  );
}
