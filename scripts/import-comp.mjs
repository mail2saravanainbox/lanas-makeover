/**
 * COMP IMPORT — branch `comp` only.
 *
 * Takes whatever images are sitting in content/comp/ and runs them through the
 * real import pipeline, so a presentation build fills every slot on the site.
 *
 *   npm run comp:import
 *
 * This is the SAME pipeline the real site uses — same prefix rules, same WebP
 * and thumbnail generation, same blur placeholders — pointed at a different
 * folder. Nothing here is special-cased, which is the point: what the client
 * sees in the pitch is exactly how their own photographs will behave.
 *
 * ⚠ The images in content/comp/ are stand-ins. They are gitignored, they never
 *   enter the repository, and the fixed banner on every page says so. Do not
 *   copy them into content/incoming/, and do not alias this build to the
 *   production domain.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";

const DIR = "content/comp";

if (!existsSync(DIR)) {
  console.error(`No ${DIR}/ — nothing to import.`);
  process.exit(1);
}

const images = readdirSync(DIR).filter((f) => /\.(jpe?g|png|webp|avif|tiff?)$/i.test(f));

if (images.length === 0) {
  console.error(
    `No images in ${DIR}/.\n` +
      `Drop the presentation imagery there first — see ${DIR}/README.md for\n` +
      `which filename prefix lands in which slot.`,
  );
  process.exit(1);
}

console.log(`${images.length} image(s) in ${DIR}/ — running the import pipeline…\n`);

const result = spawnSync(process.execPath, ["scripts/import-portfolio.mjs"], {
  stdio: "inherit",
  env: { ...process.env, PORTFOLIO_INCOMING: DIR },
});

process.exit(result.status ?? 1);
