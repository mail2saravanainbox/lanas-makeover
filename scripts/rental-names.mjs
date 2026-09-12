/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  WHAT EACH RENTAL SET IS — THE ONE SOURCE FOR ITS NAME AND ITS ALT
 * ═══════════════════════════════════════════════════════════════════════════
 *  The catalogue arrived as five supplier stock books. Every photograph was
 *  named for the supplier's own code — `temple-s1001.png`, `ad-s2014.png` —
 *  and both the file on disk and the alt text inherited it. That produced two
 *  separate defects with one cause:
 *
 *    · 133 photographs shared FOUR alt strings. All fifty-six temple sets
 *      said the same sentence, so a screen reader announced fifty-six
 *      identical images and image search could not tell one from another.
 *    · 133 public URLs said nothing. `/rental/ad-s2014.webp` is the
 *      `IMG_4928.jpg` case: a filename is a weak ranking signal, but it is a
 *      signal, and a stock code spends it on the supplier's filing system.
 *
 *  ── HOW THE OBSERVATIONS WERE MADE ────────────────────────────────────────
 *  By looking at all 133 photographs in labelled contact sheets and recording
 *  only what is unambiguously READABLE from the frame: what is in the set,
 *  and the dominant stone colour.
 *
 *  NOT the stone type. Kemp against ruby against red cubic zirconia is not
 *  decidable from a photograph, and a bride chooses partly on that word — so
 *  a wrong one is worse than a general one. NOT the metal, the weight or the
 *  karat, for the same reason. NOT a city: these are studio frames on a
 *  velvet bust, and "trichy" in the filename of a supplier's product shot is
 *  a claim about where a photograph was taken that nobody can support.
 *
 *  ── WHY BOTH DERIVATIONS LIVE HERE ────────────────────────────────────────
 *  `scripts/import-rental.mjs` writes the files and `scripts/name-rental.mjs`
 *  renames them, and if they disagreed the next import would quietly restore
 *  133 stock codes. They now read the same table, so a re-import is stable.
 *
 *  `slug` stays the supplier code. It is the stable internal key that ties a
 *  row to its source file in content/rental-incoming/ — it is simply no
 *  longer what the public sees.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SEEN = {
  // ── TEMPLE ───────────────────────────────────────────────────────────────
  "temple-s1001": ["short necklace, long haram, jhumka and oddiyanam", "green stones"],
  "temple-s1002": ["short necklace, long haram, jhumka and oddiyanam", "red stone accents"],
  "temple-s1003": ["short necklace, long haram, jhumka and oddiyanam", "Lakshmi motifs"],
  "temple-s1004": ["short necklace, long kasu haram, jhumka and oddiyanam", ""],
  "temple-s1005": ["short necklace, long haram, jhumka and oddiyanam", "red and green stones"],
  "temple-s1006": ["choker, long haram and jhumka", "green bead drops"],
  "temple-s1007": ["short necklace with a round centre, long haram and jhumka", ""],
  "temple-s1008": ["short necklace, long haram with a Lakshmi pendant and oddiyanam", ""],
  "temple-s1009": ["short necklace, long mango haram and jhumka", "a red centre stone"],
  "temple-s1010": ["short necklace, long haram, jhumka and oddiyanam", "Lakshmi motifs"],
  "temple-s1011": ["choker, two harams and jhumka", "green bead drops and multicoloured stones"],
  "temple-s1012": ["short necklace, long haram and jhumka", "multicoloured stones"],
  "temple-s1013": ["short necklace, haram and oddiyanam", "turquoise drops"],
  "temple-s1014": ["short necklace, long haram, jhumka and oddiyanam", "pale stones"],
  "temple-s1015": ["short necklace, long haram with a Lakshmi pendant, jhumka and oddiyanam", ""],
  "temple-s1016": ["layered necklace and haram, jhumka and oddiyanam", "red and green stones"],
  "temple-s1017": ["short necklace, long haram, jhumka and oddiyanam", "green drops"],
  "temple-s1018": ["choker, haram and jhumka", "green drops"],
  "temple-s1019": ["short necklace with a large pendant, long haram and jhumka", ""],
  "temple-s1020": ["short necklace, long haram and jhumka", "large green stones"],
  "temple-s1021": ["wide collar necklace, long kasu haram and jhumka", ""],
  "temple-s3001": ["choker, necklace, long haram, jhumka and oddiyanam", "green and red stones"],
  "temple-s3002": ["short necklace, long haram, jhumka and a wide oddiyanam", ""],
  "temple-s3003": ["short necklace, long haram, jhumka and oddiyanam", ""],
  "temple-s3004": ["layered necklace and haram, jhumka and oddiyanam", "multicoloured stones"],
  "temple-s3005": ["short necklace, long haram, jhumka and oddiyanam", "green and white stones"],
  "temple-s3006": ["necklace, long haram, jhumka, bangles and a hair ornament", ""],
  "temple-s3007": ["short necklace, long haram, jhumka and bangles", "red stone accents"],
  "temple-s3008": ["short necklace, long haram, jhumka, oddiyanam and a vanki", ""],
  "temple-s3009": ["short necklace, long haram, jhumka and oddiyanam", ""],
  "temple-s3010": ["short necklace, long haram and jhumka", "dense gold work"],
  "temple-s3011": ["short necklace, long haram, jhumka and oddiyanam", ""],
  "temple-s3012": ["short necklace, long haram and jhumka", "a green centre stone"],
  "temple-s3013": ["short necklace, long haram, jhumka and oddiyanam", "green beads"],
  "temple-s3014": ["choker, necklace, long haram and oddiyanam", "red and green stones"],
  "temple-s3015": ["short necklace, long haram, jhumka and oddiyanam", "red stones"],
  "temple-s3016": ["layered necklace and haram, jhumka and a wide oddiyanam", "pink and red stones"],
  "temple-s3017": ["a single long haram and jhumka", ""],
  "temple-s3018": ["short necklace, long haram, jhumka and oddiyanam", "dense gold work"],
  "temple-s3019": ["choker, long haram, jhumka and oddiyanam", "green stones"],
  "temple-s3020": ["necklace, large mango haram and jhumka", "a red pendant"],
  "temple-s3021": ["short necklace, long haram, jhumka and oddiyanam", "green drops"],
  "temple-s3022": ["choker, long haram and jhumka", "green stones"],
  "temple-s3023": ["two kasu harams and jhumka", ""],
  "temple-s3024": ["a single short necklace and jhumka", "Lakshmi motifs"],
  "temple-s3025": ["short necklace, long haram, jhumka and oddiyanam", "red stones"],
  "temple-s3026": ["layered necklace and haram with a large Lakshmi pendant and jhumka", "green bead drops"],
  "temple-s3027": ["short necklace, long haram, jhumka and oddiyanam", "turquoise drops"],
  "temple-s3028": ["short necklace, long haram, jhumka and oddiyanam", ""],
  "temple-s3029": ["short necklace, long haram, jhumka and oddiyanam", ""],
  "temple-s3030": ["choker, long haram, jhumka and oddiyanam", "red stones"],
  "temple-s3031": ["short necklace, long haram, jhumka and oddiyanam", "red stones"],
  "temple-s3032": ["short necklace, long haram and jhumka", "green drops"],
  "temple-s3033": ["short necklace, long haram, jhumka and oddiyanam", "pale silver-toned stones"],
  "temple-s3034": ["short necklace, long haram, jhumka and oddiyanam", "pale stones and green drops"],
  "temple-s3035": ["short necklace, long haram, jhumka and oddiyanam", "a turquoise centre"],

  // ── AMERICAN DIAMOND ─────────────────────────────────────────────────────
  "ad-s2001": ["choker, long haram, jhumka and oddiyanam", "white stones with a red centre"],
  "ad-s2002": ["short necklace, long haram, jhumka and oddiyanam", "white and green stones"],
  "ad-s2003": ["choker, three-strand haram, jhumka and oddiyanam", "red centre stones"],
  "ad-s2004": ["short necklace, layered haram, jhumka and oddiyanam", "white stones"],
  "ad-s2005": ["choker, long haram, jhumka and oddiyanam", "red stones"],
  "ad-s2006": ["short necklace and three-strand long haram with jhumka", "green stones"],
  "ad-s2007": ["necklace, four-strand haram, jhumka and oddiyanam", "red stones"],
  "ad-s2008": ["choker, long haram, jhumka and oddiyanam", "white stones"],
  "ad-s2009": ["short necklace, long haram and jhumka", "green stones"],
  "ad-s2010": ["short necklace, long haram, jhumka and oddiyanam", "green centre stones"],
  "ad-s2011": ["choker, necklace and jhumka on blue velvet", "white stones"],
  "ad-s2012": ["short necklace and five-strand long haram with jhumka", "white stones"],
  "ad-s2013": ["short necklace, long haram, jhumka and oddiyanam", "white stones"],
  "ad-s2014": ["choker, long haram, jhumka and oddiyanam", "gold-toned settings"],
  "ad-s2015": ["choker, layered haram, jhumka and oddiyanam", "blue stones"],
  "ad-s2016": ["short necklace and three-strand long haram with jhumka", "white stones"],
  "ad-s2017": ["choker, long haram and jhumka", "a red centre stone"],
  "ad-s2018": ["a three-strand long haram with jhumka", "white stones"],
  "ad-s2019": ["choker, four-strand haram, jhumka and oddiyanam", "green stones"],
  "ad-s2020": ["short necklace, two-strand long haram and jhumka", "red centre stones"],
  "ad-s2021": ["short necklace, long haram and jhumka", "white stones"],
  "ad-s2022": ["choker, long haram, jhumka and oddiyanam", "green stones"],
  "ad-s2023": ["choker, long haram, jhumka and oddiyanam", "red stones"],
  "ad-s2024": ["short necklace, long haram and jhumka", "red centre stones"],
  "ad-s2025": ["choker and four-strand long haram with jhumka", "green stones"],
  "ad-s2026": ["short necklace, long haram and jhumka", "green stones"],
  "ad-s2027": ["short necklace, four-strand long haram, jhumka and oddiyanam", "white stones"],
  "ad-s2028": ["short necklace, long haram, jhumka and oddiyanam", "green centre stones"],
  "ad-s2029": ["choker, long haram, jhumka and oddiyanam", "red stones"],
  "ad-s2030": ["choker, long haram, jhumka and oddiyanam", "green stones"],
  "ad-s2031": ["choker, long haram, jhumka and oddiyanam", "gold-toned settings"],
  "ad-s2032": ["choker, long haram and jhumka", "a blue centre stone"],
  "ad-s2033": ["short necklace, long haram and jhumka", "white stones"],
  "ad-s2034": ["choker, layered haram, jhumka and oddiyanam", "red centre stones"],
  "ad-s2035": ["choker, long haram, jhumka and oddiyanam", "red stones"],
  "ad-s2036": ["short necklace, long haram, jhumka and oddiyanam", "white stones"],

  // ── CHOKER & NECKLACE ────────────────────────────────────────────────────
  "choker-s4001": ["a wide choker with matching earrings", "red drops"],
  "choker-s4002": ["a wide fan-shaped choker with matching earrings", "white stones"],
  "choker-s4003": ["a wide collar choker with matching earrings", "white stones"],
  "choker-s4004": ["a two-strand necklace with matching earrings", "green drops"],
  "choker-s4005": ["a wide choker with matching earrings", "green stones"],
  "choker-s4006": ["a two-strand necklace with matching earrings", "red drops"],
  "choker-s4007": ["a wide collar choker with matching earrings", "white stones"],
  "choker-s4008": ["a necklace with matching earrings", "red stones"],
  "choker-s4009": ["a necklace with matching earrings and maang tikka", "green drops"],
  "choker-s4010": ["a necklace with matching earrings and maang tikka", "green stones"],
  "choker-s4011": ["a wide choker with matching earrings and maang tikka", "white stones"],
  "choker-s4012": ["a necklace with matching earrings", "pink stones"],
  "choker-s4013": ["a wide choker with matching earrings", "green drops"],
  "choker-s4014": ["a necklace with matching earrings and maang tikka", "white stones"],
  "choker-s4015": ["a wide choker with matching earrings and maang tikka", "white stones"],
  "choker-s4016": ["a wide choker with matching earrings", "blue stones"],
  "choker-s4017": ["a necklace with matching earrings", "white stones"],
  "choker-s4018": ["a two-strand necklace with matching earrings", "green drops"],
  "choker-s4019": ["a necklace with matching earrings", "red stones"],
  "choker-s4020": ["a five-strand necklace with matching earrings", "white stones"],
  "choker-s4021": ["a necklace with matching earrings", "green drops"],
  "choker-s4022": ["a wide choker with matching earrings", "green stones"],
  "choker-s4023": ["a fine necklace with matching earrings", "white stones"],
  "choker-s4024": ["a necklace with matching earrings", "white stones"],
  "choker-s4025": ["a necklace with matching earrings", "green drops"],
  "choker-s4026": ["a wide necklace with matching earrings", "white stones"],
  "choker-s4027": ["a necklace with matching earrings", "green drops"],
  "choker-s4028": ["a two-strand necklace with matching earrings", "a pink centre stone"],
  "choker-s4029": ["a necklace with matching earrings", "a green centre stone"],
  "choker-s4030": ["a wide choker with matching earrings and maang tikka", "green stones"],
  "choker-s4031": ["a wide choker on a blue stand", "white stones"],
  "choker-s4032": ["a necklace with matching earrings and maang tikka laid flat", "green stones"],
};
const WORN = {
  "worn-s5001": "A bride in a pink silk saree wearing a temple jewellery set — short necklace, long haram, jhumka, maang tikka and oddiyanam",
  "worn-s5002": "A temple jewellery set laid flat on white cloth — short necklace, long haram and jhumka",
  "worn-s5003": "Close-up of a bride's neckline wearing a white and blue stone necklace over a blue blouse",
  "worn-s5004": "An antique gold choker and jhumka arranged on green cloth",
  "worn-s5005": "A bride in a pink and blue silk saree wearing a white stone necklace, long haram and waist belt",
  "worn-s5008": "Close-up of a bride in a red Kanchipuram silk wearing an antique gold short necklace and long haram",
  "worn-s5009": "A bride in a pale green silk saree wearing an antique gold necklace, long haram and bangles",
  "worn-s5010": "A bride in a teal silk saree wearing a layered temple jewellery set with jasmine in her hair",
  "worn-s5011": "A bride in a magenta silk saree wearing a temple jewellery set with maang tikka and bangles",
};

