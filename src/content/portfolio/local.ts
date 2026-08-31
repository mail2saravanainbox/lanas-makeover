import type { PortfolioItem, PortfolioCategory, MediaTone } from "@/lib/types";

/**
 * LOCAL PORTFOLIO DEMO DATA
 *
 * ⚠ These entries carry NO photographs. `imageUrl` is intentionally undefined,
 *   so the UI renders a clearly-labelled procedural placeholder plate instead
 *   of a stock photo. Nothing here is presented as Lana's client work.
 *
 * To publish real work you only ever touch this file (or switch
 * CONTENT_SOURCE to `cms` / `instagram` — the components do not change):
 *
 *   { ..., imageUrl: "/portfolio/muhurtham-01.jpg", thumbnailUrl: "..." }
 */

type Row = [
  slug: string,
  title: string,
  category: PortfolioCategory,
  weight: NonNullable<PortfolioItem["weight"]>,
  tone: MediaTone,
  featured: boolean,
];

const rows: Row[] = [
  ["muhurtham-gold", "Muhurtham · Gold", "bridal", "tall", "bronze", true],
  ["kanchipuram-red", "Kanchipuram Red", "bridal", "standard", "rose", false],
  ["temple-jewellery", "Temple Jewellery Study", "bridal", "wide", "champagne", true],
  ["jadai-detail", "Jadai · Detail", "hair", "tall", "ink", false],
  ["reception-noir", "Reception · Noir", "reception", "standard", "indigo", true],
  ["hd-finish", "HD Finish", "editorial", "standard", "ivory", false],
  ["jasmine-line", "Jasmine Line", "hair", "wide", "olive", false],
  ["engagement-soft", "Engagement · Soft", "engagement", "standard", "rose", false],
  ["natural-register", "The Natural Register", "editorial", "tall", "ivory", true],
  ["zari-light", "Zari Light", "bridal", "standard", "bronze", false],
  ["open-hair-evening", "Open Hair · Evening", "hair", "standard", "indigo", false],
  ["bridal-eye", "The Bridal Eye", "editorial", "tall", "ink", false],
  ["reception-champagne", "Reception · Champagne", "reception", "wide", "champagne", false],
  ["silk-and-skin", "Silk & Skin", "bridal", "full", "bronze", true],
  ["mehendi-morning", "Morning Preparation", "behind-scenes", "standard", "olive", false],
  ["the-brush", "The First Brushstroke", "behind-scenes", "standard", "ink", false],
  ["draping-study", "Draping Study", "bridal", "tall", "rose", false],
  ["engagement-evening", "Engagement · Evening", "engagement", "standard", "indigo", false],
  ["braid-architecture", "Braid Architecture", "hair", "tall", "ink", true],
  ["lip-study", "Lip Study", "editorial", "standard", "rose", false],
  ["gold-on-ivory", "Gold on Ivory", "bridal", "wide", "ivory", false],
  ["party-transformation", "Party Transformation", "other", "standard", "champagne", false],
  ["the-veil", "The Veil", "bridal", "tall", "ivory", false],
  ["final-look", "The Final Look", "bridal", "full", "bronze", true],
];

export const localPortfolio: PortfolioItem[] = rows.map(
  ([slug, title, category, weight, tone, featured], i) => ({
    id: `local-${slug}`,
    slug,
    title,
    alt: `${title} — placeholder plate. Replace with Lana's photograph.`,
    caption: undefined,
    imageUrl: undefined, // ← real photograph goes here
    thumbnailUrl: undefined,
    permalink: undefined,
    timestamp: undefined,
    mediaType: "IMAGE",
    category,
    featured,
    published: true,
    weight,
    tone,
    seed: 100 + i * 7,
    source: "local",
  }),
);
