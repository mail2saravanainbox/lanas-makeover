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
   * ───────────────────────────────────────────────────────────────────────
   *  THE HERO
   * ───────────────────────────────────────────────────────────────────────
   *  `poster` / `posterPortrait` are left undefined on purpose: the poster
   *  resolves from Lana's portfolio through slots.ts, so it fills itself the
   *  moment a featured bridal photograph is imported. Set them only to pin a
   *  specific frame.
   *
   *  TODO(client): `video` stays undefined until Lana supplies footage. The
   *  hero is complete without it — poster, or placeholder plate.
   *
   *  When it exists, drop the files in /public/video and set:
   *
   *    video: {
   *      landscape: {
   *        av1:  "/video/hero-landscape.av1.mp4",
   *        webm: "/video/hero-landscape.webm",
   *        mp4:  "/video/hero-landscape.mp4",
   *      },
   *      portrait: { ...same three, hero-portrait.* },
   *    }
   *
   *  ENCODE LADDER — scripts/encode-video.sh reproduces this exactly.
   *    · 24 fps, no audio track at all (-an). It is muted by policy; shipping
   *      an audio stream is bytes nobody will ever hear.
   *    · landscape 1920x1080, portrait 1080x1920.
   *    · H.264  CRF 23, +faststart (moov atom first, so it starts on the
   *             first bytes rather than the last)
   *    · VP9    CRF 31
   *    · AV1    CRF 35
   *    · 8 seconds or under. It loops; nobody watches it twice.
   * ───────────────────────────────────────────────────────────────────────
   */
  hero: {
    /**
     * TODO(client): the jasmine strand, if it is ever shot.
     *
     * Task 2.4 built the procedural mesh to specification — one rank of five
     * to seven lanceolate petals, a tube below, transmission 0.25, blooms
     * packed every 0.09 curve units — rendered it at the hero's camera, and
     * REJECTED IT. It read as a beige stick carrying three star shapes and two
     * cones. Nothing about it said malligai, and a charam is white, not warm.
     *
     * The whole WebGL layer went with it. It existed to carry a 420vh opening
     * that no longer exists, and over a photographic hero it would have been
     * 239 KB gzipped of decoration in front of the LCP element.
     *
     * If the strand is wanted, it is footage, not geometry: shoot a real
     * charam at 120fps against black, key it, and export
     *   strand-alpha.webm  (VP9 + alpha)
     *   strand-alpha.mov   (HEVC + alpha, for Safari)
     * then set:  strand: { webm: "/video/strand-alpha.webm", mov: "…mov" }
     * With no asset, no strand renders. That is the current state.
     */
  },

  /**
   * TODO(client): optional. A few seconds of jasmine being threaded into the
   * braid, shown in place of the still for state 05 of the hair sequence.
   * Same encode ladder as the hero. Absent by default — the still is complete.
   *
   *   hair: { clip: { mp4: "/video/hair-jasmine.mp4", webm: "…", av1: "…" } }
   */
  hair: {},

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
