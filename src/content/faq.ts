import type { FAQItem } from "@/lib/types";
import { citiesProse, siteSettings } from "@/content/site";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  FAQ (§20)
 * ─────────────────────────────────────────────────────────────────────────────
 *  Answers are written so they are true of this business as it has actually
 *  been described, and contain no invented commercial claim — no price, no
 *  travel fee, no advance amount, no team size, no duration promised as a
 *  guarantee.
 *
 *  ⟨confirm⟩ marks an answer awaiting Lana's real policy. The FAQ page renders
 *  those as a visible "To confirm" tag while `showPlaceholderBadges` is on, and
 *  `faqSchema()` strips them before they reach structured data — a marker for
 *  the client is not a sentence for Google.
 *
 *  The four service locations are read from `siteSettings.serviceAreas`, so the
 *  answers here cannot drift out of step with the hero, the footer or the
 *  booking form.
 *
 *  TODO(client): replace every ⟨confirm⟩ answer with Lana's real policy.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const faqs: FAQItem[] = [
  {
    id: "booking-window",
    question: "How early should I book my bridal makeup?",
    answer:
      "Wedding season in Tamil Nadu concentrates into a handful of muhurtham dates each year, and those dates fill first. If your date falls in a peak month, enquire as early as you have the date. Send it through Check Your Date and you will be told plainly whether it is open. ⟨confirm⟩",
    order: 1,
    published: true,
  },
  {
    id: "check-availability",
    question: "How do I check availability?",
    answer:
      "Use Check Your Date. It takes three short steps — your wedding and where it is, the events and what you need, and how to reach you — and it goes straight to Lana. If you would rather just ask, WhatsApp and Instagram reach the same person.",
    order: 2,
    published: true,
  },
  {
    id: "cities",
    question: "Which cities do you serve?",
    answer: `${citiesProse()} are the primary service locations. It is one artist working across all four, not four studios — so the same hands, the same kit and the same approach wherever your wedding is.`,
    order: 3,
    published: true,
  },
  {
    id: "travel",
    question: "Do you travel for weddings?",
    answer: `Yes. ${siteSettings.travelNote} Share the venue and the city in your enquiry and the logistics will be confirmed with you directly. ⟨confirm travel radius, charges and terms⟩`,
    order: 4,
    published: true,
  },
  {
    id: "travel-outside",
    question: `Do you travel outside ${citiesProse()}?`,
    answer: `Travel beyond the four primary locations is available across Tamil Nadu, subject to availability and travel terms. Destination weddings and venues further afield are worth asking about rather than assuming either way — send the venue with your date. ⟨confirm the limits, and whether outside Tamil Nadu is offered⟩`,
    order: 5,
    published: true,
  },
  {
    id: "duration",
    question: "How long does bridal makeup take?",
    answer:
      "It depends on the register, the hair, and how many people are being made up before or after the bride — a traditional South Indian bridal look with a structured jadai is a longer morning than a reception look. The timing for your specific morning is planned with you once the events are known, and it is planned backwards from the muhurtham rather than forwards from the alarm. ⟨confirm typical durations⟩",
    order: 6,
    published: true,
  },
  {
    id: "hair-included",
    question: "Do you provide bridal hair styling?",
    answer:
      "Bridal hair is treated as its own discipline here, not an afterthought to the makeup — jadai, braid structure, volume and floral placement all have to hold for the length of the ceremony. Confirm the exact scope of hair for your booking when you enquire. ⟨confirm⟩",
    order: 7,
    published: true,
  },
  {
    id: "draping",
    question: "Do you provide saree draping?",
    answer:
      "Draping is offered as part of the bridal work — the drape decides the silhouette as much as the hair does, and a saree pinned in a hurry undoes a morning of work. Select it in your enquiry so the time is allowed for it. ⟨confirm whether draping is included or charged separately⟩",
    order: 8,
    published: true,
  },
  {
    id: "family-makeup",
    question: "Do you provide family and guest makeup?",
    answer:
      "Party and transformation makeup for the family around the bride is part of the work. Tell us how many people and for which events in your enquiry so the morning can be timed properly. ⟨confirm group availability and how many can be accommodated⟩",
    order: 9,
    published: true,
  },
  {
    id: "trial",
    question: "Do you offer makeup trials?",
    answer:
      "A trial is the reliable way to settle the register — natural, HD or traditional South Indian — before the morning itself, and to test how the look sits with your saree and jewellery. Ask about trial availability when you enquire. ⟨confirm whether trials are offered, and where⟩",
    order: 10,
    published: true,
  },
  {
    id: "difference-hd-natural",
    question: "What is the difference between natural and HD makeup?",
    answer:
      "Natural finishing keeps the skin's own texture visible and is built for daylight and for being seen in person. HD finishing uses finer-milled, light-diffusing products designed to hold up under flash and high-resolution video without turning flat or grey in photographs. Most South Indian weddings need a considered mix of the two across the day.",
    order: 11,
    published: true,
  },
  {
    id: "products",
    question: "What products do you use?",
    answer:
      "Products are chosen per face and per light — skin type, the weather on the day, and whether the event is photographed under sun, lamps or flash. If you have an allergy or a sensitivity, say so in your enquiry and the kit will be adjusted around it. ⟨confirm whether the brands used should be named⟩",
    order: 12,
    published: true,
  },
  {
    id: "advance",
    question: "How much advance is required to hold a date?",
    answer:
      "A date is held once an advance is received — that is what stops it being offered to anyone else. The amount and the way it is paid are confirmed with you directly when the date is agreed, and nothing is charged before you have been told the full figure. ⟨confirm the advance amount and payment terms⟩",
    order: 13,
    published: true,
  },
  {
    id: "date-change",
    question: "What happens if my wedding date changes?",
    answer:
      "Dates move, and it is better to say so early than on the week. Tell Lana as soon as you know and the booking will be moved to the new date if it is open. ⟨confirm the rescheduling and cancellation policy, including what happens to the advance⟩",
    order: 14,
    published: true,
  },
  {
    id: "skin-prep",
    question: "What should I prepare before the makeup session?",
    answer:
      "Start earlier than you think and change less than you think. The month before a wedding is the wrong moment to introduce an unfamiliar active or a new facial. Keep to a routine your skin already tolerates, protect it from sun, sleep, and treat any concern with a dermatologist well ahead of the date rather than in the final fortnight. On the morning itself: clean skin, hair as agreed at the trial, and your saree and jewellery in the room.",
    order: 15,
    published: true,
  },
];
