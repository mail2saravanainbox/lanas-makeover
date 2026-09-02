import type { PortfolioCategory } from "@/lib/types";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PORTFOLIO COLLECTIONS
 * ─────────────────────────────────────────────────────────────────────────────
 *  The public shape of the archive. Seven rooms, each with its own URL, its own
 *  metadata and its own Open Graph card — so "Lana's muhurtham work" is a page
 *  a bride can send to her mother, not a filter state she cannot link to.
 *
 *  Replaces the 24 per-image routes, which minted a URL per photograph and had
 *  nothing to say on any of them.
 *
 *  `before-after` and `other` are deliberately NOT collections. A before/after
 *  needs consent per photograph and a page of its own framing; "other" is not
 *  a room, it is a drawer.
 *
 *  ⚠ Every `intro` below is deliberately about the CRAFT, never about Lana's
 *    record — no counts, no years, no claims. TODO(client) on each: these are
 *    holding sentences, and Lana's own words should replace them.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export interface Collection {
  slug: string;
  name: string;
  /** Short editorial label used as the eyebrow. */
  eyebrow: string;
  /** The portfolio categories this room draws from, in order of preference. */
  categories: PortfolioCategory[];
  title: string;
  /** TODO(client): replace with Lana's own description of this work. */
  intro: string;
  description: string;
}

export const collections: Collection[] = [
  {
    slug: "tamil-bridal",
    name: "Tamil Bridal",
    eyebrow: "The speciality",
    categories: ["tamil-bridal"],
    title: "Tamil bridal makeup and hair",
    intro:
      "Kanchipuram silk, temple gold and jasmine, in the light of a South Indian wedding morning. The register changes between families and ceremonies; the intention does not.",
    description:
      "Tamil bridal makeup and hair by Lana's Makeover, Trichy. South Indian bridal looks for muhurtham, reception and engagement.",
  },
  {
    slug: "muhurtham",
    name: "Muhurtham",
    eyebrow: "The ceremony",
    categories: ["muhurtham", "tamil-bridal"],
    title: "Muhurtham",
    intro:
      "The hour the marriage is actually made, and the hardest light of the day — oil lamps, daylight and camera flash, often within the same minute.",
    description:
      "Muhurtham bridal makeup and hair by Lana's Makeover — built for lamp light, daylight and flash in the same hour.",
  },
  {
    slug: "reception",
    name: "Reception",
    eyebrow: "The evening",
    categories: ["reception"],
    title: "Reception",
    intro:
      "Lit almost entirely for video. A different face from the morning, on the same bride, and it has to be recognisably her in both.",
    description:
      "Reception makeup and hair by Lana's Makeover — built for evening light and video.",
  },
  {
    slug: "engagement",
    name: "Engagement",
    eyebrow: "The beginning",
    categories: ["engagement"],
    title: "Engagement",
    intro:
      "Usually the first time she sits in the chair, and usually the lightest register of the three.",
    description: "Engagement makeup and hair by Lana's Makeover, Trichy.",
  },
  {
    slug: "hair",
    name: "Hair",
    eyebrow: "The silhouette",
    categories: ["hair", "jadai"],
    title: "Bridal hair and jadai",
    intro:
      "From the back of a wedding hall nobody can see a lip line. What they can see is a silhouette — and that is built, not styled.",
    description:
      "Bridal hair, jadai and jasmine work by Lana's Makeover — the silhouette that reads from across the hall.",
  },
  {
    slug: "details",
    name: "Details",
    eyebrow: "Close",
    categories: ["editorial"],
    title: "Details",
    intro:
      "Skin, eyes, a border, a setting. The parts of the work that only survive a close lens if they were built properly in the first place.",
    description:
      "Close detail studies from Lana's Makeover — skin, eyes, silk and gold at macro range.",
  },
  {
    slug: "behind-the-scenes",
    name: "Behind the Scenes",
    eyebrow: "The morning",
    categories: ["behind-scenes"],
    title: "Behind the scenes",
    intro:
      "The half of a wedding morning nobody photographs: the kit, the preparation, the hands.",
    description:
      "Behind the scenes of a bridal morning with Lana's Makeover — preparation, kit and the artist's hands.",
  },
];

export function findCollection(slug: string): Collection | undefined {
  return collections.find((c) => c.slug === slug);
}

/** The collection a given photograph belongs to, for redirects and links. */
export function collectionForCategory(category: PortfolioCategory): Collection | undefined {
  return (
    collections.find((c) => c.categories[0] === category) ??
    collections.find((c) => c.categories.includes(category))
  );
}
