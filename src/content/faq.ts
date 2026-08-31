import type { FAQItem } from "@/lib/types";

/**
 * FAQ
 *
 * Answers are written so they are true of essentially any bridal artist and
 * contain no invented commercial claim (no pricing, no travel fee, no advance
 * amount, no team size). Anything that would require a business fact says so.
 *
 * TODO(client): replace the answers marked ⟨confirm⟩ with Lana's real policy.
 */
export const faqs: FAQItem[] = [
  {
    id: "booking-window",
    question: "How far in advance should I book?",
    answer:
      "Wedding season in Tamil Nadu concentrates into a handful of muhurtham dates each year, and those dates fill first. If your date falls in a peak month, enquire as early as you have the date. Send it through the enquiry form and you will be told plainly whether it is open. ⟨confirm⟩",
    order: 1,
    published: true,
  },
  {
    id: "travel",
    question: "Do you travel for weddings?",
    answer:
      "Yes. Travel is available — this is stated on the studio's public profile. Share the venue and city in your enquiry and the logistics will be confirmed with you directly. ⟨confirm travel radius and terms⟩",
    order: 2,
    published: true,
  },
  {
    id: "trial",
    question: "Is there a trial before the wedding?",
    answer:
      "A trial is the reliable way to settle the register — natural, HD or traditional South Indian — before the morning itself, and to test how the look sits with your saree and jewellery. Ask about trial availability when you enquire. ⟨confirm⟩",
    order: 3,
    published: true,
  },
  {
    id: "difference-hd-natural",
    question: "What is the difference between natural and HD makeup?",
    answer:
      "Natural finishing keeps the skin's own texture visible and is built for daylight and for being seen in person. HD finishing uses finer-milled, light-diffusing products designed to hold up under flash and high-resolution video without turning flat or grey in photographs. Most South Indian weddings need a considered mix of the two across the day.",
    order: 4,
    published: true,
  },
  {
    id: "hair-included",
    question: "Is hair styled as well as makeup?",
    answer:
      "Bridal hair is treated as its own discipline here, not an afterthought to the makeup — jadai, braid structure, volume and floral placement all have to hold for the length of the ceremony. Confirm the exact scope of hair for your booking when you enquire. ⟨confirm⟩",
    order: 5,
    published: true,
  },
  {
    id: "skin-prep",
    question: "How should I prepare my skin?",
    answer:
      "Start earlier than you think and change less than you think. The month before a wedding is the wrong moment to introduce an unfamiliar active or a new facial. Keep to a routine your skin already tolerates, protect it from sun, sleep, and treat any concern with a dermatologist well ahead of the date rather than in the final fortnight.",
    order: 6,
    published: true,
  },
  {
    id: "how-many-people",
    question: "Can you do makeup for my family as well?",
    answer:
      "Party and transformation makeup for the family around the bride is part of the work. Tell us how many people and for which events in your enquiry so the morning can be timed properly. ⟨confirm group availability⟩",
    order: 7,
    published: true,
  },
  {
    id: "products",
    question: "What products do you use?",
    answer:
      "Products are chosen per face and per light — skin type, the weather on the day, and whether the event is photographed under sun, lamps or flash. If you have an allergy or a sensitivity, say so in your enquiry and the kit will be adjusted around it.",
    order: 8,
    published: true,
  },
];
