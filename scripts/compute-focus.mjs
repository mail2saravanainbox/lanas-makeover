/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  FOCAL POINTS — keep the face in frame (§43)
 * ─────────────────────────────────────────────────────────────────────────────
 *  Every photograph in the archive is cropped by CSS into frames it was never
 *  composed for: a 3:4 portrait becomes a 16:9 service banner, a 48px circle,
 *  a 3:2 tile. With `object-position: center` the crop lands on the middle of
 *  the FILE, which on a standing portrait is somewhere around the waist — and
 *  the bride's face is cut off above the frame.
 *
 *  This writes a `focus` point per photograph so every one of those crops is
 *  taken around the face instead. It is stored in portfolio.json and threaded
 *  through to `object-position` by EditorialImage.
 *
 *  ── HOW THE POINT IS FOUND, AND WHY NOT THE OBVIOUS WAY ────────────────────
 *  sharp ships an `attention` strategy, and it was tried first. It is a
 *  saliency measure — edges and saturation — and on South Indian bridal
 *  photography it reliably picks the GOLD: the necklace, the zari border, the
 *  kanjeevaram. Measured across all 55 photographs it landed on jewellery or
 *  silk far more often than on a face.
 *
 *  So: skin tones instead. A pixel is skin if it passes both a coarse RGB test
 *  and a YCbCr chrominance test (the standard rule, widened a little for warm
 *  Indian wedding light). Isolated specks are discarded — foliage and warm
 *  backgrounds throw scattered false positives, faces do not — and the point
 *  is the centroid of the HIGHEST surviving skin pixels, which on a person is
 *  the forehead and cheeks rather than the hands.
 *
 *  It is a heuristic, and it is right about nine times in ten. That is why
 *  `focusOverrides` exists: anything it gets wrong is corrected by hand, once,
 *  and the correction survives re-running this script.
 *
 *  Run: npm run compute:focus  (re-runnable; safe to run after an import)
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const JSON_PATH = "src/content/portfolio/portfolio.json";

/**
 * HAND CORRECTIONS. Keyed by slug, values 0–1.
 * Anything listed here is used verbatim and the detector is not consulted.
 */
const focusOverrides = {
  // Read off a decile grid on each photograph. Every one of these is a frame
  // where the subject is small against a busy natural background, and the
  // detector settled on sunlit foliage or a warm wall instead of her face.
  "hair-01-open": { x: 0.47, y: 0.62 },
  "engagement-03-pink-saree": { x: 0.58, y: 0.43 },
  "engagement-04-flowers": { x: 0.54, y: 0.5 },
  "jadai-01-jasmine-gold": { x: 0.49, y: 0.42 },
  "jadai-02-garland": { x: 0.48, y: 0.38 },
  // Two faces, small in frame; the point sits between them.
  "reception-04-couple-tree": { x: 0.55, y: 0.71 },
};

/** Coarse RGB + YCbCr skin rule, widened for warm light. */
function isSkin(r, g, b) {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  if (!(r > 60 && g > 30 && b > 15 && mx - mn > 12 && r > g && g >= b - 8)) return false;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return cb >= 72 && cb <= 130 && cr >= 132 && cr <= 180;
}

const SAMPLE_W = 80;

async function facePoint(file) {
  const { data, info } = await sharp(file)
    .resize({ width: SAMPLE_W })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const W = info.width;
  const H = info.height;
  const ch = info.channels;

  const mask = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * ch;
      if (isSkin(data[i], data[i + 1], data[i + 2])) mask[y * W + x] = 1;
    }
  }

  /**
   * DENSITY FILTER. A face is a solid patch of skin; a sunlit leaf or a warm
   * wall throws isolated pixels. Requiring six skin neighbours in a 5×5
   * window removes the speckle without touching the patch — this is what
   * stopped the detector landing in the trees on the outdoor frames.
   */
  const solid = [];
  for (let y = 2; y < H - 2; y++) {
    for (let x = 2; x < W - 2; x++) {
      if (!mask[y * W + x]) continue;
      let n = 0;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) n += mask[(y + dy) * W + x + dx];
      if (n >= 10) solid.push({ x, y });
    }
  }
  if (solid.length < 10) return null;

  // The highest third of the skin — forehead and cheeks, not hands.
  solid.sort((a, b) => a.y - b.y);
  const head = solid.slice(0, Math.max(8, Math.round(solid.length * 0.3)));
  const fx = head.reduce((s, p) => s + p.x, 0) / head.length / W;
  const fy = head.reduce((s, p) => s + p.y, 0) / head.length / H;

  // Never pin the crop to the very edge; a face at 0.02 crops to nothing.
  const clamp = (v) => Math.min(0.92, Math.max(0.08, v));
  return { x: +clamp(fx).toFixed(3), y: +clamp(fy).toFixed(3) };
}

const doc = JSON.parse(await readFile(JSON_PATH, "utf8"));
let detected = 0;
let overridden = 0;
let skipped = 0;

for (const item of doc.items ?? []) {
  if (focusOverrides[item.slug]) {
    item.focus = focusOverrides[item.slug];
    overridden += 1;
    continue;
  }
  if (!item.imageUrl) {
    skipped += 1;
    continue;
  }
  const point = await facePoint(`public${item.imageUrl}`);
  if (point) {
    item.focus = point;
    detected += 1;
  } else {
    // No person found — a detail, a texture, a garland. Centre is correct.
    delete item.focus;
    skipped += 1;
  }
}

doc.focusComputedAt = new Date().toISOString();
await writeFile(JSON_PATH, `${JSON.stringify(doc, null, 2)}\n`);

console.log(`✓ focus points — ${detected} detected, ${overridden} overridden, ${skipped} left centred`);
