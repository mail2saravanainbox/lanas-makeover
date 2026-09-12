#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  LANA'S MAKEOVER — RENTAL JEWELLERY IMPORT
 * ─────────────────────────────────────────────────────────────────────────────
 *      npm run import:rental
 *
 *  Drop approved jewellery photographs into `content/rental-incoming/`, named
 *  `<category>-<anything>.<ext>`, and run this. The category prefix must be one
 *  of the keys in src/content/rental-categories.ts:
 *
 *      temple-s1001.png   → Temple Jewellery
 *      ad-s2014.png       → American Diamond
 *      choker-s4003.png   → Choker & Necklace
 *      worn-s5002.png     → On the Bride
 *
 *  ── WHERE THE FIRST 133 CAME FROM ───────────────────────────────────────────
 *  Five supplier catalogue PDFs, one photograph per page. Every product frame
 *  carried an internal stock code — M201, AD07, C030 — set in bold white type,
 *  in an inconsistent corner. Those were found and painted out before the
 *  images reached this folder; the code that did it is documented in the
 *  session notes and is not part of the build, because it is a one-off on a
 *  fixed set of files rather than something to run again.
 *
 *  A stock code is a warehouse reference. It means nothing to a bride, and
 *  printing it invites her to ask for "M201" instead of describing what she
 *  wants — which is the opposite of the conversation this site is for.
 *
 *  ⚠ THREE FRAMES WERE NOT IMPORTED, and that is deliberate. Two carried
 *    another business's watermark across the image and one was a photograph of
 *    a shop display case, price tags and all. They are named in the session
 *    notes. Nothing that belongs to someone else is published here.
 *
 *  WHAT THIS DOES
 *   1. Reads every image in content/rental-incoming/
 *   2. Strips EXIF (camera, GPS, personal metadata)
 *   3. Writes an optimised WebP (max 1600px) + a 640px thumbnail
 *   4. Generates a real blurDataURL from the photograph itself
 *   5. PRESERVES any curation done on a previous run
 *   6. Writes src/content/rental/rental.json
 *
 *  Re-running is safe and idempotent.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";
import { altFor, fileBaseFor } from "./rental-names.mjs";

const ROOT = process.cwd();
const INCOMING = path.join(ROOT, "content", "rental-incoming");
const OUT_DIR = path.join(ROOT, "public", "rental");
const DATA_FILE = path.join(ROOT, "src", "content", "rental", "rental.json");

/**
 * Bounded on the LONG edge, not the width.
 *
 * These are portrait catalogue frames — a necklace on a stand, roughly 1:2.
 * Capping the width at 1600 does nothing to a 900×2000 image, so the whole set
 * kept its full height and came to forty megabytes. Fitting inside a
 * 1600×1400 box is what actually bounds them, and at the size these are
 * displayed — a column in a grid, or a lightbox on a phone — 1400 on the long
 * edge is already more than any screen will show.
 */
const MAX_WIDTH = 1600;
const MAX_HEIGHT = 1400;
const THUMB_WIDTH = 640;
const QUALITY = 80;

const EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff"]);
const KEYS = new Set(["temple", "ad", "choker", "worn"]);

/**
 * Alt text, per category.
 *
 * It describes what is in the photograph and nothing else. No stock code, no
 * price, no claim about the piece's material — "gold-toned" rather than
 * "gold", because these are rental sets and nobody has told us the metal.
 */
const ALT = {
  temple:
    "Antique gold-toned temple jewellery bridal set — long haram, short necklace and jhumka on a display stand",
  ad: "American diamond bridal jewellery set — white stone choker, haram and jhumka on a display stand",
  choker: "Stone-set bridal choker necklace with matching earrings on a display stand",
  worn: "A bride wearing a South Indian bridal jewellery set",
};

const TITLE = {
  temple: "Temple jewellery set",
  ad: "American diamond set",
  choker: "Choker and necklace set",
  worn: "Worn by the bride",
};

function keyFor(file) {
  const key = path.basename(file).split("-")[0].toLowerCase();
  return KEYS.has(key) ? key : null;
}

