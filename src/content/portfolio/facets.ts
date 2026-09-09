import type { CategoryTag, EventTag, HairTag, LookTag } from "@/lib/portfolio/facets";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  LANA'S OWN CLASSIFICATION OF HER WORK
 * ─────────────────────────────────────────────────────────────────────────────
 *  Keyed by portfolio slug. Anything set here overrides the automatic
 *  derivation in `src/lib/portfolio/facets.ts` for that axis.
 *
 *  ⚠ THIS IS THE ONLY PLACE `Natural`, `HD` and `Soft Glam` CAN COME FROM.
 *    Those three describe how a face was finished. They cannot be read off a
 *    filename or a category, and the site will not guess at them — a bride
 *    filtering for "Natural" must be shown work Lana has actually called
 *    natural, or the filter is a lie dressed as a feature.
 *
 *  INTENTIONALLY EMPTY. The current archive is licensed stand-in photography,
 *  not Lana's work, so there is nothing here to classify. The derivation still
 *  produces Traditional, Editorial, the four events, the hair structures and
 *  the four categories from what the filenames genuinely say, which is enough
 *  for the filters to be useful today.
 *
 *  TODO(client): once real photography is imported, add a line per photograph:
 *
 *    "tamil-04-gold-saree": { look: ["Traditional", "HD"], event: ["Muhurtham"] },
 *    "reception-01-evening": { look: ["Soft Glam"], event: ["Reception"] },
 *
 *  Only the axes you name are overridden; the rest stay derived.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export interface FacetOverride {
  look?: LookTag[];
  event?: EventTag[];
  hair?: HairTag[];
  category?: CategoryTag[];
}

export const facetOverrides: Record<string, FacetOverride> = {};
