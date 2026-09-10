/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  RENTAL JEWELLERY — THE ROOMS
 * ═══════════════════════════════════════════════════════════════════════════
 *  Lana rents bridal jewellery across Tamil Nadu as well as doing the makeup
 *  and the hair. The collection arrived as five supplier catalogues — 133
 *  photographs, each carrying an internal stock code burned into the corner.
 *  The codes are gone (see scripts/import-rental.mjs); what a bride sees is
 *  the jewellery.
 *
 *  ── WHY THESE FOUR, AND NOT TWELVE ────────────────────────────────────────
 *  The categories are assigned from what the photograph unambiguously shows —
 *  metal tone, and what is in the set — because those are the two things that
 *  can be read off an image without knowing the stock book it came from. A
 *  finer split (kemp vs kundan vs polki, say) would need the supplier's own
 *  description, and inventing it would put a wrong word in front of a bride
 *  who is choosing partly on the word.
 *
 *  Each one is also a phrase a bride in Tamil Nadu actually types. "Temple
 *  jewellery rental", "AD stone bridal set", "oddiyanam" — these are the
 *  searches, and they are the headings, which is the only kind of SEO worth
 *  doing: naming a thing what the person looking for it calls it.
 *
 *  ⚠ NO PRICES, NO STOCK COUNTS, NO AVAILABILITY. None of that was supplied
 *    and none of it is guessable. Every card ends in an enquiry.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface RentalCategory {
  /** URL segment, and the filename prefix the import script files under. */
  slug: string;
  /** The key used by scripts/import-rental.mjs. */
  key: "temple" | "ad" | "choker" | "worn";
  /** Menu and card label — short. */
  name: string;
  /** <h1>, split across two lines. */
  titleLines: [string, string];
  /** One sentence. What is in this room, in a bride's words. */
  intro: string;
  /** Two or three paragraphs. About the jewellery, never about the business. */
  body: string[];
  /**
   * The <title>, written out rather than templated.
   *
   * "<name> on Rent" produced "On the Bride on Rent", which is the reliable
   * cost of building a title out of a menu label: the label has to be short
   * enough for a card and the title has to read as a sentence, and one string
   * cannot be both.
   */
  metaTitle: string;
  /** The phrases this page is written to answer. Used in the description. */
  searchFor: string;
}

export const rentalCategories: RentalCategory[] = [
  {
    slug: "temple-jewellery",
    metaTitle: "Temple Jewellery on Rent",
    key: "temple",
    name: "Temple Jewellery",
    titleLines: ["Temple jewellery", "for rent."],
    intro:
      "Antique gold, deity motifs, and the weight a traditional Tamil bridal look is built around — long haram, short necklace, jhumka and oddiyanam together.",
    body: [
      "Temple jewellery is the oldest register in a South Indian bridal wardrobe, and the most demanding one to wear. The motifs are drawn from temple sculpture — Lakshmi, peacocks, mango — and the pieces are built to be seen from across a hall rather than close up.",
      "A full set is rarely one necklace. It is a short necklace at the throat, a long haram down the front, jhumka at the ears, and usually an oddiyanam at the waist, which is the piece that settles the whole silhouette. They are chosen together because they have to sit together.",
      "This is the register that suits a muhurtham in lamp and flash light, and the one that carries the most gold. It is also the heaviest — which is worth knowing before the morning, not during it.",
    ],
    searchFor:
      "bridal temple jewellery rental, antique gold bridal set, Lakshmi haram, oddiyanam",
  },
  {
    slug: "american-diamond-sets",
    metaTitle: "American Diamond Bridal Sets on Rent",
    key: "ad",
    name: "American Diamond",
    titleLines: ["American diamond", "bridal sets."],
    intro:
      "White stone work — choker, haram, jhumka and belt — for a reception, an engagement, or a bride who wants the shape of temple jewellery in a cooler light.",
    body: [
      "American diamond sits at the opposite end of the room from temple gold. It is white rather than warm, it reads sharp under video light where gold reads soft, and it photographs closer to what a camera does with real stones.",
      "The sets here are built on the same structure as the traditional ones — a choker, a long haram, earrings and often an oddiyanam — so the silhouette is familiar even though the colour is not. Many carry ruby-red and emerald-green stones alongside the white, which is how the register keeps a South Indian character rather than becoming generic.",
      "It is the most common choice for a reception, and for the second look on a wedding day where the ceremony was traditional.",
    ],
    searchFor:
      "AD stone bridal jewellery rental, American diamond necklace set, reception jewellery",
  },
  {
    slug: "choker-and-necklace-sets",
    metaTitle: "Bridal Choker & Necklace Sets on Rent",
    key: "choker",
    name: "Choker & Necklace",
    titleLines: ["Choker and", "necklace sets."],
    intro:
      "Shorter sets — a single necklace with its earrings — for an engagement, a reception, a sister of the bride, or worn with a haram from another set.",
    body: [
      "Not every event needs a full bridal set, and not every neckline can take one. A choker or a single statement necklace with matching earrings is the right weight for an engagement, a mehndi, a reception where the saree is doing the work, or for the women around the bride.",
      "These are also what gets layered. A choker from here worn above a haram from a temple set is one of the most common combinations in a Tamil bridal look, and it is worth trying the two together rather than choosing them separately.",
      "The stone work runs from clear white through ruby and emerald, and a few of the sets carry a matching maang tikka.",
    ],
    searchFor:
      "bridal choker rental, necklace and earring set, engagement jewellery, party wear necklace",
  },
  {
    slug: "on-the-bride",
    metaTitle: "Bridal Jewellery, Worn",
    key: "worn",
    name: "On the Bride",
    titleLines: ["Worn by", "the bride."],
    intro:
      "The same jewellery on a face, in a hall, under real light — which is the only way to judge how a set will actually sit.",
    body: [
      "A necklace on a velvet stand tells you what it is. It does not tell you where it will fall, how it will sit against a blouse neckline, or what it does next to a face.",
      "These are sets photographed as worn. It is worth looking at them before choosing from the catalogue pages, because the difference between a set that looks right on a stand and one that looks right on a bride is mostly about proportion — and proportion is the thing a product photograph flattens.",
    ],
    searchFor: "bridal jewellery on model, south indian bridal look, wedding jewellery styling",
  },
];

export const rentalCategoryBySlug = (slug: string): RentalCategory | undefined =>
  rentalCategories.find((c) => c.slug === slug);

export const rentalCategoryByKey = (key: string): RentalCategory | undefined =>
  rentalCategories.find((c) => c.key === key);
