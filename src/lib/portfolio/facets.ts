import type { PortfolioItem } from "@/lib/types";
import { facetOverrides } from "@/content/portfolio/facets";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  PORTFOLIO FACETS (§15)
 * ═══════════════════════════════════════════════════════════════════════════
 *  A bride does not browse an archive. She arrives with a look in her head —
 *  "traditional, with a jadai, for the muhurtham" — and wants to see whether
 *  that exists here. One category filter cannot answer that question; four
 *  combinable axes can.
 *
 *    LOOK      Natural · HD · Traditional · Soft Glam · Editorial
 *    EVENT     Muhurtham · Reception · Engagement · Party
 *    HAIR      Jadai · Braid · Bun · Open Hair · Floral
 *    CATEGORY  Bridal · Hair · Details · BTS
 *
 *  ── WHERE THE TAGS COME FROM, AND WHAT IS NOT INVENTED ──────────────────
 *  Two sources, in this order:
 *
 *    1. `facetOverrides` — Lana's own classification, per photograph.
 *    2. `derive()` below — inferred from the category and the filename, and
 *       ONLY where the inference is safe.
 *
 *  The second is deliberately incomplete. `Traditional` and `Editorial` can be
 *  read off a category; a braid can be read off a filename that says braided.
 *  `Natural`, `HD` and `Soft Glam` cannot — those are statements about how a
 *  face was finished, and only the artist who finished it can make them. So
 *  they are declared in the taxonomy, filterable the moment they are tagged,
 *  and never guessed at.
 *
 *  A filter chip only renders when the current archive actually contains an
 *  item carrying that value (see `availableFacets`). The site therefore never
 *  offers a room it cannot show, and never claims a look it cannot evidence.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type LookTag = "Natural" | "HD" | "Traditional" | "Soft Glam" | "Editorial";
export type EventTag = "Muhurtham" | "Reception" | "Engagement" | "Party";
export type HairTag = "Jadai" | "Braid" | "Bun" | "Open Hair" | "Floral";
export type CategoryTag = "Bridal" | "Hair" | "Details" | "BTS";

export interface Facets {
  look: LookTag[];
  event: EventTag[];
  hair: HairTag[];
  category: CategoryTag[];
}

export type FacetKey = keyof Facets;

/** The axes, in the order they are offered. Drives the whole filter UI. */
export const FACET_AXES: Array<{ key: FacetKey; label: string; values: readonly string[] }> = [
  { key: "look", label: "Look", values: ["Natural", "HD", "Traditional", "Soft Glam", "Editorial"] },
  { key: "event", label: "Event", values: ["Muhurtham", "Reception", "Engagement", "Party"] },
  { key: "hair", label: "Hair", values: ["Jadai", "Braid", "Bun", "Open Hair", "Floral"] },
  { key: "category", label: "Category", values: ["Bridal", "Hair", "Details", "BTS"] },
];

/** A selection: axis → chosen values. Empty array or absent means "any". */
export type FacetSelection = Partial<Record<FacetKey, string[]>>;

export const EMPTY_SELECTION: FacetSelection = {};

/* ── Derivation ──────────────────────────────────────────────────────────── */

/** Which of the four rooms a portfolio category belongs to. Total, by design. */
const CATEGORY_OF: Record<PortfolioItem["category"], CategoryTag> = {
  "tamil-bridal": "Bridal",
  bridal: "Bridal",
  muhurtham: "Bridal",
  reception: "Bridal",
  engagement: "Bridal",
  ritual: "Bridal",
  "before-after": "Bridal",
  hair: "Hair",
  jadai: "Hair",
  editorial: "Details",
  "behind-scenes": "BTS",
  other: "Details",
};

/** Category → event, where the category IS the event. Nothing else is guessed. */
const EVENT_OF: Partial<Record<PortfolioItem["category"], EventTag>> = {
  muhurtham: "Muhurtham",
  reception: "Reception",
  engagement: "Engagement",
};

/**
 * Filename fragments that genuinely name a hair structure. Matched against the
 * slug, so `hair-03-braided` yields Braid and `jadai-02-garland` yields both
 * Jadai (from its category) and Floral (from the garland in the frame).
 */
