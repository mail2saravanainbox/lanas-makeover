import type { PortfolioCategory } from "@/lib/types";

/**
 * Caption-based category *suggestion*.
 *
 * This is a hint, never a verdict — §14 requires that every automatic
 * classification stays editable. The sync route writes the suggestion into the
 * record and the curation layer (admin/CMS) can overwrite it.
 */
const RULES: Array<{ category: PortfolioCategory; patterns: RegExp[] }> = [
  {
    category: "before-after",
    patterns: [/\bbefore\s*(?:&|and|\/|-)?\s*after\b/i, /\btransformation\b/i, /\bswipe\b/i],
  },
  {
    category: "hair",
    patterns: [/\bhair(style|styling|do)?\b/i, /\bjadai\b/i, /\bbraid\b/i, /\bjasmine\b/i, /\bbun\b/i],
  },
  {
    category: "reception",
    patterns: [/\breception\b/i, /\bevening\s+look\b/i],
  },
  {
    category: "engagement",
    patterns: [/\bengagement\b/i, /\bnischayam\b/i, /\bbetrothal\b/i, /\bring\s+ceremony\b/i],
  },
  {
    category: "behind-scenes",
    patterns: [/\bbts\b/i, /\bbehind\s+the\s+scenes\b/i, /\bin\s+progress\b/i, /\bkit\b/i],
  },
  {
    category: "bridal",
    patterns: [/\bbrid(e|al)\b/i, /\bmuhur(t|th)am\b/i, /\bwedding\b/i, /\bkalyanam\b/i, /\bsaree\b/i],
  },
  {
    category: "editorial",
    patterns: [/\beditorial\b/i, /\bshoot\b/i, /\bportfolio\b/i, /\bhd\b/i],
  },
];

export function suggestCategory(caption?: string): PortfolioCategory {
  if (!caption) return "other";
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(caption))) return rule.category;
  }
  return "other";
}

/** Build a stable, readable slug from a caption, falling back to the media id. */
export function slugFromCaption(caption: string | undefined, id: string): string {
  const base = (caption ?? "")
    .split("\n")[0]
    .toLowerCase()
    .replace(/[#@][\w.]+/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .filter(Boolean)
    .slice(0, 6)
    .join("-");
  return base ? `${base}-${id.slice(-6)}` : `post-${id.slice(-10)}`;
}

/** First line of a caption, hashtags stripped, used as a display title. */
export function titleFromCaption(caption: string | undefined, fallback: string): string {
  const line = (caption ?? "")
    .split("\n")
    .map((l) => l.replace(/[#][\w.]+/g, "").trim())
    .find((l) => l.length > 2);
  if (!line) return fallback;
  return line.length > 70 ? `${line.slice(0, 67).trimEnd()}…` : line;
}
