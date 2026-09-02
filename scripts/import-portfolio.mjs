#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  LANA'S MAKEOVER — PORTFOLIO IMPORT PIPELINE
 * ─────────────────────────────────────────────────────────────────────────────
 *  Drop Lana's approved photographs into `content/incoming/`, run this, and the
 *  website uses them everywhere. Nothing else needs editing.
 *
 *      npm run import:portfolio
 *
 *  NAMING — the category is taken from the filename prefix:
 *
 *      bridal-01.jpg          → category: bridal
 *      muhurtham-veena.jpg    → category: bridal
 *      reception-03.png       → category: reception
 *      engagement-01.jpg      → category: engagement
 *      hair-jadai-02.jpg      → category: hair
 *      editorial-01.jpg       → category: editorial
 *      bts-kit.jpg            → category: behind-scenes
 *      beforeafter-01.jpg     → category: before-after
 *
 *  Anything unrecognised lands in `other` and can be re-categorised afterwards
 *  in the generated portfolio.json.
 *
 *  WHAT IT DOES
 *   1. Reads every image in content/incoming/
 *   2. Strips EXIF (removes camera, GPS and personal metadata)
 *   3. Writes an optimised WebP (max 2000px) + a 640px thumbnail
 *   4. Generates a real blurDataURL from the actual photograph
 *   5. Derives width/height, slug, title and alt text
 *   6. PRESERVES any curation you have already done on a re-run
 *   7. Writes src/content/portfolio/portfolio.json
 *
 *  Re-running is safe and idempotent.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const ROOT = process.cwd();
/**
 * The source folder. Overridable so the comp branch can point the SAME
 * pipeline at content/comp/ — a presentation must exercise the real code path,
 * or it is not showing the client anything true about how the site behaves.
 */
const INCOMING = path.join(ROOT, process.env.PORTFOLIO_INCOMING ?? path.join("content", "incoming"));
const OUT_DIR = path.join(ROOT, "public", "portfolio");
const DATA_FILE = path.join(ROOT, "src", "content", "portfolio", "portfolio.json");

const MAX_WIDTH = 2000;
const THUMB_WIDTH = 640;
const QUALITY = 82;

const EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff"]);

/** Filename prefix → portfolio category. Extend freely. */
const CATEGORY_RULES = [
  // The ordered ritual set comes FIRST, before any other rule can claim it.
  // ritual-05-jasmine.jpg must not be filed as `hair` by the jasmine rule.
  [/^ritual-0[1-8]/i, "ritual"],
  // Tamil-specific prefixes next — they are the house speciality.
  [/^(tamil|kanchipuram|thali|thaali|vanki|oddiyanam|kunjalam)/i, "tamil-bridal"],
  [/^(muhurtham|muhurtam|kalyanam|mandapam|oonjal)/i, "muhurtham"],
  [/^(jadai|kunjalam)/i, "jadai"],
  [/^(bridal|wedding|saree|jewel)/i, "bridal"],
  [/^(reception)/i, "reception"],
  [/^(engagement|nischayam|betrothal|ring)/i, "engagement"],
  [/^(hair|jadai|braid|bun|jasmine|hairstyle)/i, "hair"],
  [/^(editorial|shoot|portfolio|hd|natural)/i, "editorial"],
  [/^(bts|behind|atelier|kit|prep)/i, "behind-scenes"],
  [/^(beforeafter|before-after|transformation)/i, "before-after"],
  [/^(party|occasion|guest)/i, "other"],
];

/** Human-readable label for alt text and titles. */
const CATEGORY_LABEL = {
  ritual: "a stage of the bridal morning",
  "tamil-bridal": "Tamil bridal makeup and hair",
  muhurtham: "Tamil muhurtham bridal look",
  jadai: "traditional jadai and jasmine",
  bridal: "South Indian bridal makeup and hair",
  reception: "reception makeup",
  engagement: "engagement makeup",
  hair: "bridal hair styling",
  editorial: "editorial makeup",
  "behind-scenes": "behind the scenes",
  "before-after": "before and after transformation",
  other: "makeup artistry",
};

