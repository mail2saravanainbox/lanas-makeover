import type { Service } from "@/lib/types";

/**
 * BRIDAL WORLDS / SERVICES
 *
 * Grounded in the disciplines stated on the public profile:
 *   bridal · party transformation · natural · HD · South Indian bridal · travel
 *
 * Sub-events (muhurtham / reception / engagement) are the standard structure of
 * a South Indian wedding commission and are exposed as separate "worlds" for
 * navigation. No pricing, duration or package claim is made anywhere — those
 * are commercial facts only Lana can supply.
 *
 * TODO(client): confirm this list, remove anything not offered, add anything missing.
 */
export const services: Service[] = [
  {
    slug: "muhurtham",
    name: "Muhurtham Bridal",
    eyebrow: "The Ceremony",
    summary:
      "The look that carries her through the vows — built to survive lamps, heat, camera flash and a very long morning.",
    description: [
      "Muhurtham is the least forgiving light a bride will ever stand in. Oil lamps, camera flash, a hall of relatives and a South Indian morning, all at once.",
      "The approach is structural: skin prepared long before colour, features defined rather than redrawn, and a finish that holds its shape from the first ritual to the last photograph.",
      "South Indian bridal, natural or HD — the register is chosen with the bride, not imposed on her.",
    ],
    includes: [
      "Consultation on look direction",
      "Skin preparation",
      "Bridal makeup — natural, HD or traditional South Indian",
      "Bridal hair styling",
      "Draping assistance",
      "Touch-up guidance for the day",
    ],
    image: { alt: "Muhurtham bridal look", tone: "bronze", seed: 11 },
    category: "bridal",
    order: 1,
    published: true,
  },
  {
    slug: "reception",
    name: "Reception",
    eyebrow: "The Evening",
    summary:
      "A second face for a second light. Softer, cooler, quieter — the glamour of the evening rather than the weight of the ritual.",
    description: [
      "Evening light asks for something the ceremony does not. Where muhurtham is gold and heat, reception is cool, low and cinematic.",
      "The eye tends to carry the look. Skin stays luminous rather than matte, and the palette shifts away from the traditional reds toward something closer to editorial.",
    ],
    includes: [
      "Evening-light makeup",
      "Reception hair styling",
      "Look continuity with the ceremony",
      "On-site finishing",
    ],
    image: { alt: "Reception evening look", tone: "indigo", seed: 22 },
    category: "reception",
    order: 2,
    published: true,
  },
  {
    slug: "engagement",
    name: "Engagement",
    eyebrow: "The Beginning",
    summary:
      "The first time she is photographed as a bride-to-be. Lighter, younger, and deliberately less finished.",
    description: [
      "The engagement is where most brides discover what they actually want to look like on the wedding day. It is a rehearsal as much as an event.",
      "The look is intentionally restrained — enough for photographs, not so much that it pre-empts the ceremony.",
    ],
    includes: [
      "Engagement makeup",
      "Soft hair styling",
      "Direction-setting for the wedding look",
    ],
    image: { alt: "Engagement look", tone: "rose", seed: 33 },
    category: "engagement",
    order: 3,
    published: true,
  },
  {
    slug: "party-transformation",
    name: "Party Transformation",
    eyebrow: "The Occasion",
    summary:
      "Transformation makeup for the people around the bride — and for every occasion that is not a wedding.",
    description: [
      "Not every face in the room is the bride's. Sisters, mothers, friends, the woman who simply has somewhere to be.",
      "Party and transformation work is where the register can move furthest — bolder colour, sharper structure, a more constructed result than bridal allows.",
    ],
    includes: [
      "Party & occasion makeup",
      "Transformation makeup",
      "Hair styling",
      "Group bookings",
    ],
    image: { alt: "Party transformation look", tone: "champagne", seed: 44 },
    category: "other",
    order: 4,
    published: true,
  },
  {
    slug: "bridal-hair",
    name: "Bridal Hair",
    eyebrow: "The Silhouette",
    summary:
      "Jadai, braid, volume, jasmine. The half of the look that decides the shape of her from across the hall.",
    description: [
      "From the back of a wedding hall, nobody can see a lip line. What they can see is a silhouette.",
      "Bridal hair is treated as a structural discipline — a braid built to hold flowers and weight for twelve hours, or an open, softer shape for an evening.",
    ],
    includes: [
      "Bridal hair styling",
      "Traditional jadai",
      "Floral placement",
      "Accessory & jewellery setting",
    ],
    image: { alt: "Bridal hair silhouette", tone: "ink", seed: 55 },
    category: "hair",
    order: 5,
    published: true,
  },
  {
    slug: "signature-lana-look",
    name: "The Signature Lana Look",
    eyebrow: "Natural · HD",
    summary:
      "The house register. Skin that still reads as skin, in a country that photographs its brides very brightly.",
    description: [
      "The signature is not a colour story. It is a decision about how much of the original face survives.",
      "Natural and HD finishing, built so the bride's own features carry the look — and so she is still recognisable in her own photographs twenty years from now.",
    ],
    includes: [
      "Natural finish makeup",
      "HD makeup",
      "South Indian bridal register",
      "Look consultation",
    ],
    image: { alt: "Signature natural and HD finish", tone: "ivory", seed: 66 },
    category: "editorial",
    order: 6,
    published: true,
  },
];