/* ── Derivations ─────────────────────────────────────────────────────────── */

const OPENING = {
  temple: "Antique gold temple jewellery bridal set on a display stand",
  ad: "American diamond bridal jewellery set on a display stand",
  choker: "Stone-set bridal choker and earrings on a display stand",
};

/** The public filename stem, e.g. "temple-jewellery-bridal-set-green-stones". */
const FILE_BASE = {
  temple: "temple-jewellery-bridal-set",
  ad: "american-diamond-bridal-set",
  choker: "bridal-choker-necklace-set",
};

/** Worn frames are named individually — several are not brides at all. */
const WORN_FILE = {
  "worn-s5001": "bride-wearing-temple-jewellery-pink-silk-saree",
  "worn-s5002": "temple-jewellery-necklace-haram-jhumka-flat-lay",
  "worn-s5003": "bride-wearing-white-and-blue-stone-necklace-close-up",
  "worn-s5004": "antique-gold-choker-and-jhumka-on-green-cloth",
  "worn-s5005": "bride-wearing-white-stone-necklace-haram-and-waist-belt",
  "worn-s5008": "bride-in-red-kanchipuram-silk-wearing-antique-gold-haram",
  "worn-s5009": "bride-in-green-silk-saree-wearing-antique-gold-haram",
  "worn-s5010": "bride-in-teal-silk-saree-wearing-layered-temple-jewellery",
  "worn-s5011": "bride-in-magenta-silk-saree-wearing-temple-jewellery-set",
};

