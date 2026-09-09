import type { SiteSettings } from "@/lib/types";
import portrait from "@/content/portrait.json";
import logo from "@/content/logo.json";

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

  /**
   * THE FOUR PRIMARY SERVICE LOCATIONS (§3).
   *
   * One business, four areas served — never four studios. Every surface that
   * lists cities reads `serviceCities` below, so this list is the single
   * place the set is defined; changing it changes the hero, the footer, the
   * FAQ, the booking form's city options and the LocalBusiness schema at once.
   *
   * Trichy remains `location` because that is the base stated on the public
   * profile. The other three are areas served, which is a different claim and
   * is worded as one throughout.
   */
  serviceAreas: ["Chennai", "Trichy", "Pudukkottai", "Madurai"],

  /**
   * The wider claim, kept deliberately conditional. "Across Tamil Nadu" is
   * only ever printed with this qualifier attached — travel is subject to
   * availability and terms, and neither has been supplied.
   *
   * TODO(client): confirm the radius, the terms, and whether travel outside
   * Tamil Nadu should be offered at all.
   */
  travelNote: "Travel available across Tamil Nadu, subject to availability and travel terms.",

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
     * Stand-in footage, same status as the photography: licensed stock, not
     * Lana's work. Encoded by scripts/encode-video.sh to the ladder below —
     * 24fps, no audio track, +faststart, 1920x1080.
     *
     *   AV1  421 KB · WebM 645 KB · H.264 1.3 MB
     *
     * The browser takes the first it can decode. HeroVideo will not fetch any
     * of them until the poster has painted and the main thread is idle, and
     * refuses entirely under reduced motion, Save-Data, or a connection the
     * browser reports as slower than 4g.
     *
     * No `portrait` encode: the source is a landscape close-up composed with
     * the bride left of centre, and a 9:16 crop cuts her face. HeroVideo falls
     * back to the landscape file on portrait viewports, which is correct here.
     */
    video: {
      landscape: {
        av1: "/video/hero-landscape.av1.mp4",
        webm: "/video/hero-landscape.webm",
        mp4: "/video/hero-landscape.mp4",
      },
    },
  },

  /**
   * ───────────────────────────────────────────────────────────────────────
   *  THE LOGO
   * ───────────────────────────────────────────────────────────────────────
   *  Lana's own artwork: the wordmark in script, drawn into a lipstick
   *  swatch, on black.
   *
   *  ⚠ IT CANNOT BE RECOLOURED, and it is not legible small. The lettering is
   *    painted into the swatch, so there is no ivory-on-dark variant without
   *    redrawing the logo — that is the designer's job, not a build script's.
   *    Measured at the sizes this site uses: unreadable at 34px, clean from
   *    about 80px up. It therefore appears where there is room for it (the
   *    footer, the share card) and NOT in the 34px-tall header, where the
   *    typographic wordmark stays because it can actually be read.
   *
   *  Rebuild from a new file with `npm run build:logo`.
   */
  logo: {
    src: logo.src,
    alt: "Lana's Makeover",
    width: logo.width,
    height: logo.height,
    blurDataURL: logo.blurDataURL,
  },

  /**
   * ───────────────────────────────────────────────────────────────────────
   *  THE ARTIST
   * ───────────────────────────────────────────────────────────────────────
   *  A real photograph of Lana, the founder of Lana's Makeover — not a bride,
   *  not a stand-in. This is the one image on the site that is unambiguously
   *  a person rather than a look, which is why it was never allowed to be
   *  filled from the bridal archive.
   *
   *  Its dimensions and blur placeholder come from `portrait.json`, written by
   *  `npm run import:portrait` from content/lana/. To replace the photograph,
   *  drop a new file in that folder and re-run it — nothing here changes.
   *
   *  `focus` keeps her FACE in frame when the image is cropped to a shape it
   *  was not composed for. The journal byline renders it as a 48px circle; on
   *  a 4:5 source, a centre crop would land on the necklace.
   */
  portrait: {
    src: portrait.src,
    alt: "Lana, founder of Lana's Makeover",
    width: portrait.width,
    height: portrait.height,
    blurDataURL: portrait.blurDataURL,
    focus: { x: 0.53, y: 0.26 },
  },

  /**
   * TODO(client): optional. A few seconds of jasmine being threaded into the
   * braid, shown in place of the still for state 05 of the hair sequence.
   * Same encode ladder as the hero. Absent by default — the still is complete.
   *
   *   hair: { clip: { mp4: "/video/hair-jasmine.mp4", webm: "…", av1: "…" } }
   */
  hair: {
    /**
     * Shown in place of the still for hair state 05, "Flowered" — a malligai
     * charam on folded Kanchipuram silk. The state's note reads "Jasmine,
     * measured in muzham. The clock starts here", and this is that: the
     * jasmine itself, measured, before it goes into the braid.
     *
     * Same encode ladder and the same restraint as the hero — preload="none",
     * loaded only once the panel is within a viewport, and never at all if the
     * visitor never reaches state 05.
     *
     *   AV1 460 KB · WebM 933 KB · H.264 1.5 MB
     */
    clip: {
      av1: "/video/hair-jasmine.av1.mp4",
      webm: "/video/hair-jasmine.webm",
      mp4: "/video/hair-jasmine.mp4",
    },
  },

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

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  LOCATION HELPERS (§3, §22)
 * ─────────────────────────────────────────────────────────────────────────────
 *  Every location string on the site is built here, from `serviceAreas`, so
 *  the four cities are stated once and read everywhere. Nothing keyword-stuffs:
 *  these produce a list, a sentence and a serial phrase, and pages pick the one
 *  that reads naturally in context.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** The four, in order. Chennai · Trichy · Pudukkottai · Madurai. */
export const serviceCities: readonly string[] = siteSettings.serviceAreas;

/** "Chennai · Trichy · Pudukkottai · Madurai" — the hero and footer register. */
export const citiesDotted = (): string => serviceCities.join(" · ");

/** "Chennai, Trichy, Pudukkottai and Madurai" — the prose register. */
export const citiesProse = (): string =>
  serviceCities.length < 2
    ? (serviceCities[0] ?? "")
    : `${serviceCities.slice(0, -1).join(", ")} and ${serviceCities[serviceCities.length - 1]}`;

/** "Chennai, Trichy, Pudukkottai & Madurai" — the metadata register. */
export const citiesAmp = (): string =>
  serviceCities.length < 2
    ? (serviceCities[0] ?? "")
    : `${serviceCities.slice(0, -1).join(", ")} & ${serviceCities[serviceCities.length - 1]}`;

/**
 * The one-line description of what the business is and where it works.
 * Used verbatim by the hero, the footer and the About page so the claim is
 * phrased identically wherever a bride meets it.
 */
export const positioningLine = (): string =>
  `Bridal makeup & hair artist serving ${citiesProse()}.`;
