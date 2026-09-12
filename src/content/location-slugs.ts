/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE CITY SLUGS, AND THE SHAPE OF A CITY URL
 * ═══════════════════════════════════════════════════════════════════════════
 *  `/bridal-makeup-trichy`, not `/locations/trichy`.
 *
 *  The query a bride types is "bridal makeup trichy", and the URL is the one
 *  line of a search result rendered verbatim under the title. A path that
 *  repeats the query reads as an answer to it; `/locations/trichy` reads as a
 *  directory entry. The ranking signal is small — Google has said as much —
 *  but the click-through difference is not, and it costs nothing to have both.
 *
 *  `/locations` survives as the hub that lists the four and explains the
 *  travel. Only the leaves moved; every old leaf 308s in `next.config.ts`.
 *
 *  ── WHY THIS FILE EXISTS AT ALL ───────────────────────────────────────────
 *  `next.config.ts` builds the redirect table from this list, and Next
 *  compiles the config with plain Node resolution — no `@/*` aliases, not
 *  even transitively. `locations.ts` uses them, so importing it from the
 *  config fails at load with MODULE_NOT_FOUND.
 *
 *  So the slug list and the URL shape live HERE, in a module with no imports
 *  at all, and both the app and the build config read the same one. That is
 *  the whole point: the live URL and the redirect that feeds it cannot drift,
 *  because they are the same function.
 *
 *  `locations.ts` asserts that its four entries match this list exactly.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** The four, in the order they are written in locations.ts. */
export const locationSlugs = ["trichy", "chennai", "pudukkottai", "madurai"] as const;

export type LocationSlug = (typeof locationSlugs)[number];

/** The live URL for a city page. */
export const locationHref = (slug: string): string => `/bridal-makeup-${slug}`;

/** The retired `/locations/<slug>` path, kept only to build the redirects. */
export const retiredLocationHref = (slug: string): string => `/locations/${slug}`;
