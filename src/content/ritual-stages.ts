import type { ImageRef, MediaTone } from "@/lib/types";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE EIGHT STAGES OF A BRIDAL MORNING
 * ─────────────────────────────────────────────────────────────────────────────
 *  Face → Skin → Eyes → Hair → Jasmine → Gold → Silk → Bride.
 *
 *  Extracted from ActRitual so the desktop scroll-scrubbed version and the
 *  mobile carousel read from ONE array. They are two presentations of the same
 *  eight stages; the copy must never be able to drift between them.
 *
 *  ⚠ FIVE OF THESE NOTES RUN PAST 90 CHARACTERS (01, 02, 03, 06, 07). The
 *    mobile caption clamps to two lines rather than truncating the string, so
 *    nothing is lost to a screen reader — but they are flagged for a copy pass
 *    in MOBILE_AUDIT_REPORT.md. Written for a desktop column, read on a phone.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export interface Stage {
  index: string;
  name: string;
  note: string;
  tone: MediaTone;
  seed: number;
}

export const STAGES: Stage[] = [
  {
    index: "01",
    name: "The Face",
    note: "Before anything is added. This is where the look is actually decided — what is there, what is not, and what will be left alone.",
    tone: "ink",
    seed: 501,
  },
  {
    index: "02",
    name: "The Skin",
    note: "Cleanse, correct, protect. The half hour nobody photographs, and the one every finish depends on.",
    tone: "ivory",
    seed: 502,
  },
  {
    index: "03",
    name: "The Eyes",
    note: "Definition arrives. The brow, the lash line, the shape of the eye — drawn out rather than drawn on.",
    tone: "bronze",
    seed: 503,
  },
  {
    index: "04",
    name: "The Hair",
    note: "The jadai is built. Braid, volume, anchor points.",
    tone: "olive",
    seed: 504,
  },
  {
    index: "05",
    name: "The Jasmine",
    note: "Then the jasmine, measured in muzham, threaded down its length.",
    tone: "olive",
    seed: 505,
  },
  {
    index: "06",
    name: "The Gold",
    note: "Vanki, oddiyanam, temple work — set last, because it changes the balance of everything set before it.",
    tone: "champagne",
    seed: 506,
  },
  {
    index: "07",
    name: "The Silk",
    note: "Kanchipuram, draped to hold its own weight from the first ritual to the last photograph.",
    tone: "bronze",
    seed: 507,
  },
  {
    index: "08",
    name: "The Bride",
    note: "And then she is ready. Still, unmistakably, herself.",
    tone: "rose",
    seed: 508,
  },
];

export const PLATES: ImageRef[] = STAGES.map((s) => ({ alt: s.name, tone: s.tone, seed: s.seed }));
