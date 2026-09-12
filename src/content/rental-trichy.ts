/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  RENTAL JEWELLERY IN TRICHY — THE CITY PAGE
 * ═══════════════════════════════════════════════════════════════════════════
 *  "rental jewellery Trichy", "bridal jewellery sets for rent in Trichy",
 *  "bridal jewellery on rent in Trichy" — six related searches, and until now
 *  nothing on this site answered any of them. `/rental-jewellery` is the
 *  catalogue's front door and never says Trichy in its title, its h1 or its
 *  description; the four room pages are about metal and stone, not about a
 *  city. So the query had a business behind it and no page.
 *
 *  ── WHAT KEEPS THIS FROM BEING A DOORWAY PAGE ─────────────────────────────
 *  A city page that repeats the hub with a place name bolted on is the thing
 *  Google has been demoting since 2012, and it would be the easy version of
 *  this file. The difference here is that the two pages do different jobs:
 *
 *    /rental-jewellery        four rooms, four covers. NAVIGATION.
 *    /rental-jewellery-trichy the whole collection on one page, and the
 *                             specific question of what a Trichy wedding
 *                             asks of a set. A SHOWROOM.
 *
 *  The prose below could not be written about Chennai without changing it,
 *  because it is about the one city where the jewellery and the artist are
 *  already in the same place.
 *
 *  ── AND WHAT IT STILL MAY NOT SAY ─────────────────────────────────────────
 *  No rental price. No deposit figure. No hold period. No security terms. No
 *  promise that a set can be seen before the date, or delivered, or held. Not
 *  one of those has been supplied, every one of them is the kind of thing a
 *  bride decides on, and a wrong number here is worse than no page at all.
 *
 *  Where an answer needs a commercial fact, the copy says it is confirmed
 *  directly — which is true — and the gap is a TODO(client) below.
 *
 *  TODO(client): rental price bands, deposit, how long a set is held against
 *  a date, whether the collection can be seen in person in Trichy and where,
 *  whether sets travel to the other three cities or are collected. Answer
 *  those and this page can carry the six highest-intent sentences on the site.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface RentalTrichySection {
  heading: string;
  body: string[];
}

/** Two or three paragraphs each. About the jewellery and the city, never puff. */
export const rentalTrichySections: RentalTrichySection[] = [
  {
    heading: "The one city where the jewellery is already here",
    body: [
      "Trichy is the base. Every other city on this site involves a road, and a road is the thing that decides how early a wedding morning starts and how far in advance a set has to be settled. Here it does not.",
      "What that changes for jewellery specifically is the order of decisions. In another city the set is usually chosen from photographs and confirmed early, because it has to travel with everything else. For a Trichy wedding the choosing can stay open longer and can happen alongside the makeup rather than weeks ahead of it — which matters, because the two decisions are really one decision.",
      "Whether a set can be seen in person before the date, and where, is confirmed directly when you enquire. It depends on the date and on what is already committed.",
    ],
  },
  {
    heading: "What a muhurtham in Trichy does to a set",
    body: [
      "Most Trichy muhurthams are early, and early means lamp light and camera flash rather than daylight. Those two lights do opposite things to jewellery. Warm gold under a lamp glows and reads soft; the same gold under a direct flash flattens. White stone does the reverse — dull in lamp light, bright under flash.",
      "This is the practical reason temple jewellery still wins the ceremony and American diamond still wins the reception, and it is not a matter of taste. A traditional Tamil ceremony is usually lit by the fire, the lamps and a photographer's flash, and antique gold is the only register that survives all three.",
      "Temple weddings sharpen it further. Srirangam and the older temples around the city are dark stone with very little ambient light, and a set is seen almost entirely by flash and by whatever the videographer brings. Weight and outline carry in that light; fine detail does not. Choose the piece that has a shape from ten feet away.",
    ],
  },
  {
    heading: "Halls, hotels and heat",
    body: [
      "Trichy runs hot for most of the wedding calendar, and the getting-ready room is rarely air-conditioned even when the hall is. Jewellery is the part of a bridal look that notices heat first: an oddiyanam at the waist and a full haram over a heavy Kanchipuram are worn for six or seven hours, not for a photograph.",
      "Two things follow. The first is that the weight of a set is worth knowing before the morning rather than during it — a full temple set is genuinely heavy, and it is better to decide that you want it than to discover it. The second is that the jewellery should go on after the drape and after the last of the makeup, which is the ordinary order but gets reversed when a morning runs late.",
      "A second, lighter set for the reception is the usual answer to a long day, and it is the most common reason a bride rents two rather than one.",
    ],
  },
  {
    heading: "The set and the face are one decision",
    body: [
      "A choker sitting high at the throat and a long haram down the front change where a face is looked at, and they change what the makeup has to do. A heavy gold set next to a heavy eye is two things competing. The same set next to a quieter eye and a stronger lip is one look.",
      "This is the whole argument for renting the jewellery from the person doing the makeup: they are chosen against each other in one conversation rather than in two shops. The neckline of the blouse, the weight of the haram, the height of the jadai and where the flowers sit are all the same question asked four ways.",
      "If you are still choosing, look at the worn sets before the catalogue frames. A necklace on a stand tells you what it is; a necklace on a bride tells you where it falls.",
    ],
  },
];