function categoryFor(basename) {
  for (const [pattern, category] of CATEGORY_RULES) {
    if (pattern.test(basename)) return category;
  }
  return "other";
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function titleFor(slug, category) {
  const words = slug
    .split("-")
    .filter((w) => w && !/^\d+$/.test(w))
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  if (words.length) return words.join(" ");
  // No descriptive filename — use a neutral look title, never an invented name.
  const fallback = {
    "tamil-bridal": "Tamil Bridal Look",
    muhurtham: "Muhurtham Look",
    jadai: "Jadai & Jasmine",
    bridal: "South Indian Bridal Look",
    reception: "Reception Look",
    engagement: "Engagement Look",
    hair: "Bridal Hair",
    editorial: "Editorial Look",
    "behind-scenes": "In the Chair",
    "before-after": "Before & After",
    other: "Featured Look",
  };
  return fallback[category] ?? "Featured Look";
}

/** Editorial layout weight, derived from the photograph's real aspect ratio. */
function weightFor(width, height) {
  const ratio = width / height;
  if (ratio > 1.7) return "full";
  if (ratio > 1.2) return "wide";
  if (ratio < 0.72) return "tall";
  return "standard";
}

async function readExisting() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

async function main() {
  console.log("\n  Lana's Makeover — portfolio import\n");

  let files;
  try {
    files = (await fs.readdir(INCOMING)).filter((f) => EXT.has(path.extname(f).toLowerCase()));
  } catch {
    await fs.mkdir(INCOMING, { recursive: true });
    files = [];
  }

  if (files.length === 0) {
    console.log(`  No images found in content/incoming/`);
    console.log(`  Drop Lana's approved photographs there and run this again.`);
    console.log(`  Naming: bridal-01.jpg, hair-02.jpg, reception-01.jpg …\n`);
    return;
  }

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });

  const existing = await readExisting();
  const byId = new Map(existing.map((i) => [i.id, i]));

  const items = [];
  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const [index, file] of files.sort().entries()) {
    const source = path.join(INCOMING, file);
    const slug = slugify(file);
    const id = `local-${slug}`;
    const category = categoryFor(file);

    try {
      const input = sharp(source, { failOn: "none" }).rotate(); // honour EXIF orientation, then drop it
      const meta = await input.metadata();

      const targetWidth = Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH);

      // Full-size optimised WebP. sharp drops metadata by default → EXIF/GPS gone.
      const fullName = `${slug}.webp`;
      const fullInfo = await input
        .clone()
        .resize({ width: targetWidth, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(path.join(OUT_DIR, fullName));

      // Thumbnail for grids and WebGL textures — never feed the GPU a 2000px file.
      const thumbName = `${slug}-thumb.webp`;
      await input
        .clone()
        .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
        .webp({ quality: 76 })
        .toFile(path.join(OUT_DIR, thumbName));

      // Real blur placeholder, generated from this photograph.
      const blurBuffer = await input
        .clone()
        .resize({ width: 20 })
        .webp({ quality: 40 })
        .toBuffer();
      const blurDataURL = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

      const prior = byId.get(id);
      const label = CATEGORY_LABEL[category] ?? CATEGORY_LABEL.other;

      const item = {
        id,
        slug,
        // Curation is preserved across re-runs.
        title: prior?.title ?? titleFor(slug, category),
        alt: prior?.alt ?? `Lana's Makeover — ${label}`,
        caption: prior?.caption,
        imageUrl: `/portfolio/${fullName}`,
        thumbnailUrl: `/portfolio/${thumbName}`,
        permalink: prior?.permalink,
        timestamp: prior?.timestamp,
        mediaType: "IMAGE",
        category: prior?.category ?? category,
        featured: prior?.featured ?? index < 6,
        published: prior?.published ?? true,
        weight: prior?.weight ?? weightFor(fullInfo.width, fullInfo.height),
        sortOrder: prior?.sortOrder ?? index,
        width: fullInfo.width,
        height: fullInfo.height,
        blurDataURL,
        source: "local",
      };

      items.push(item);
      if (prior) updated++;
      else created++;
      console.log(`  ✓ ${file}  →  ${category}  ${fullInfo.width}×${fullInfo.height}`);
    } catch (error) {
      failed++;
      console.error(`  ✗ ${file}  —  ${error.message}`);
    }
  }

  items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  await fs.writeFile(
    DATA_FILE,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), items }, null, 2)}\n`,
    "utf8",
  );

  console.log(`
  ──────────────────────────────────────────────
   Imported ${items.length}   new ${created}   updated ${updated}   failed ${failed}
   Written  src/content/portfolio/portfolio.json
   Images   public/portfolio/
  ──────────────────────────────────────────────

  The site now uses these photographs automatically.
  Edit portfolio.json to change title, alt, category,
  featured, published or sortOrder — re-running keeps
  every one of those edits.
`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
