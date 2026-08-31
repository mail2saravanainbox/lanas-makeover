import type { DisciplineConfig } from "@/components/sections/DisciplinePage";

/**
 * The three discipline landing pages.
 *
 * These are the site's primary organic-search surfaces (§24) — but they earn
 * that position by being genuinely informative, not by repeating a keyword.
 * Every claim here is about the craft, never about Lana's record.
 */

export const bridal: DisciplineConfig = {
  slug: "bridal",
  eyebrow: "Bridal",
  titleLines: ["Bridal makeup", "and hair."],
  intro:
    "Muhurtham, reception and engagement — three different lights, three different faces, one bride who has to remain recognisable in all of them.",
  categories: ["bridal", "reception", "engagement"],
  relatedServices: ["muhurtham", "reception", "engagement", "signature-lana-look"],
  sections: [
    {
      heading: "The light decides everything",
      tone: "bronze",
      seed: 1101,
      body: [
        "A South Indian bridal morning is lit by oil lamps, daylight and camera flash, often within the same minute. An evening reception is lit almost entirely for video.",
        "Those are not stylistic differences. They are optical ones, and they change which products can be used, how much is used, and where.",
        "The look is therefore built per event rather than applied once and touched up. Continuity across the day is a decision, not an accident.",
      ],
    },
    {
      heading: "Structure before colour",
      tone: "ivory",
      seed: 1102,
      body: [
        "Most of a bridal face is decided before any colour appears — how the skin is prepared, what is corrected, and crucially what is left alone.",
        "A base that has been built properly can carry traditional South Indian colour without becoming a mask. A base that has not will look heavy no matter how restrained the palette.",
      ],
    },
    {
      heading: "Holding for twelve hours",
      tone: "champagne",
      seed: 1103,
      body: [
        "Tamil Nadu is hot, wedding halls are crowded, and a bride is embraced by several hundred people between the ceremony and the last photograph.",
        "Longevity is engineered in at the base and setting stage. It is not something that can be rescued with touch-ups at four in the afternoon.",
      ],
    },
  ],
};

export const makeup: DisciplineConfig = {
  slug: "makeup",
  eyebrow: "Makeup",
  titleLines: ["Natural, HD", "and everything between."],
  intro:
    "Two finishes, built for two different problems. Most weddings need a considered mix of both across the day.",
  categories: ["editorial", "bridal", "other"],
  relatedServices: ["signature-lana-look", "party-transformation", "muhurtham"],
  sections: [
    {
      heading: "The natural register",
      tone: "ivory",
      seed: 1201,
      body: [
        "Natural finishing keeps the skin's own texture visible. Coverage goes where it is needed and nowhere else, and the surface is allowed to behave like skin.",
        "It is the harder of the two to execute well, because there is nothing to hide behind.",
      ],
    },
    {
      heading: "The HD register",
      tone: "champagne",
      seed: 1202,
      body: [
        "HD finishing uses finer-milled, light-diffusing products developed for high-resolution capture. Under flash a conventional finish can go flat, chalky or grey; an HD finish is built to survive that.",
        "The common mistake is treating HD as simply more makeup. It is not more. It is differently engineered.",
      ],
    },
    {
      heading: "Party and transformation",
      tone: "rose",
      seed: 1203,
      body: [
        "Not every face in the room is the bride's. Sisters, mothers, friends, and the woman who simply has somewhere to be.",
        "Occasion work is where the register can travel furthest — bolder colour, sharper structure, and a more constructed result than bridal allows.",
      ],
    },
  ],
};

export const hair: DisciplineConfig = {
  slug: "hair",
  eyebrow: "Hair",
  titleLines: ["The silhouette", "of the bride."],
  intro:
    "From the back of a wedding hall nobody can see a lip line. What they can see is a silhouette — and that is built, not styled.",
  categories: ["hair"],
  relatedServices: ["bridal-hair", "muhurtham", "reception"],
  sections: [
    {
      heading: "What the braid carries",
      tone: "ink",
      seed: 1301,
      body: [
        "A traditional South Indian bridal braid can be asked to hold jadai billai, a length of jasmine, a kunjalam, and often a substantial amount of added hair.",
        "That weight has to sit still through the ceremony, through several changes of position, and through a great deal of embracing. The braid is not built to look good at seven in the morning; it is built to still be there at seven in the evening.",
      ],
    },
    {
      heading: "Fine hair, short hair",
      tone: "bronze",
      seed: 1302,
      body: [
        "Both are extremely common and entirely workable — but they need to be said out loud at the trial rather than discovered on the morning.",
        "Added hair is normal for bridal work and is matched to your own texture and colour. Short hair can carry a full traditional silhouette; it simply takes longer, and that time has to be built into the morning.",
      ],
    },
    {
      heading: "Jasmine",
      tone: "olive",
      seed: 1303,
      body: [
        "Jasmine is measured in muzham, not in stems, and it wilts. It should be bought as close to the morning as possible, kept cool, and never sealed in plastic overnight.",
        "If the ceremony runs long, plan a second string. It is a small cost and it is visible in every photograph taken after midday.",
      ],
    },
  ],
};
