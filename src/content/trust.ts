import { citiesProse, siteSettings } from "@/content/site";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  TRUST SIGNALS (§19)
 * ─────────────────────────────────────────────────────────────────────────────
 *  ⚠ ONLY VERIFIED CLAIMS ARE PUBLISHED. Every entry carries `published`, and
 *    the section renders exactly the entries that are true today. Trust is the
 *    one thing on this site that cannot be designed into existence: a bride
 *    who discovers one invented number stops believing the other five.
 *
 *  PUBLISHED — sourced from the public profile @lanasmakeover and from what
 *  this site itself commits to:
 *    · the four service locations
 *    · travel availability, with its qualifier
 *    · the disciplines (natural, HD, South Indian bridal)
 *    · bridal hair as its own discipline
 *
 *  WITHHELD — every one of these is a real trust signal and every one of them
 *  needs a fact only Lana can supply. They are listed rather than deleted so
 *  that turning them on is a one-word edit, and so nobody has to remember that
 *  they were ever an option.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export interface TrustSignal {
  /** Short, factual. Never a superlative. */
  label: string;
  detail: string;
  published: boolean;
}

export const trustSignals: TrustSignal[] = [
  {
    label: "Four cities",
    detail: `Bridal makeup and hair across ${citiesProse()}.`,
    published: true,
  },
  {
    label: "Travel",
    detail: siteSettings.travelNote,
    published: true,
  },
  {
    label: "Natural · HD · South Indian",
    detail:
      "Three registers, chosen with the bride rather than imposed on her — daylight, camera flash, and the traditional South Indian bridal face.",
    published: true,
  },
  {
    label: "Hair as its own discipline",
    detail:
      "Jadai, braid structure, volume and floral placement, built to hold for the length of a ceremony rather than for a photograph.",
    published: true,
  },

  /* ── Withheld until supplied ─────────────────────────────────────────────
     TODO(client): set `published: true` and replace the detail with the real
     fact. Do not publish any of these on an estimate. */
  {
    label: "Experience",
    detail: "TODO(client): years working as a bridal artist.",
    published: false,
  },
  {
    label: "Brides",
    detail: "TODO(client): number of brides, only if it has actually been counted.",
    published: false,
  },
  {
    label: "Hygiene",
    detail:
      "TODO(client): the real kit hygiene practice — disposables, brush sanitising between faces, single-use applicators.",
    published: false,
  },
  {
    label: "Products",
    detail: "TODO(client): the brands actually used, only if Lana wants them named.",
    published: false,
  },
  {
    label: "Training",
    detail: "TODO(client): professional training or certification, with the awarding body.",
    published: false,
  },
];

export const publishedTrustSignals = (): TrustSignal[] => trustSignals.filter((s) => s.published);
