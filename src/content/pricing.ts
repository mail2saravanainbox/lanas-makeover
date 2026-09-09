/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PRICING (§11)
 * ─────────────────────────────────────────────────────────────────────────────
 *  A bride should not have to write an enquiry to find out whether this is
 *  remotely within her budget. Hiding the number does not make it smaller; it
 *  just costs the enquiry from someone who would have been fine with it, and
 *  wastes the time of someone who would not.
 *
 *  ⚠ NOTHING HERE IS INVENTED. `published: false` and an empty `packages`
 *    array is the honest current state: no price has been supplied, so no
 *    price is shown. What IS shown is the next most useful thing — the list of
 *    factors that actually move the number, which is true regardless of what
 *    the number turns out to be.
 *
 *  TODO(client): to publish real guidance, set `published: true` and fill in
 *  `packages`. Amounts are whole rupees, rendered as "From ₹XX,XXX":
 *
 *    published: true,
 *    packages: [
 *      { service: "Muhurtham Bridal", from: 25000 },
 *      { service: "Reception",        from: 18000 },
 *      { service: "Party / Guest",    from: 4000, unit: "per person" },
 *    ],
 *
 *  A `from` of 0 or a missing entry renders nothing for that service — a
 *  half-filled price list is worse than none.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export interface PricePackage {
  /** Should match a service name, so the two pages agree. */
  service: string;
  /** Whole rupees. The published figure is always a floor, never a quote. */
  from: number;
  /** e.g. "per person", "per event". Omit for a flat starting figure. */
  unit?: string;
  note?: string;
}

export interface Pricing {
  published: boolean;
  packages: PricePackage[];
  /**
   * The qualifier that must accompany every published figure. Kept here rather
   * than in a component so it cannot be shown for one package and not another.
   */
  qualifier: string;
  /** What decides the final number. True whether or not figures are published. */
  factors: string[];
}

export const pricing: Pricing = {
  published: false,
  packages: [],

  qualifier:
    "Final pricing depends on event type, date, location, services and travel requirements.",

  factors: [
    "Which events — muhurtham, reception, engagement, or several across a week.",
    "How many people need makeup, not only the bride.",
    "Whether hair, draping and a trial are included.",
    "The date. Peak muhurtham dates are the ones that fill first.",
    "The city, the venue and what the travel to it involves.",
  ],
};

/** "₹25,000" in the Indian numbering system. */
export function formatRupees(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Only packages with a real floor are publishable. */
export function publishedPackages(): PricePackage[] {
  return pricing.published ? pricing.packages.filter((p) => p.from > 0) : [];
}
