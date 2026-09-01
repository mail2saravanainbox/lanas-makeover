import "server-only";
import type { ImageRef, MediaTone, PortfolioCategory, PortfolioItem } from "@/lib/types";
import { activePortfolio, hasRealPhotography } from "./local";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  IMAGE SLOTS
 * ─────────────────────────────────────────────────────────────────────────────
 *  Named positions in the story — the hero, the five transformation stages, the
 *  hair sequence, the detail close-ups — each resolved to one of Lana's actual
 *  photographs when one exists, and to the placeholder plate when it does not.
 *
 *  Sections receive an `images` prop and keep their own plates as defaults, so
 *  the layout is identical either way. Dropping photographs into
 *  content/incoming/ and running `npm run import:portfolio` is the only action
 *  needed to fill every slot on the site.
 *
 *  A slot is never filled with an unrelated photograph just to avoid a plate.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Published photographs of a category, in curated order. */
function pool(category: PortfolioCategory | PortfolioCategory[]): PortfolioItem[] {
  const wanted = Array.isArray(category) ? category : [category];
  return activePortfolio.filter(
    (i) => i.published && Boolean(i.imageUrl) && wanted.includes(i.category),
  );
}

function toImageRef(item: PortfolioItem, altSuffix?: string): ImageRef {
  return {
    src: item.imageUrl,
    alt: altSuffix ? `${item.alt} — ${altSuffix}` : item.alt,
    width: item.width,
    height: item.height,
    blurDataURL: item.blurDataURL,
  };
}

/**
 * Take up to `count` distinct photographs from a category, preferring featured
 * ones, and never repeating within a slot group (§7 — no image used twice in a
 * row). Falls back to the supplied plates, index for index.
 */
function pick(
  category: PortfolioCategory | PortfolioCategory[],
  fallbacks: ImageRef[],
  offset = 0,
): ImageRef[] {
  const available = pool(category);
  if (available.length === 0) return fallbacks;

  const ordered = [
    ...available.filter((i) => i.featured),
    ...available.filter((i) => !i.featured),
  ];

  return fallbacks.map((fallback, index) => {
    const item = ordered[(index + offset) % ordered.length];
    // Fewer photographs than slots → keep the plate rather than repeat a photo,
    // unless there is genuinely only one, in which case repetition is honest.
    if (!item) return fallback;
    if (ordered.length < fallbacks.length && index >= ordered.length) return fallback;
    return toImageRef(item);
  });
}

/**
 * One category preference per slot, so a sequence can move deliberately
 * through different kinds of work rather than drawing all six frames from the
 * same pool. Distinct photographs wherever the archive allows it.
 */
function pickOrdered(
  preferences: PortfolioCategory[][],
  fallbacks: ImageRef[],
): ImageRef[] {
  const used = new Set<string>();
  return fallbacks.map((fallback, index) => {
    const available = pool(preferences[index] ?? []);
    const fresh = available.find((i) => !used.has(i.id)) ?? available[0];
    if (!fresh) return fallback;
    used.add(fresh.id);
    return toImageRef(fresh);
  });
}

function one(
  category: PortfolioCategory | PortfolioCategory[],
  fallback: ImageRef,
  offset = 0,
): ImageRef {
  return pick(category, [fallback], offset)[0];
}

const plate = (alt: string, tone: MediaTone, seed: number): ImageRef => ({ alt, tone, seed });

export interface ImageSlots {
  hasRealPhotography: boolean;
  /** The bride revealed through the flower. Establishes the brand in 2s (§15). */
  heroPortrait: ImageRef;
  beforeLayers: [ImageRef, ImageRef, ImageRef];
  /** null → the About/Artist sections render a typography treatment (§21). */
  artistPortrait: ImageRef | null;
  transformation: ImageRef[];
  heritage: ImageRef[];
  hair: ImageRef[];
  detail: ImageRef[];
  atelier: ImageRef[];
  finalMirror: ImageRef;
}

