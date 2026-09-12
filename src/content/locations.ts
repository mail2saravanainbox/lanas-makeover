import type { PortfolioCategory } from "@/lib/types";
import { siteSettings } from "@/content/site";
import { locationSlugs } from "@/content/location-slugs";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE CITY PAGES
 * ═══════════════════════════════════════════════════════════════════════════
 *  "Bridal makeup artist in Chennai" is the query. A page that answers it has
 *  to be about Chennai — otherwise it is a doorway page, which is the oldest
 *  and most reliably penalised trick in local SEO: one template, four names
 *  swapped, nothing said.
 *
 *  So each entry below is written from what is ACTUALLY different about a
 *  wedding in that city, and there is only one shared sentence between them —
 *  the travel note, which is Lana's own approved wording.
 *
 *  ── WHAT MAY BE WRITTEN HERE ──────────────────────────────────────────────
 *  Geography (road distances between Tamil Nadu cities are public fact), and
 *  the CRAFT consequences of that geography: what a 6 a.m. muhurtham three
 *  hundred kilometres away does to the hour the first brush comes out. Those
 *  are statements about how the work works, and they are true of any artist.
 *
 *  ── WHAT MAY NOT ──────────────────────────────────────────────────────────
 *  Anything about Lana's record: venues worked, brides counted, years, awards,
 *  prices, travel charges, or a promise about when she arrives. Those are
 *  commercial facts only she can supply, and a city page is exactly where the
 *  temptation to invent them is strongest. Where an answer would need one, the
 *  copy says the logistics are confirmed directly — which is true — and the
 *  gap is recorded as TODO(client) rather than filled in.
 *
 *  ── AND THE GALLERY IS NOT THE SAME FOUR TIMES ────────────────────────────
 *  Each page leads with the categories that city's weddings actually lean on,
 *  capped at four, with the archive one link away. The mobile audit found the
 *  same twelve photographs on seven pages; four city pages must not make it
 *  eleven.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export interface LocationConfig {
  /** URL segment. */
  slug: string;
  /** Must appear in siteSettings.serviceAreas — asserted at the bottom. */
  city: string;
  /** The <h1>, split across two lines. */
  titleLines: [string, string];
  /** One sentence under the title. City-specific, never boilerplate. */
  intro: string;
  /**
   * Approximate road distance from the base city, in kilometres. Public
   * geography, used to say something true about the morning rather than to
   * imply a travel charge. `null` on the base city itself.
   */
  distanceKm: number | null;
  /** Two or three sections that could not be written about another city. */
  sections: Array<{ heading: string; body: string[] }>;
  /** What a bride in THIS city asks, answered without inventing policy. */
  faqs: Array<{ question: string; answer: string }>;
  /** Which rooms of the archive lead here. Different per city on purpose. */
  categories: PortfolioCategory[];
}

const BASE = siteSettings.location;

