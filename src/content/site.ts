import type { SiteSettings } from "@/lib/types";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CLIENT-EDITABLE CONFIGURATION
 * ─────────────────────────────────────────────────────────────────────────────
 *  Everything Lana may want to change lives here. No component reads hardcoded
 *  brand copy — they all read this file through the ContentProvider.
 *
 *  VERIFIED FACTS (from the public Instagram profile @lanasmakeover):
 *    · Brand name .......... Lana's Makeover
 *    · Discipline .......... Bridal & Party Transformation Makeup Artist
 *    · Base ................ Trichy (Tiruchirappalli), Tamil Nadu
 *    · Specialities ........ Natural, HD & South Indian Bridal looks
 *    · Availability ........ Travel available
 *
 *  ⚠ FIELDS MARKED `TODO(client)` ARE PLACEHOLDERS.
 *    They have NOT been invented from thin air — they are empty or generic on
 *    purpose. Fill them in with real details before going to production.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const siteSettings: SiteSettings = {
  brandName: "Lana's Makeover",
  artistName: "Lana",
  tagline: "Makeup · Hair · Bridal Artistry",

  // Verified from the Instagram bio.
  location: "Trichy, Tamil Nadu",
  serviceAreas: [
    "Trichy",
    "Tiruchirappalli",
    "Thanjavur",
    "Madurai",
    "Tamil Nadu",
    "Travel available",
  ],

  instagram: "https://www.instagram.com/lanasmakeover/",
  instagramHandle: "@lanasmakeover",

  // TODO(client): replace with the real business number in E.164 format.
  phone: "",
  whatsapp: "",
  // TODO(client): replace with the real business enquiry inbox.
  email: "",

  /**
   * TODO(client): Lana's own words belong here. The copy below is written
   * strictly from what the public profile states — discipline, base city,
   * speciality and travel availability — and makes no claim about years of
   * experience, awards, training or clientele.
   */
  biography: [
    "Lana is a bridal and party transformation makeup artist based in Trichy, Tamil Nadu.",
    "Her work moves between natural, HD and South Indian bridal looks — the register changes, the intention does not. Skin is treated as skin. Features are drawn out rather than drawn on. The bride is still recognisably herself at the end of the chair.",
    "She travels for weddings.",
  ],

  philosophy:
    "A bride should not meet a stranger in the mirror. Everything here is built around the face that is already there.",

  // Deliberately not a number of years — that has not been verified.
  experience: "Bridal & party transformation makeup · Natural, HD & South Indian bridal",

  bookingCta: "Check Your Date",

  /**
   * மல்லிகை — malligai, the jasmine. One word, rendered once per page beside
   * the mark in the footer. It is a signature, not a translation: the site is
   * in English and stays in English.
   *
   * TODO(client): confirm this is the word Lana wants, and that this spelling
   * is how she would write it. A misjudged word in someone's own script is
   * worse than no word at all.
   */
  signatureTamil: "மல்லிகை",

  /**
   * The hero's opening frame.
   *
   * Left empty on purpose: the poster resolves from Lana's portfolio through
   * slots.ts, so it fills itself the moment a featured bridal photograph is
   * imported. Set `poster` only to pin a specific frame.
   *
   * There is no video on this site, and no strand — by decision, not by
   * omission. See the Hero component and Task 2.4.
   */
  hero: {},

  /**
   * Master honesty switches.
   *  contentIsPlaceholder → shows the demo-content notice in /admin + footer.
   *  showPlaceholderBadges → tags placeholder imagery in the UI so nothing
   *  is ever mistaken for a real client photograph.
   */
  contentIsPlaceholder: true,
  showPlaceholderBadges: true,
};

/** Convenience: WhatsApp deep link, or null when no number is configured. */
export function whatsappLink(message?: string): string | null {
  const digits = siteSettings.whatsapp.replace(/[^\d]/g, "");
  if (!digits) return null;
  const text = message ?? `Hello ${siteSettings.brandName}, I'd like to check your availability.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/** Convenience: tel: link, or null when no number is configured. */
export function telLink(): string | null {
  const digits = siteSettings.phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
}

/**
 * Convenience: the enquiry message a bride arrives with when she continues on
 * WhatsApp. Built from what she already typed into the form — nothing invented.
 */
export function whatsappEnquiry(input: {
  date?: string;
  city?: string;
  weddingType?: string;
}): string {
  const date = input.date?.trim() || "my wedding date";
  const city = input.city?.trim() || "my city";
  const type = input.weddingType?.trim();
  return `Hi ${siteSettings.artistName}, I'd like to check your availability for ${date} in ${city}${
    type ? ` (${type})` : ""
  }.`;
}
