import sharp from "sharp";
import { mkdirSync } from "node:fs";

/**
 * Generates public/masks/noise-512.png — the luminance mask the ritual's
 * frame-to-frame dissolve slides across.
 *
 * Value-noise with three octaves rather than white noise: a dissolve needs
 * CLUMPS, at a few different scales, or it reads as television static instead
 * of a photograph resolving. Committed to the repo so the build never depends
 * on running this.
 *
 *   node scripts/make-noise-mask.mjs
 */
const SIZE = 512;

/** Deterministic hash → the file is byte-identical on every machine. */
function hash(x, y, seed) {
  let h = x * 374761393 + y * 668265263 + seed * 2147483647;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}

const smooth = (t) => t * t * (3 - 2 * t);

function octave(px, py, cells, seed) {
  const gx = (px / SIZE) * cells;
  const gy = (py / SIZE) * cells;
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const fx = smooth(gx - x0);
  const fy = smooth(gy - y0);
  // Wrap, so the mask tiles seamlessly when it slides past the edge.
  const w = (n) => ((n % cells) + cells) % cells;
  const a = hash(w(x0), w(y0), seed);
  const b = hash(w(x0 + 1), w(y0), seed);
  const c = hash(w(x0), w(y0 + 1), seed);
  const d = hash(w(x0 + 1), w(y0 + 1), seed);
  return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
}

// Raw field first, then normalise. Summed octaves cluster around the middle,
// and a mask that never reaches black or white dissolves through a permanent
// haze instead of resolving.
const field = new Float32Array(SIZE * SIZE);
let lo = Infinity;
let hi = -Infinity;
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const v =
      octave(x, y, 8, 1) * 0.55 + octave(x, y, 24, 2) * 0.3 + octave(x, y, 64, 3) * 0.15;
    field[y * SIZE + x] = v;
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
}

const data = Buffer.alloc(SIZE * SIZE);
const span = hi - lo || 1;
for (let i = 0; i < field.length; i++) {
  data[i] = Math.round(((field[i] - lo) / span) * 255);
}

const OUT = "public/masks/noise-512.png";
mkdirSync("public/masks", { recursive: true });
await sharp(data, { raw: { width: SIZE, height: SIZE, channels: 1 } })
  // 16 grey levels. A dissolve thresholds this mask against a moving
  // ramp — it never displays it — so banding is invisible, and 16 levels is
  // 52 KB where 32 is 143 KB.
  .png({ compressionLevel: 9, palette: true, colours: 16, effort: 10 })
  .toFile(OUT);

console.log(OUT, "written");
