import type { BrideStory } from "@/lib/types";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  REAL BRIDE STORIES
 * ─────────────────────────────────────────────────────────────────────────────
 *  ⚠ EVERY ENTRY IS UNPUBLISHED. Nothing here reaches the website.
 *
 *  A bride story asserts facts about a real person — her ceremony, her city,
 *  her day. None of that has been supplied, so publishing these would be
 *  fabricating client narratives, which the brief forbids outright.
 *
 *  While this list has no published entry, the site shows FEATURED BRIDAL
 *  LOOKS drawn from the real portfolio instead — genuine photographs with
 *  neutral look titles and no invented identity.
 *
 *  TO PUBLISH A REAL STORY:
 *    1. Get the bride's permission, in writing, for her name and photographs.
 *    2. Fill in name / weddingType / location / look / date / story.
 *    3. Point hero.src and gallery[].src at imported photographs
 *       (see content/incoming/README.md).
 *    4. Set `published: true`.
 *  The homepage act, the /brides index and the story page all appear on their
 *  own — no code change.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const brides: BrideStory[] = [
  {
    slug: "a-muhurtham-in-trichy",
    name: "A Muhurtham in Trichy",
    weddingType: "Muhurtham",
    location: "Trichy, Tamil Nadu",
    look: "Traditional South Indian · Gold",
    date: "Sample entry",
    excerpt:
      "The format a full ceremony commission takes — from the first consultation to the last photograph of the morning.",
    story: [
      "This entry exists to show how a bride's story is presented once Lana adds a real one. The layout, the rhythm of the images and the length of the text are all real; the bride is not.",
      "A muhurtham commission usually begins weeks before the morning itself — a conversation about the saree, the jewellery, the light in the hall and how much of it the bride wants to answer.",
      "The look is then built backwards from that conversation: skin first, structure second, colour last.",
      "Replace this text with the real account of the day, in Lana's or the bride's words.",
    ],
    hero: { alt: "Sample muhurtham story cover — placeholder plate", tone: "bronze", seed: 301 },
    gallery: [
      { alt: "Sample story image — placeholder plate", tone: "rose", seed: 302 },
      { alt: "Sample story image — placeholder plate", tone: "champagne", seed: 303 },
      { alt: "Sample story image — placeholder plate", tone: "ink", seed: 304 },
    ],
    services: ["Muhurtham Bridal", "Bridal Hair", "Draping"],
    featured: true,
    published: false,
  },
  {
    slug: "an-evening-reception",
    name: "An Evening Reception",
    weddingType: "Reception",
    location: "Tamil Nadu",
    look: "HD · Cool evening palette",
    date: "Sample entry",
    excerpt:
      "How a reception look is documented — the shift out of ceremonial gold and into evening light.",
    story: [
      "A second entry showing the same format in a different register.",
      "Reception work is photographed under artificial light almost without exception, which changes every decision about finish and colour temperature.",
      "Replace this with the real story.",
    ],
    hero: { alt: "Sample reception story cover — placeholder plate", tone: "indigo", seed: 311 },
    gallery: [
      { alt: "Sample story image — placeholder plate", tone: "champagne", seed: 312 },
      { alt: "Sample story image — placeholder plate", tone: "indigo", seed: 313 },
    ],
    services: ["Reception", "Bridal Hair"],
    featured: true,
    published: false,
  },
  {
    slug: "an-engagement-morning",
    name: "An Engagement Morning",
    weddingType: "Engagement",
    location: "Tamil Nadu",
    look: "Natural finish",
    date: "Sample entry",
    excerpt:
      "The lightest of the three registers, and usually the first time a bride sees the direction of her wedding look.",
    story: [
      "A third entry, kept deliberately short to show how the layout handles a brief story.",
      "Replace this with the real story.",
    ],
    hero: { alt: "Sample engagement story cover — placeholder plate", tone: "rose", seed: 321 },
    gallery: [{ alt: "Sample story image — placeholder plate", tone: "ivory", seed: 322 }],
    services: ["Engagement", "Soft Hair Styling"],
    featured: false,
    published: false,
  },
];
