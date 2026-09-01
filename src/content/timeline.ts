import type { TimelineEntry } from "@/lib/types";

/**
 * "HER MORNING" — the bridal-day timeline.
 *
 * ⚠ Deliberately NOT clock times. Lana has not confirmed her call times, so
 *   publishing "05:30" would be inventing a commitment. These are the beats of
 *   a Tamil bridal morning in the order they happen — true of the ritual,
 *   claiming nothing specific about her schedule.
 *
 *   If Lana confirms real timings, put them in `time` and they render as-is.
 *
 * TODO(client): replace with the real shape of a Lana morning, or delete
 *   entries — the section renders whatever this array contains.
 */
export const timeline: TimelineEntry[] = [
  {
    time: "Before sunrise",
    title: "The kit is laid out.",
    note: "Nothing is decided at six in the morning that was not decided the week before.",
  },
  {
    time: "The first brush",
    title: "Skin, and only skin.",
    note: "Cleanse, correct, protect. The base carries the entire day.",
  },
  {
    time: "The hair",
    title: "The jadai begins.",
    note: "Base tension, volume at the crown, anchor points set before the braid is closed.",
  },
  {
    time: "The flowers",
    title: "Jasmine enters the braid.",
    note: "Measured in muzham, not in stems — and from this moment there is a clock on it.",
  },
  {
    time: "The silk",
    title: "The saree is draped.",
    note: "Nine yards that has to fall correctly, and stay fallen, for twelve hours.",
  },
  {
    time: "The gold",
    title: "The jewellery is placed.",
    note: "Set last, because it changes the balance of everything set before it.",
  },
  {
    time: "The mirror",
    title: "She sees herself.",
  },
];
