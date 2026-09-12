/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  PER-SET ALT TEXT FOR THE RENTAL CATALOGUE
 * ═══════════════════════════════════════════════════════════════════════════
 *  One hundred and thirty-three photographs shared four alt strings between
 *  them: every one of the fifty-six temple sets said "Antique gold-toned
 *  temple jewellery bridal set — long haram, short necklace and jhumka on a
 *  display stand". That is a failure twice over. A screen reader announced
 *  fifty-six identical images, and image search — which for a bridal business
 *  is a real front door — had nothing to tell one set from another.
 *
 *  Two of them were also simply wrong: worn-s5002 is a flat-lay on white
 *  cloth and worn-s5004 is a choker and jhumka on green cloth, and both were
 *  captioned "A bride wearing a South Indian bridal jewellery set".
 *
 *  ── HOW THESE WERE WRITTEN ────────────────────────────────────────────────
 *  By looking at all 133 photographs, in labelled contact sheets, and
 *  recording only the two things that are unambiguously READABLE from the
 *  frame: what is in the set, and the dominant stone colour. Not the metal
 *  purity, not the weight, not the stone type — kemp against ruby against
 *  red CZ is not decidable from a photograph, and guessing it would put a
 *  wrong word in front of a bride choosing partly on the word.
 *
 *  So `pieces` and `accent` below are observations. The sentence is built
 *  from them, which is why the phrasing is consistent and the content is not.
 *
 *  ── RUN ───────────────────────────────────────────────────────────────────
 *    node scripts/describe-rental.mjs
 *
 *  Writes alt + title back into src/content/rental/rental.json.
 *  scripts/import-rental.mjs preserves them (`was?.alt ?? ALT[key]`), so a
 *  re-import does not undo this.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { readFileSync, writeFileSync } from "node:fs";

/** slug → [pieces, accent]. accent "" means no stone colour reads clearly. */
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

/**
 * The nine `worn` frames are not all brides, which is what the single shared
 * alt used to claim. Written individually.
 */
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

const OPENING = {
  temple: "Antique gold temple jewellery bridal set on a display stand",
  ad: "American diamond bridal jewellery set on a display stand",
  choker: "Stone-set bridal choker and earrings on a display stand",
};

const raw = JSON.parse(readFileSync("./src/content/rental/rental.json", "utf8"));
let written = 0;
const missing = [];

for (const item of raw.items) {
  if (item.category === "worn") {
    const alt = WORN[item.slug];
    if (!alt) { missing.push(item.slug); continue; }
    item.alt = alt;
    written++;
    continue;
  }
  const seen = SEEN[item.slug];
  if (!seen) { missing.push(item.slug); continue; }
  const [pieces, accent] = seen;
  item.alt = `${OPENING[item.category]} — ${pieces}${accent ? `, with ${accent}` : ""}`;
  written++;
}

if (missing.length) {
  console.error(`\n  ${missing.length} set(s) have no observation and keep the generic alt:`);
  console.error("  " + missing.join(", ") + "\n");
}

writeFileSync("./src/content/rental/rental.json", JSON.stringify(raw, null, 2) + "\n");
console.log(`alt written for ${written} of ${raw.items.length} sets`);