export const locations: LocationConfig[] = [
  // ── TRICHY ───────────────────────────────────────────────────────────────
  {
    slug: "trichy",
    city: "Trichy",
    titleLines: ["Bridal makeup", "in Trichy."],
    intro:
      "The home city. No travel, no night before, and a morning that can start when the muhurtham says it should rather than when the road allows.",
    distanceKm: null,
    sections: [
      {
        heading: "The only city with no journey in it",
        body: [
          "Every other wedding on this site involves a road. Trichy does not, and that changes one specific thing: the schedule is decided entirely by the muhurtham and the bride, not by a departure time.",
          "It matters most for the early auspicious hours. A 5 a.m. muhurtham in Trichy means the first brush at around two — long, but a single unbroken morning. The same hour in Chennai is a different logistical animal entirely.",
          "It also means a trial and the wedding can sit in the same city, which is the simplest version of the one thing that most reliably prevents a surprise on the day.",
        ],
      },
      {
        heading: "Halls, hotels and homes",
        body: [
          "Trichy weddings run across all three, and the getting-ready space is rarely the polished suite that photographs imply. It is often a side room with one window and a mirror at the wrong height.",
          "That is a working constraint, not a complaint. A kit is packed for the light that will actually be in the room — which in practice means bringing the light rather than hoping for it, and checking the face under something close to what the camera will see.",
        ],
      },
    ],
    faqs: [
      {
        question: "Where in Trichy do you work?",
        answer:
          "Anywhere in the city and the surrounding area — wedding halls, hotels, and at home. Send the venue with your date and the morning is planned around the room you will actually be in.",
      },
      {
        question: "Can I have my trial in Trichy before a wedding elsewhere?",
        answer:
          "That is the usual way round, and it is the most useful version of a trial: the register gets settled somewhere unhurried, and the wedding morning is then execution rather than discovery. Ask about trial availability when you enquire.",
      },
    ],
    categories: ["tamil-bridal", "muhurtham", "jadai", "hair"],
  },

  // ── CHENNAI ──────────────────────────────────────────────────────────────
  {
    slug: "chennai",
    city: "Chennai",
    titleLines: ["Bridal makeup", "in Chennai."],
    intro:
      "Three hundred kilometres from the base city, and almost always a hotel. Both of those facts decide how a Chennai morning is built.",
    distanceKm: 320,
    sections: [
      {
        heading: "The arithmetic of an early muhurtham",
        body: [
          "Chennai is roughly 320 km from Trichy by road. A muhurtham at six in the morning therefore cannot be served by leaving on the day — the numbers do not work, and a bride should be suspicious of anyone who says otherwise.",
          "What that means in practice is that a Chennai wedding is planned backwards from the auspicious hour and then backwards again from the road. The exact arrangement — when travel happens, and what it involves — is confirmed with you directly rather than assumed here.",
          "The part worth knowing as a bride: give the muhurtham time in the enquiry, not just the date. An 11 a.m. ceremony and a 5 a.m. one are two different commissions.",
        ],
      },
      {
        heading: "Hotel light is not hall light",
        body: [
          "Most Chennai weddings of any size happen in hotels, and hotel banquet lighting is warm, even, and much more forgiving than a hall lit by tube light and daylight through an open side.",
          "It is also, almost always, heavily photographed and increasingly filmed. A face built for a video camera under warm hotel light is not the face built for oil lamps at a temple — the base is lighter, the definition sharper, and the colour cooler than a traditional muhurtham register.",
          "Chennai receptions push this furthest. It is the event where the register moves closest to editorial on this site, and where the bride is most likely to want two distinctly different looks in one day.",
        ],
      },
      {
        heading: "Two events, two faces, one continuity",
        body: [
          "A Chennai wedding weekend commonly carries a reception as a separate event with its own guest list, sometimes on a different day and often in a different room.",
          "Treating that as a touch-up is the usual mistake. It is a second look, planned as one, with a deliberate relationship to the first — the same bride, recognisably, in two different lights.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you travel to Chennai for weddings?",
        answer: `Yes. ${siteSettings.travelNote} Chennai is one of the four primary service locations. Share the venue and the muhurtham time with your date and the logistics are confirmed with you directly.`,
      },
      {
        question: "My muhurtham is very early. Is that a problem for a Chennai wedding?",
        answer:
          "It is not a problem, but it is a planning question rather than a detail — the whole morning is built backwards from that hour, and at this distance the arrangements around it are settled in advance rather than on the day. Send the time along with the date.",
      },
      {
        question: "Can you do both the muhurtham and the reception?",
        answer:
          "Yes, and it is worth booking them together. A reception look planned alongside the ceremony look reads as continuity; one improvised afterwards reads as a different bride.",
      },
    ],
    categories: ["reception", "editorial", "bridal", "engagement"],
  },

  // ── MADURAI ──────────────────────────────────────────────────────────────
  {
    slug: "madurai",
    city: "Madurai",
    titleLines: ["Bridal makeup", "in Madurai."],
    intro:
      "The most traditional register on this site, in the city that asks for it — temple weddings, heavy gold, and a face built to hold its own against both.",
    distanceKm: 130,
    sections: [
      {
        heading: "A face that has to survive the jewellery",
        body: [
          "Madurai weddings lean traditional, and traditional means gold — a lot of it, high on the face, catching every light source in the room.",
          "Jewellery of that weight competes with a face rather than framing it. The answer is not more makeup; it is more structure. The features are defined enough to read from a distance and restrained enough that the eye still lands on the bride rather than on the work.",
          "The traditional South Indian register is the house's oldest discipline for exactly this reason. It was developed for rooms like these.",
        ],
      },
      {
        heading: "Temple light, and what it does",
        body: [
          "A temple or a temple-adjacent hall is lit by oil lamps, open doorways and camera flash, often within the same minute. It is the least forgiving and least predictable light a bride will ever stand in.",
          "Flash flattens; lamplight is warm and directional; daylight through a door is cool and comes from one side. A base that pleases one of them will fail the other two unless it is built knowing all three are coming.",
          "This is the practical case against a very heavy base in Madurai specifically. Under flash it goes pale, and the difference between the face and the neck becomes the thing everyone sees in the photographs.",
        ],
      },
      {
        heading: "The jadai is not an accessory",
        body: [
          "A traditional Madurai bridal silhouette is decided as much by the braid as by the face, and a jadai carrying flowers and ornament for twelve hours is a structural problem before it is a decorative one.",
          "Tension at the root, volume at the crown and the anchor points all get set before the braid is closed. Undone and redone at midday is not an option once the ornaments are in.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you do traditional South Indian bridal looks for Madurai weddings?",
        answer:
          "It is the register most Madurai commissions ask for, and it is one of the three the house works in — alongside natural and HD. Which one suits you is decided with you rather than imposed, and it can differ between the ceremony and the evening.",
      },
      {
        question: "Is a jadai included with bridal hair?",
        answer:
          "Bridal hair is treated as its own discipline here rather than as an afterthought to the makeup, and jadai work sits inside it. Confirm the exact scope of hair for your booking when you enquire.",
      },
      {
        question: "Do you travel to Madurai?",
        answer: `Yes. ${siteSettings.travelNote} Madurai is one of the four primary service locations, roughly 130 km from ${BASE}.`,
      },
    ],
    categories: ["jadai", "tamil-bridal", "muhurtham", "hair"],
  },

  // ── PUDUKKOTTAI ──────────────────────────────────────────────────────────
  {
    slug: "pudukkottai",
    city: "Pudukkottai",
    titleLines: ["Bridal makeup", "in Pudukkottai."],
    intro:
      "Close enough to Trichy that the morning can start the same morning — which makes it the most flexible of the four, and the easiest to schedule around a difficult muhurtham.",
    distanceKm: 50,
    sections: [
      {
        heading: "Fifty kilometres changes the plan",
        body: [
          "Pudukkottai is about an hour from the base city. That is the difference between a wedding that has to be planned around a journey and one where the journey is a detail.",
          "It matters most for the awkward hours — a muhurtham at seven, or a bride who wants the first brush later than a long-distance schedule would allow. There is simply more room in the morning.",
          "It also makes a second event on the same day more workable than it is at a distance.",
        ],
      },
      {
        heading: "Smaller rooms, family close by",
        body: [
          "Weddings here are frequently at home or in a hall attached to one, which means the getting-ready room usually has family in it — and the bride is rarely alone for the two hours before the ceremony.",
          "That is a real working condition rather than a footnote. Party and guest makeup for the people around the bride is often part of the same morning, and how many faces there are decides the order everything happens in.",
          "Say how many people need makeup in the enquiry, not only that the bride does. It is the single detail that most changes how a morning is timed.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you cover Pudukkottai and the surrounding towns?",
        answer: `Pudukkottai is one of the four primary service locations, roughly 50 km from ${BASE}. ${siteSettings.travelNote} Send the venue with your date.`,
      },
      {
        question: "Can you also do makeup for the family?",
        answer:
          "Yes — party and guest makeup for the family around the bride is part of the work. Tell us how many people and for which events in your enquiry so the morning can be timed properly.",
      },
    ],
    categories: ["bridal", "hair", "behind-scenes", "tamil-bridal"],
  },
];

/**
 * ⚠ THE CITY LIST AND THE PAGE LIST MUST NOT DRIFT.
 *
 * siteSettings.serviceAreas drives the hero, the footer, the FAQ, the booking
 * form's city chips and the areaServed in the business schema. If a city is
 * added there and no page is written for it, the site would claim to serve
 * somewhere it has nothing to say about — and if a page is written for a city
 * that has quietly been dropped, it would keep claiming it after the fact.
 *
 * Throwing at module load is deliberate: this fails the build, not a visitor.
 */
const configured = new Set(locations.map((l) => l.city));
const declared = new Set(siteSettings.serviceAreas);

for (const city of declared) {
  if (!configured.has(city)) {
    throw new Error(
      `locations.ts: "${city}" is in siteSettings.serviceAreas but has no city page. ` +
        `Write one, or take the city out of serviceAreas — a city offered with nothing behind it is a promise the site cannot keep.`,
    );
  }
}
for (const city of configured) {
  if (!declared.has(city)) {
    throw new Error(
      `locations.ts: a page exists for "${city}" but it is not in siteSettings.serviceAreas. ` +
        `Add it there, or delete the entry — an orphaned city page keeps claiming a service area after it has been dropped.`,
    );
  }
}

export const locationBySlug = (slug: string): LocationConfig | undefined =>
  locations.find((l) => l.slug === slug);

/** The city page for a city name, for linking from the places that list cities. */
export const locationForCity = (city: string): LocationConfig | undefined =>
  locations.find((l) => l.city === city);


/**
 * The URL shape lives in `location-slugs.ts` — see the note there for why it
 * is a separate, import-free module. Re-exported so callers have one import.
 */
export { locationHref, retiredLocationHref } from "@/content/location-slugs";

/**
 * ⚠ THE SLUG LIST AND THE PAGE LIST MUST NOT DRIFT EITHER.
 *
 * `next.config.ts` builds the redirect table from `locationSlugs`, and the
 * four `src/app/bridal-makeup-<slug>/` folders are written by hand. If a slug
 * here is not in that list, its old URL keeps 404ing; if a slug in that list
 * has no entry here, the config redirects to a page that does not exist.
 *
 * Throwing at module load fails the build rather than a visitor.
 */
{
  const slugs = new Set<string>(locationSlugs);
  for (const l of locations) {
    if (!slugs.has(l.slug)) {
      throw new Error(
        `locations.ts: "${l.slug}" has no entry in location-slugs.ts, so /locations/${l.slug} will not redirect to it. ` +
          `Add it there, and add the src/app/bridal-makeup-${l.slug}/ folder.`,
      );
    }
  }
  for (const slug of slugs) {
    if (!locations.some((l) => l.slug === slug)) {
      throw new Error(
        `location-slugs.ts lists "${slug}" but locations.ts has no page for it — the redirect would point at a 404.`,
      );
    }
  }
}
