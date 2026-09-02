export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function clamp(v: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, v));
}

/** Map n from [a,b] to [0,1], clamped. */
export function norm(n: number, a: number, b: number): number {
  if (b === a) return 0;
  return clamp((n - a) / (b - a));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Frame-rate-independent damping — the reason motion here feels weighted. */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

/** Deterministic 0–1 pseudo-random from an integer seed. */
export function seeded(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * A numbered section eyebrow: `04 — The ritual`.
 *
 * The index is PASSED IN, never written into the component. Sections used to
 * carry their own hard-coded numbers, which is how the homepage ended up
 * running 01, 02, 04, 06, 07, 08, 08, 09, 10, 11, 12, 15 — two sections
 * claiming 08, and four numbers that belonged to sections since deleted.
 */
export function sectionEyebrow(index: number | undefined, label: string): string {
  // Undefined where the component is reused OFF the homepage — /about shows
  // testimonials too, and "09 —" there would be a number pointing at nothing.
  if (index === undefined) return label;
  return `${String(index).padStart(2, "0")} — ${label}`;
}