const slugify = (file) =>
  path
    .basename(file, path.extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });

  let prior = [];
  try {
    prior = JSON.parse(await fs.readFile(DATA_FILE, "utf8")).items ?? [];
  } catch {
    /* first run */
  }
  const byId = new Map(prior.map((i) => [i.id, i]));

  let files = [];
  try {
    files = (await fs.readdir(INCOMING)).filter((f) => EXT.has(path.extname(f).toLowerCase()));
  } catch {
    console.error(`No ${path.relative(ROOT, INCOMING)}/ — nothing to import.`);
    process.exit(0);
  }
  files.sort();

  const items = [];
  let skipped = 0;

  /** stem → how many sets have already claimed it. See fileBaseFor. */
  const ordinals = new Map();

  for (const [index, file] of files.entries()) {
    const key = keyFor(file);
    if (!key) {
      console.error(`  ✗ ${file} — prefix is not one of ${[...KEYS].join(", ")}`);
      skipped++;
      continue;
    }

    const slug = slugify(file);
    const id = `rental-${slug}`;

    /**
     * ── THE PUBLIC FILENAME IS NOT THE SUPPLIER'S CODE ────────────────────
     * `slug` stays the stock code, because it is the stable key that ties a
     * row to its source file in content/rental-incoming/. What gets written
     * to /public/rental is the DESCRIPTIVE name from rental-names.mjs, which
     * is the same table scripts/name-rental.mjs renames by.
     *
     * If these two ever disagreed, a re-import would silently restore 133
     * stock-code URLs and 133 duplicate alt strings — which is exactly the
     * state this was dug out of. They read one table so they cannot.
     *
     * The ordinal disambiguates sets that observe identically ("green
     * stones" describes nine American diamond sets). It is allocated in the
     * same order here as there: sorted source files, per category.
     */
    const stem = fileBaseFor(slug, key, 1).replace(/-01$/, "");
    const n = (ordinals.get(stem) ?? 0) + 1;
    ordinals.set(stem, n);
    const base = key === "worn" ? fileBaseFor(slug, key, n) : `${stem}-${String(n).padStart(2, "0")}`;

    try {
      const input = sharp(path.join(INCOMING, file), { failOn: "none" }).rotate();
      const fullName = `${base}.webp`;
      const full = await input
        .clone()
        .resize({
          width: MAX_WIDTH,
          height: MAX_HEIGHT,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: QUALITY })
        .toFile(path.join(OUT_DIR, fullName));

      const thumbName = `${base}-thumb.webp`;
      await input
        .clone()
        .resize({ width: THUMB_WIDTH, height: 900, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 74 })
        .toFile(path.join(OUT_DIR, thumbName));

      const blur = await input.clone().resize({ width: 20 }).webp({ quality: 40 }).toBuffer();

      const was = byId.get(id);
      items.push({
        id,
        slug,
        category: was?.category ?? key,
        title: was?.title ?? TITLE[key],
        alt: was?.alt ?? altFor(slug, key) ?? ALT[key],
        imageUrl: `/rental/${fullName}`,
        thumbnailUrl: `/rental/${thumbName}`,
        width: full.width,
        height: full.height,
        blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
        sortOrder: was?.sortOrder ?? index,
        published: was?.published ?? true,
      });
    } catch (error) {
      console.error(`  ✗ ${file} — ${error.message}`);
      skipped++;
    }
  }

  items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  await fs.writeFile(
    DATA_FILE,
    JSON.stringify({ generatedAt: new Date().toISOString(), items }, null, 2) + "\n",
  );

  const counts = items.reduce((a, i) => ({ ...a, [i.category]: (a[i.category] ?? 0) + 1 }), {});
  console.log(`\n  ${items.length} imported${skipped ? `, ${skipped} skipped` : ""}`);
  for (const [k, n] of Object.entries(counts)) console.log(`    ${k.padEnd(8)} ${n}`);
  console.log(`\n  → ${path.relative(ROOT, DATA_FILE)}`);
}

main();
