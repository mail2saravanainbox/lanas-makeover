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
  /**
   * The hero's poster — the first thing anyone sees, and the LCP element.
   * Landscape-weighted, because the hero is a 16:9 frame on most screens.
   */
  heroPoster: ImageRef;
  /** 9:16 for portrait viewports. Null when nothing suitable exists. */
  heroPosterPortrait: ImageRef | null;
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

/**
 * The strongest bridal frame available, preferring the shape the slot needs.
 * `weight` is the only orientation signal the import pipeline records, so
 * "wide"/"full" stand in for landscape and "tall" for portrait.
 */
function poster(shape: "landscape" | "portrait"): ImageRef | null {
  const available = pool(["tamil-bridal", "muhurtham", "bridal"]);
  if (available.length === 0) return null;

  const wanted =
    shape === "landscape"
      ? (w?: PortfolioItem["weight"]) => w === "wide" || w === "full"
      : (w?: PortfolioItem["weight"]) => w === "tall";

  const ordered = [
    ...available.filter((i) => i.featured && wanted(i.weight)),
    ...available.filter((i) => !i.featured && wanted(i.weight)),
    // Portrait has no fallback to the wrong shape: a 3:4 frame letterboxed
    // across a phone is worse than the plate it would replace.
    ...(shape === "landscape" ? available.filter((i) => i.featured) : []),
  ];

  return ordered[0] ? toImageRef(ordered[0]) : null;
}

/**
 * The eight ritual frames in filename order, with a plate wherever the
 * photograph does not exist yet.
 */
function ritualFrames(): ImageRef[] {
  const plates: ImageRef[] = [
    plate("The face", "ink", 501),
    plate("The skin", "ivory", 502),
    plate("The eyes", "bronze", 503),
    plate("The hair", "olive", 504),
    plate("The jasmine", "olive", 505),
    plate("The gold", "champagne", 506),
    plate("The silk", "bronze", 507),
    plate("The bride", "rose", 508),
  ];

  const ordered = pool("ritual")
    .slice()
    .sort((a, b) => a.slug.localeCompare(b.slug));

  return plates.map((fallback, i) => {
    const item = ordered.find((x) => x.slug.startsWith(`ritual-${String(i + 1).padStart(2, "0")}`));
    return item ? toImageRef(item) : fallback;
  });
}

export function getImageSlots(): ImageSlots {
  return {
    hasRealPhotography,

    heroPoster:
      poster("landscape") ?? plate("Bridal portrait — the opening frame", "champagne", 118),
    heroPosterPortrait: poster("portrait"),

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
     * THE MUHURTHAM RITUAL — eight ordered frames.
     *
     * Face → Skin → Eyes → Hair → Jasmine → Gold → Silk → Bride.
     *
     * DELIBERATELY NOT FILLED FROM OTHER CATEGORIES. Every other slot on the
     * site borrows from neighbouring pools when its own is empty; this one
     * must not. The section's entire claim is that these are eight moments of
     * ONE morning on ONE woman — a frame drawn from unrelated bridal work
     * would quietly turn that into a lie. Missing indices keep their plate.
     *
     * Import as ritual-01-… through ritual-08-; see content/incoming/README.md.
     */
    transformation: ritualFrames(),

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

/**
 * Neighbouring categories, in preference order, for a service that has no
 * photographs filed under its own.
 *
 * `bridal` is the one that matters: the muhurtham service is filed as
 * `bridal`, but the import pipeline files Tamil work as `tamil-bridal` or
 * `muhurtham` and almost never as plain `bridal` — so the muhurtham world
 * showed a placeholder plate on /services and as a homepage panel while
 * eleven perfectly good Tamil bridal frames sat unused.
 *
 * Every other slot in this file already falls back this way. This one did not.
 */
const SERVICE_NEIGHBOURS: Partial<Record<PortfolioCategory, PortfolioCategory[]>> = {
  bridal: ["tamil-bridal", "muhurtham"],
  muhurtham: ["tamil-bridal", "bridal"],
  "tamil-bridal": ["muhurtham", "bridal"],
  reception: ["tamil-bridal", "bridal"],
  engagement: ["tamil-bridal", "bridal"],
  hair: ["jadai"],
  jadai: ["hair"],
  editorial: ["tamil-bridal", "bridal"],
  "behind-scenes": ["editorial"],
  other: ["tamil-bridal", "bridal"],
};

/** Service / bridal-world imagery, matched to the world's own category. */
export function serviceImage(category: PortfolioCategory, fallback: ImageRef): ImageRef {
  for (const c of [category, ...(SERVICE_NEIGHBOURS[category] ?? [])]) {
    const available = pool(c);
    if (available.length > 0) return toImageRef(available[0]);
  }
  return fallback;
}
