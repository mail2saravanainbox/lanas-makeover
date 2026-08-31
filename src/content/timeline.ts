import type { TimelineEntry } from "@/lib/types";

/**
 * "HER MORNING" — the bridal-day timeline.
 *
 * ⚠ Illustrative, not a schedule. These are NOT Lana's stated call times and
 *   must not be read as a commitment. Every real morning is timed against the
 *   muhurtham, the venue and the number of people being made up.
 *
 * TODO(client): replace with the real shape of a Lana morning, or delete
 *   entries — the section renders whatever this array contains.
 */
export const timeline: TimelineEntry[] = [
  { time: "05:30", title: "The city is still asleep.", note: "The kit is laid out before anyone is awake." },
  { time: "06:00", title: "The ritual begins.", note: "Skin first. Always skin first." },
  { time: "07:00", title: "The first brushstroke." },
  { time: "08:00", title: "Jasmine meets her hair.", note: "The braid is built to hold weight for twelve hours." },
  { time: "08:30", title: "Gold meets silk." },
  { time: "09:00", title: "The final look." },
  { time: "09:05", title: "The bride." },
];