const HAIR_HINTS: Array<[RegExp, HairTag]> = [
  [/jadai/, "Jadai"],
  [/braid/, "Braid"],
  [/\bbun\b|-bun/, "Bun"],
  [/open|waved|loose/, "Open Hair"],
  [/flower|floral|jasmine|garland|malligai/, "Floral"],
];

function unique<T>(xs: T[]): T[] {
  return [...new Set(xs)];
}

/**
 * The facets that can be READ OFF an item without asserting anything about how
 * the makeup was done. See the header: the finish tags are not inferred.
 */
function derive(item: PortfolioItem): Facets {
  const slug = item.slug.toLowerCase();

  const look: LookTag[] = [];
  // Kanchipuram-silk bridal work and jadai are traditional by definition of
  // the category they were filed under, not by a judgement about the face.
  if (item.category === "tamil-bridal" || item.category === "muhurtham" || item.category === "jadai") {
    look.push("Traditional");
  }
  if (item.category === "editorial") look.push("Editorial");

  const event: EventTag[] = [];
  const fromCategory = EVENT_OF[item.category];
  if (fromCategory) event.push(fromCategory);

  const hair: HairTag[] = [];
  if (item.category === "jadai") hair.push("Jadai");
  for (const [pattern, tag] of HAIR_HINTS) {
    if (pattern.test(slug)) hair.push(tag);
  }

  return {
    look: unique(look),
    event: unique(event),
    // Hair structure is only meaningful on a frame that is about the hair.
    hair: item.category === "hair" || item.category === "jadai" ? unique(hair) : [],
    category: [CATEGORY_OF[item.category]],
  };
}

/** Lana's classification wins outright; derivation fills the gaps. */
export function facetsFor(item: PortfolioItem): Facets {
  const derived = derive(item);
  const override = facetOverrides[item.slug];
  if (!override) return derived;

  return {
    look: override.look ?? derived.look,
    event: override.event ?? derived.event,
    hair: override.hair ?? derived.hair,
    category: override.category ?? derived.category,
  };
}

/* ── Querying ────────────────────────────────────────────────────────────── */

/**
 * COMBINED FILTERING: AND across axes, OR within one.
 *
 * "Traditional + Jadai + Muhurtham" means every selected axis must match, so
 * the result is the intersection — which is exactly what the phrase means when
 * a bride says it out loud. Within an axis, picking both Muhurtham and
 * Reception widens rather than narrows, because nothing can be two events.
 */
export function matches(item: PortfolioItem, selection: FacetSelection): boolean {
  const f = facetsFor(item);
  return FACET_AXES.every(({ key }) => {
    const chosen = selection[key];
    if (!chosen || chosen.length === 0) return true;
    return chosen.some((value) => (f[key] as string[]).includes(value));
  });
}

export function filterByFacets(items: PortfolioItem[], selection: FacetSelection): PortfolioItem[] {
  return hasSelection(selection) ? items.filter((i) => matches(i, selection)) : items;
}

export function hasSelection(selection: FacetSelection): boolean {
  return FACET_AXES.some(({ key }) => (selection[key]?.length ?? 0) > 0);
}

export function selectionCount(selection: FacetSelection): number {
  return FACET_AXES.reduce((n, { key }) => n + (selection[key]?.length ?? 0), 0);
}

/**
 * The axes and values this archive can actually offer.
 *
 * An axis with fewer than two usable values is dropped entirely: a filter with
 * one option filters nothing, and a row of chips that cannot change the result
 * is furniture.
 */
export function availableFacets(
  items: PortfolioItem[],
): Array<{ key: FacetKey; label: string; values: string[] }> {
  const present: Record<string, Set<string>> = {
    look: new Set(),
    event: new Set(),
    hair: new Set(),
    category: new Set(),
  };

  for (const item of items) {
    const f = facetsFor(item);
    for (const { key } of FACET_AXES) {
      for (const v of f[key] as string[]) present[key].add(v);
    }
  }

  return FACET_AXES.map(({ key, label, values }) => ({
    key,
    label,
    // Taxonomy order, not archive order, so the chips never reshuffle.
    values: values.filter((v) => present[key].has(v)),
  })).filter((axis) => axis.values.length > 1);
}