export function getImageSlots(): ImageSlots {
  return {
    hasRealPhotography,

    // The single strongest bridal frame, reserved for the opening reveal.
    heroPortrait: one(["bridal"], plate("Bridal portrait", "bronze", 900)),

    // ACT I — foreground / plane / background
    beforeLayers: [
      one(["bridal", "editorial"], plate("Bridal portrait", "bronze", 901)),
      one(["editorial", "bridal"], plate("Detail study", "ink", 902), 1),
      one(["hair", "bridal"], plate("Close detail", "champagne", 903), 2),
    ] as [ImageRef, ImageRef, ImageRef],

    /**
     * ACT II / About. Deliberately NOT filled from the bridal portfolio — a
     * photograph of a bride is not a photograph of the artist. Until a real
     * portrait of Lana exists, both sections render type instead (§21).
     */
    artistPortrait: null,

    /**
     * THE MUHURTHAM RITUAL — six stages.
     * Face → Skin → Eyes → Hair → Adornment → Bride. The category order below
     * mirrors that arc, so real photography lands on the right beat: the
     * unmade face and the preparation come from behind-the-scenes work, the
     * hair stage from hair work, and the last two from finished bridal frames.
     */
    transformation: pickOrdered(
      [
        ["behind-scenes", "editorial"],
        ["behind-scenes", "editorial"],
        ["editorial", "bridal"],
        ["hair"],
        ["bridal"],
        ["bridal"],
      ],
      [
        plate("The face", "ink", 501),
        plate("The skin", "ivory", 502),
        plate("The eyes", "bronze", 503),
        plate("The hair", "olive", 504),
        plate("The adornment", "champagne", 505),
        plate("The bride", "rose", 506),
      ],
    ),

    /**
     * MATERIAL → BRIDE, interleaved: [silk close-up, silk worn, gold close-up,
     * gold worn, jasmine close-up, jasmine worn]. Close-ups prefer detail and
     * hair work; the resolutions prefer finished bridal frames.
     */
    heritage: pickOrdered(
      [
        ["editorial", "bridal"],
        ["tamil-bridal", "muhurtham", "bridal"],
        ["editorial", "bridal"],
        ["tamil-bridal", "muhurtham", "bridal"],
        ["jadai", "hair"],
        ["tamil-bridal", "muhurtham", "bridal"],
      ],
      [
        plate("Kanchipuram silk", "bronze", 601),
        plate("Silk, worn", "rose", 611),
        plate("Temple gold", "champagne", 602),
        plate("Gold, worn", "bronze", 612),
        plate("Jasmine", "olive", 603),
        plate("Jasmine in her hair", "ivory", 613),
      ],
    ),

    // The silhouette sequence
    hair: pick(
      "hair",
      [
        plate("Open hair", "ink", 801),
        plate("Waved", "bronze", 802),
        plate("Braided", "champagne", 803),
        plate("Jadai", "bronze", 804),
        plate("Flowered", "olive", 805),
        plate("Bridal hair", "rose", 806),
      ],
    ),

    // The art of the detail
    detail: pick(
      ["editorial", "bridal", "hair"],
      [
        plate("Skin", "ivory", 701),
        plate("Eyes", "ink", 702),
        plate("Lips", "rose", 703),
        plate("Hair", "bronze", 704),
        plate("Draping", "champagne", 705),
        plate("Jewellery", "bronze", 706),
      ],
      2,
    ),

    // The atelier
    atelier: pick(
      ["behind-scenes", "editorial"],
      [
        plate("The kit", "ink", 851),
        plate("Skin, first", "ivory", 852),
        plate("The first brushstroke", "bronze", 853),
        plate("Setting the jadai", "champagne", 854),
      ],
    ),

    finalMirror: one(["bridal", "editorial"], plate("The final look", "bronze", 999), 3),
  };
}

/**
 * Journal covers (§20). Each article gets a DIFFERENT photograph, and any
 * article without one keeps its design treatment rather than borrowing an
 * unrelated bridal image.
 */
export function journalCover(index: number, fallback: ImageRef): ImageRef {
  const available = pool(["editorial", "bridal", "hair", "behind-scenes"]);
  const item = available[index];
  return item ? toImageRef(item) : fallback;
}

/** Service / bridal-world imagery, matched to the world's own category. */
export function serviceImage(category: PortfolioCategory, fallback: ImageRef): ImageRef {
  const available = pool(category);
  return available.length > 0 ? toImageRef(available[0]) : fallback;
}