/** What a bride in Trichy actually asks. Answered, or honestly deferred. */
export const rentalTrichyFaqs: Array<{ question: string; answer: string }> = [
  {
    question: "Do you rent bridal jewellery in Trichy?",
    answer:
      "Yes. The collection is part of Lana's Makeover rather than a separate shop, and Trichy is the base city — so for a Trichy wedding the jewellery and the makeup are arranged in the same conversation. Browse the sets below and send your date with the ones you are drawn to.",
  },
  {
    question: "What kinds of bridal jewellery can I rent?",
    answer:
      "Four registers: temple jewellery in antique gold, American diamond in white stone, shorter choker and necklace sets, and a set of photographs of the jewellery as worn. Every set on this page is one that can be rented — nothing here is illustrative.",
  },
  {
    question: "How much does it cost to rent a bridal jewellery set in Trichy?",
    answer:
      "Rental terms are settled per set and per date rather than from a list, so they are confirmed directly when you enquire. Send the date and the sets you are considering and you will have the terms for those specific sets.",
  },
  {
    question: "Can I rent jewellery without booking the makeup?",
    answer:
      "Ask when you enquire. The two are usually arranged together for a Trichy wedding because they are chosen against each other, but the jewellery is a separate line of work and the answer depends on the date.",
  },
  {
    question: "How early should I choose the jewellery?",
    answer:
      "Earlier than most brides expect, and for one unromantic reason: a set is committed to one date at a time, and the popular temple sets go first in the wedding months. Choosing early also leaves room to change your mind, which is the real benefit.",
  },
  {
    question: "Can I see the jewellery before the wedding?",
    answer:
      "That is confirmed directly — it depends on the date and on what is already committed. Every set is photographed here at full size, including a section of sets photographed as worn, so a choice can be made from the page if seeing them in person is not practical.",
  },
  {
    question: "Do you rent jewellery outside Trichy?",
    answer:
      "Bridal jewellery rental is offered across the cities Lana works in, and the arrangement for a wedding outside Trichy — how a set gets there and when — is confirmed with you directly rather than assumed here.",
  },
];

/** The enquiry flow, stated plainly. No step here is invented. */
export const rentalTrichySteps: Array<{ step: string; body: string }> = [
  {
    step: "Browse the collection",
    body: "Every set that can be rented is on this page, at full size. Tap any frame to open it, and use the arrow keys to compare one against the next.",
  },
  {
    step: "Send your date and the sets",
    body: "The date, the city, the event — muhurtham, reception, engagement — and the sets you are drawn to. More than one is normal and makes the reply more useful.",
  },
  {
    step: "Terms come back for those sets",
    body: "Availability against your date, rental terms and the deposit, for the specific sets you asked about rather than as a price list.",
  },
  {
    step: "The set and the look are settled together",
    body: "Neckline, weight, the height of the jadai and where the makeup sits — one conversation, because they are one decision.",
  },
];
