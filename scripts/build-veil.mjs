/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE VEIL'S SILK
 * ─────────────────────────────────────────────────────────────────────────────
 *  Builds the loading veil's background from a real photograph of silk, plus a
 *  20px blur of it inlined as a data URI.
 *
 *  ── WHY A PHOTOGRAPH, AFTER ALL ───────────────────────────────────────────
 *  The first version drew the silk in CSS gradients, to keep the loading
 *  screen off the network. It was honest engineering and it looked like
 *  corduroy: gradients repeat, and silk does not. Procedural fabric was tried
 *  next — SVG feTurbulence lit with diffuse and specular passes — and got as
 *  far as convincing folds with unconvincing colour. Real woven silk with
 *  zari is a photograph or it is nothing.
 *
 *  ── AND WHY IT STILL DOES NOT COST A FRAME ────────────────────────────────
 *  The veil's whole job is to cover the page WHILE it loads, so it must never
 *  itself be a thing being waited for. Two outputs solve that:
 *
 *    · veil-silk.webp   the real photograph, ~1600px, quality 72
 *    · veil-blur.txt    a 20px version as a base64 data URI, inlined straight
 *                       into the CSS — so the first painted frame is already
 *                       red silk, at zero network cost, and the photograph
 *                       resolves on top of it whenever it arrives.
 *
 *  On a slow connection the visitor sees the blur and never an empty box. On a
 *  fast one they never see the blur at all.
 *
 *  Run: npm run build:veil
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";

/**
 * ── THE COLOUR IS REMAPPED, NOT BRIGHTENED ────────────────────────────────
 * The source frame is a dark, moody crimson; the reference this is matched
 * against is a bright scarlet. Simply raising brightness does not get there —
 * half the frame is unlit background, so exposure alone turns it muddy brown
 * (tried, compared, rejected).
 *
 * So the photograph is used for its STRUCTURE and its colour is rebuilt: the
 * frame is reduced to luminance, its local contrast lifted so the folds read,
 * and every tone mapped through a ramp sampled from the reference silk. The
 * result is real fabric geometry in a colour we control exactly.
 */
const RAMP = [
  [0.0, [96, 14, 10]],
  [0.22, [176, 30, 18]],
  [0.45, [222, 58, 28]],
  [0.66, [246, 104, 46]],
  [0.84, [255, 160, 100]],
  [1.0, [255, 232, 200]],
];

/** The ramp as a 256-entry lookup table. */
function buildLut() {
  const out = new Uint8Array(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let a = RAMP[0];
    let b = RAMP[RAMP.length - 1];
    for (let k = 0; k < RAMP.length - 1; k++) {
      if (t >= RAMP[k][0] && t <= RAMP[k + 1][0]) {
        a = RAMP[k];
        b = RAMP[k + 1];
        break;
      }
    }
    const f = b[0] === a[0] ? 0 : (t - a[0]) / (b[0] - a[0]);
    for (let c = 0; c < 3; c++) {
      out[i * 3 + c] = Math.round(a[1][c] + (b[1][c] - a[1][c]) * f);
    }
  }
  return out;
}

/** Luminance → ramp. Returns a sharp pipeline of the recoloured silk. */
async function recolour(input, width) {
  const lut = buildLut();
  const { data, info } = await sharp(input)
    .resize({ width, kernel: "lanczos3" })
    .greyscale()
    // Local contrast, so the folds survive the flattening to luminance.
    .clahe({ width: 80, height: 80, maxSlope: 3 })
    .normalise()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const px = info.width * info.height;
  const out = Buffer.alloc(px * 3);
  for (let i = 0; i < px; i++) {
    const v = data[i * info.channels];
    out[i * 3] = lut[v * 3];
    out[i * 3 + 1] = lut[v * 3 + 1];
    out[i * 3 + 2] = lut[v * 3 + 2];
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 3 } });
}

/**
 * The source frame and the region taken from it.
 *
 * `ritual-06-gold` is a bride beneath a red veil; this box is the fabric to
 * the right of her, which is silk and gold bokeh and nothing else. A veil that
 * is a photograph of a FACE would compete with the wordmark laid over it, and
 * would put a stand-in bride on the first frame of the site.
 */
const SOURCE = "public/portfolio/ritual-06-gold.webp";
/**
 * Height stops at 880, not 1100. Below that line the bride's mehendi hand
 * enters the frame — invisible on a desktop crop, but a portrait viewport
 * shows the full height and put a hand in the corner of the opening.
 */
const REGION = { left: 1150, top: 0, width: 850, height: 880 };

const OUT_IMG = "public/veil/veil-silk.webp";
const OUT_BLUR = "src/content/veil-blur.json";

await mkdir("public/veil", { recursive: true });

const cropped = await sharp(SOURCE).extract(REGION).png().toBuffer();

// Recoloured once, at full size. A whisker of blur reads as depth of field
// rather than as an upscale, which is what a veil wants anyway.
const recoloured = await (await recolour(cropped, 1600)).blur(0.5).png().toBuffer();

const full = await sharp(recoloured).webp({ quality: 72 }).toFile(OUT_IMG);

/**
 * The inline placeholder is a downscale of the FINISHED asset, not a second
 * pass over the source — so the first painted frame is genuinely the same
 * silk, in the same colour, as the photograph that replaces it. (Recolouring
 * the source again at 20px also fails outright: the local-contrast window is
 * larger than the image.)
 */
const blur = await sharp(recoloured).resize({ width: 20 }).webp({ quality: 40 }).toBuffer();

const dataUri = `data:image/webp;base64,${blur.toString("base64")}`;

await writeFile(
  OUT_BLUR,
  `${JSON.stringify(
    {
      _comment: "Generated by scripts/build-veil.mjs. Do not edit by hand.",
      generatedAt: new Date().toISOString(),
      src: `/${OUT_IMG.replace(/^public\//, "")}`,
      blurDataURL: dataUri,
    },
    null,
    2,
  )}\n`,
);

console.log(`✓ ${OUT_IMG}  ${full.width}×${full.height}  ${(full.size / 1024).toFixed(0)} KB`);
console.log(`✓ ${OUT_BLUR}  inline blur ${(dataUri.length / 1024).toFixed(1)} KB`);
