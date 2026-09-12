/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  GIVE EVERY RENTAL PHOTOGRAPH A NAME AND A DESCRIPTION
 * ═══════════════════════════════════════════════════════════════════════════
 *  Reads the observations in scripts/rental-names.mjs and applies them:
 *
 *    1. renames the two files on disk  (full + -thumb)
 *    2. rewrites imageUrl / thumbnailUrl / alt in rental.json
 *    3. records the OLD paths in `legacyImageUrls`, which next.config.ts
 *       turns into permanent redirects
 *
 *  Idempotent: a set already carrying its descriptive name is skipped, and
 *  the legacy list is never appended to twice for the same pair.
 *
 *  ── WHY THE LEGACY LIST EXISTS ────────────────────────────────────────────
 *  /rental/temple-s1001.webp has been live and served. Anything Google has
 *  already fetched — and Google Images is a real front door for a bridal
 *  catalogue — points at the old path. Renaming without a redirect would
 *  404 every one of them and throw away whatever was indexed.
 *
 *  ── RUN ───────────────────────────────────────────────────────────────────
 *    node scripts/name-rental.mjs           # apply
 *    node scripts/name-rental.mjs --dry     # show what would change
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { readFileSync, writeFileSync, renameSync, existsSync } from "node:fs";
import { altFor, fileBaseFor } from "./rental-names.mjs";

const DRY = process.argv.includes("--dry");
const JSON_PATH = "./src/content/rental/rental.json";
const DIR = "./public/rental";

const raw = JSON.parse(readFileSync(JSON_PATH, "utf8"));
const legacy = new Map(
  (raw.legacyImageUrls ?? []).map((e) => [e.from, e.to]),
);

/** Ordinals restart per category+distinguisher so names stay short and stable. */
const seenBase = new Map();
let renamed = 0;
let altWritten = 0;
const missing = [];

for (const item of raw.items) {
  // ── alt ────────────────────────────────────────────────────────────────
  const alt = altFor(item.slug, item.category);
  if (alt) {
    item.alt = alt;
    altWritten++;
  } else {
    missing.push(item.slug);
  }

  // ── filename ───────────────────────────────────────────────────────────
  // Probe with ordinal 1 to learn the stem, then allocate the real ordinal.
  const stem = fileBaseFor(item.slug, item.category, 1).replace(/-01$/, "");
  const n = (seenBase.get(stem) ?? 0) + 1;
  seenBase.set(stem, n);

  const base =
    item.category === "worn" ? fileBaseFor(item.slug, item.category, n) : `${stem}-${String(n).padStart(2, "0")}`;

  const nextImage = `/rental/${base}.webp`;
  const nextThumb = `/rental/${base}-thumb.webp`;

  if (item.imageUrl === nextImage && item.thumbnailUrl === nextThumb) continue;

  for (const [fromUrl, toUrl] of [
    [item.imageUrl, nextImage],
    [item.thumbnailUrl, nextThumb],
  ]) {
    const fromFile = `${DIR}/${fromUrl.split("/").pop()}`;
    const toFile = `${DIR}/${toUrl.split("/").pop()}`;
    if (!existsSync(fromFile)) {
      console.error(`  missing on disk: ${fromFile}`);
      continue;
    }
    if (DRY) {
      console.log(`  ${fromUrl}\n    -> ${toUrl}`);
    } else {
      renameSync(fromFile, toFile);
    }
    // Only the ORIGINAL path is worth redirecting; a rename of a rename
    // rewrites the existing entry rather than chaining two hops.
    for (const [oldFrom, oldTo] of legacy) {
      if (oldTo === fromUrl) legacy.set(oldFrom, toUrl);
    }
    if (!legacy.has(fromUrl)) legacy.set(fromUrl, toUrl);
    renamed++;
  }

  item.imageUrl = nextImage;
  item.thumbnailUrl = nextThumb;
}

// A path must never redirect to itself.
for (const [from, to] of legacy) if (from === to) legacy.delete(from);

raw.legacyImageUrls = [...legacy]
  .map(([from, to]) => ({ from, to }))
  .sort((a, b) => a.from.localeCompare(b.from));

if (missing.length) {
  console.error(`\n  ${missing.length} set(s) have no observation: ${missing.join(", ")}\n`);
}

if (!DRY) {
  writeFileSync(JSON_PATH, JSON.stringify(raw, null, 2) + "\n");
}
console.log(
  `${DRY ? "[dry] " : ""}alt on ${altWritten}/${raw.items.length} sets · ${renamed} files renamed · ${raw.legacyImageUrls.length} redirects recorded`,
);