const kebab = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * The short distinguishing phrase in a filename.
 *
 * Colour first, because that is what separates two otherwise identical
 * catalogue frames and what a bride scans by. The accent phrases are written
 * for prose — "white stones with a red centre" — and a filename is not prose,
 * so the colours are pulled out and the rest is dropped rather than kebabed
 * into `white-stones-with-a-red-centre`.
 *
 * Where no colour reads clearly, a hint from the composition: an ordinal
 * alone is only half an improvement on a stock code, and "single-long-haram"
 * is the half that carries meaning.
 */
const COLOURS = [
  "multicoloured",
  "turquoise",
  "silver-toned",
  "white",
  "green",
  "red",
  "blue",
  "pink",
  "pale",
];

function distinguisher(pieces, accent) {
  if (accent) {
    const found = [];
    for (const c of COLOURS) {
      if (accent.toLowerCase().includes(c) && !found.includes(c)) found.push(c);
    }
    if (found.length) return `${found.slice(0, 2).join("-and-")}-stones`;
    return kebab(accent.replace(/^(a|an|the) /, "")).split("-").slice(0, 3).join("-");
  }
  if (/single long haram/.test(pieces)) return "single-long-haram";
  if (/kasu haram/.test(pieces)) return "kasu-haram";
  if (/vanki/.test(pieces)) return "with-vanki";
  if (/bangles/.test(pieces)) return "with-bangles";
  if (/hair ornament/.test(pieces)) return "with-hair-ornament";
  if (/^a single short necklace/.test(pieces)) return "short-necklace";
  if (/wide oddiyanam/.test(pieces)) return "wide-oddiyanam";
  if (/oddiyanam/.test(pieces)) return "necklace-haram-oddiyanam";
  return "necklace-and-haram";
}

/** Alt text for one set. Never contains a city, a superlative or a price. */
export function altFor(slug, category) {
  if (category === "worn") return WORN[slug] ?? null;
  const seen = SEEN[slug];
  if (!seen) return null;
  const [pieces, accent] = seen;
  return `${OPENING[category]} — ${pieces}${accent ? `, with ${accent}` : ""}`;
}

/**
 * The public filename stem for one set, WITHOUT extension and without the
 * `-thumb` suffix. Falls back to the slug, so an unobserved set keeps a
 * working URL rather than colliding with another.
 */
export function fileBaseFor(slug, category, ordinal) {
  if (category === "worn") return WORN_FILE[slug] ?? slug;
  const seen = SEEN[slug];
  if (!seen) return slug;
  const [pieces, accent] = seen;
  const n = String(ordinal).padStart(2, "0");
  return `${FILE_BASE[category]}-${distinguisher(pieces, accent)}-${n}`;
}

export { SEEN, WORN };
