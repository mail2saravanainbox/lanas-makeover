"use client";

import { useMemo, useState } from "react";
import type { PortfolioCategory, PortfolioItem } from "@/lib/types";
import EditorialImage from "@/components/ui/EditorialImage";
import Reveal from "@/components/ui/Reveal";
import ParallaxFrame from "@/components/ui/ParallaxFrame";
import PortfolioLightbox from "./PortfolioLightbox";
import { cx } from "@/lib/utils";
import { track } from "@/lib/analytics";

/**
 * EDITORIAL PORTFOLIO (§15)
 *
 * Not a 3-column grid. A 12-column editorial field where every item declares
 * its own weight — tall, wide, full or standard — and adjacent items are
 * offset vertically so the eye travels rather than scans.
 *
 * Paginated (§34): images beyond the first page never enter the DOM, so a
 * 400-image Instagram archive costs the same first paint as a 12-image one.
 */

/**
 * Tamil work leads (§12, §13). A filter only appears when the archive actually
 * contains that category, so the site never advertises a speciality it cannot
 * show.
 */
const FILTERS: Array<{ key: PortfolioCategory | "all"; label: string }> = [
  { key: "tamil-bridal", label: "Tamil Bridal" },
  { key: "muhurtham", label: "Muhurtham" },
  { key: "jadai", label: "Jadai" },
  { key: "all", label: "All" },
  { key: "bridal", label: "South Indian Bridal" },
  { key: "reception", label: "Reception" },
  { key: "engagement", label: "Engagement" },
  { key: "hair", label: "Hair" },
  { key: "editorial", label: "Editorial" },
  { key: "behind-scenes", label: "Atelier" },
];

const SPAN: Record<NonNullable<PortfolioItem["weight"]>, string> = {
  standard: "md:col-span-4 aspect-[3/4]",
  tall: "md:col-span-4 aspect-[2/3]",
  wide: "md:col-span-8 aspect-[3/2]",
  full: "md:col-span-12 aspect-[16/9]",
};

/** Editorial annotation shown on hover — a caption, not a tooltip (§10). */
const CATEGORY_ANNOTATION: Partial<Record<PortfolioCategory, string>> = {
  "tamil-bridal": "Tamil bridal",
  muhurtham: "Muhurtham",
  jadai: "Jadai",
  hair: "Hair",
  bridal: "Bridal",
  reception: "Reception",
  engagement: "Engagement",
  editorial: "Editorial",
  "behind-scenes": "In the chair",
  "before-after": "Transformation",
};

const PAGE = 12;

export default function PortfolioGrid({
  items,
  showFilters = true,
}: {
  items: PortfolioItem[];
  showFilters?: boolean;
}) {
  /**
   * Opens on Tamil bridal when that work exists — the specialisation should be
   * the first thing a visitor sees, not something they have to filter for.
   */
  const initial: PortfolioCategory | "all" = items.some((i) => i.category === "tamil-bridal")
    ? "tamil-bridal"
    : items.some((i) => i.category === "muhurtham")
      ? "muhurtham"
      : "all";
  const [filter, setFilter] = useState<PortfolioCategory | "all">(initial);
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState<number | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.category === filter)),
    [items, filter],
  );

  const visible = filtered.slice(0, shown);

  const availableFilters = useMemo(
    () => FILTERS.filter((f) => f.key === "all" || items.some((i) => i.category === f.key)),
    [items],
  );

  // ── Empty state (§43) ──────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="shell py-24 text-center">
        <p className="display-sm text-ivory/70">The gallery is being prepared.</p>
        <p className="body-base mx-auto mt-4 max-w-md">
          New work is added as each wedding season closes. In the meantime, the most recent
          looks are on Instagram.
        </p>
      </div>
    );
  }

  return (
    <>
      {showFilters && availableFilters.length > 2 && (
        <div className="shell mb-14">
          <ul className="flex flex-wrap gap-x-7 gap-y-3" role="list">
            {availableFilters.map((f) => (
              <li key={f.key}>
                <button
                  type="button"
                  onClick={() => {
                    setFilter(f.key);
                    setShown(PAGE);
                  }}
                  aria-pressed={filter === f.key}
                  className={cx(
                    "link-wipe text-[0.75rem] uppercase tracking-[0.26em] transition-colors duration-500",
                    filter === f.key ? "text-champagne" : "text-ivory/55 hover:text-ivory",
                  )}
                >
                  {f.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="shell">
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
          {visible.map((item, i) => {
            const weight = item.weight ?? "standard";
            // Editorial rhythm: nudge every third item down a little.
            const offset = i % 3 === 1 ? "md:mt-14" : i % 5 === 3 ? "md:mt-8" : "";

            return (
              <li key={item.id} className={cx(SPAN[weight], offset, "relative")}>
                <Reveal blur delay={(i % 3) * 110}>
                  <ParallaxFrame strength={0.4}>
                    <button
                      type="button"
                      data-cursor="view"
                      onClick={() => {
                        setOpen(filtered.indexOf(item));
                        track("portfolio_view", { slug: item.slug, category: item.category });
                      }}
                      aria-label={`View ${item.title}`}
                      data-annotate={CATEGORY_ANNOTATION[item.category] ?? "View look"}
                      className="annotate group relative block h-full w-full overflow-hidden"
                      style={{ transform: "translate3d(0, calc(var(--sy) * 18px), 0)" }}
                    >
                      <div className="absolute inset-0 transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.055]">
                        <EditorialImage
                          image={{
                            // Grids use the thumbnail — a 2000px file has no
                            // business rendering at card size (§13, §34).
                            src: item.thumbnailUrl ?? item.imageUrl,
                            alt: item.alt,
                            tone: item.tone,
                            seed: item.seed,
                            blurDataURL: item.blurDataURL,
                          }}
                          className="h-full w-full"
                          sizes="(max-width: 768px) 92vw, (max-width: 1280px) 46vw, 33vw"
                          badgeLabel="Placeholder"
                        />
                      </div>

                      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-visible:opacity-100" />

                      <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 p-5 text-left opacity-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                        <span className="eyebrow block !text-champagne/80">
                          {item.category.replace("-", " ")}
                        </span>
                        <span className="mt-2 block font-display text-xl text-ivory">
                          {item.title}
                        </span>
                      </span>
                    </button>
                  </ParallaxFrame>
                </Reveal>
              </li>
            );
          })}
        </ul>

        {shown < filtered.length && (
          <div className="mt-20 text-center">
            <button type="button" onClick={() => setShown((s) => s + PAGE)} className="btn btn-ghost">
              Load more — {filtered.length - shown} remaining
            </button>
          </div>
        )}

        {filtered.length === 0 && (
          <p className="body-base py-16 text-center">Nothing in this category yet.</p>
        )}
      </div>

      <PortfolioLightbox
        items={filtered}
        index={open}
        onClose={() => setOpen(null)}
        onNavigate={setOpen}
      />
    </>
  );
}
