/**
 * Lana's Makeover — canonical content contracts.
 *
 * Every component in the app consumes these shapes and NOTHING else.
 * That is what makes the frontend CMS-swappable: replace the provider in
 * `src/lib/content/provider.ts`, keep every component untouched.
 */

export type MediaTone =
  | "ivory"
  | "champagne"
  | "bronze"
  | "ink"
  | "rose"
  | "olive"
  | "indigo";

/**
 * An image reference.
 *
 * `src` is intentionally optional. When it is absent the UI renders a
 * clearly-marked procedural placeholder plate instead of a photograph, so the
 * site never presents invented imagery as Lana's work. Dropping in real
 * photography is a one-line change: set `src`.
 */
export interface ImageRef {
  /** Public path or absolute URL. Leave undefined to render a placeholder. */
  src?: string;
  /** Required for accessibility. Describes the image, not the brand. */
  alt: string;
  width?: number;
  height?: number;
  /** Drives the placeholder plate palette + WebGL texture generation. */
  tone?: MediaTone;
  /** Deterministic seed for the placeholder composition. */
  seed?: number;
  /** Focal point for art-directed cropping, 0–1. */
  focus?: { x: number; y: number };
  /** Real blur-up placeholder, generated from the photograph itself. */
  blurDataURL?: string;
}

export type PortfolioCategory =
  /**
   * The house speciality. Kept distinct from generic "bridal" so the site can
   * lead with Tamil work without asserting that every bridal frame is Tamil —
   * a claim only Lana can make about her own photographs.
   */
  | "tamil-bridal"
  /**
   * The eight ordered frames of ONE bride's morning, filed as ritual-01- …
   * ritual-08-. Never mixed with any other category: a ritual frame that is
   * not the same woman breaks the only thing the section is doing.
   */
  | "ritual"
  | "muhurtham"
  | "jadai"
  | "bridal"
  | "reception"
  | "engagement"
  | "hair"
  | "editorial"
  | "before-after"
  | "behind-scenes"
  | "other";

export type MediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";

/** Normalised portfolio item — identical shape from local, CMS or Instagram. */
export interface PortfolioItem {
  id: string;
  slug: string;
  title: string;
  alt: string;
  caption?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  permalink?: string;
  /** ISO 8601. */
  timestamp?: string;
  mediaType: MediaType;
  category: PortfolioCategory;
  featured: boolean;
  /** Curation gate. Nothing reaches the public site until this is true. */
  published: boolean;
  /** Editorial layout weight — controls masonry span. */
  weight?: "tall" | "wide" | "full" | "standard";
  tone?: MediaTone;
  seed?: number;
  /** Intrinsic dimensions of the imported photograph. */
  width?: number;
  height?: number;
  /** Blur-up placeholder generated from the photograph itself. */
  blurDataURL?: string;
  /** Manual ordering within the gallery (§19). */
  sortOrder?: number;
  source: ContentSource;
  /** Optional genuine before/after pair. Never fabricated. */
  beforeAfter?: { before: ImageRef; after: ImageRef };
}

export interface BrideStory {
  slug: string;
  name: string;
  weddingType: string;
  location: string;
  look: string;
  /** Human-readable, e.g. "March 2025". */
  date: string;
  excerpt: string;
  story: string[];
  hero: ImageRef;
  gallery: ImageRef[];
  videoUrl?: string;
  services: string[];
  featured: boolean;
  published: boolean;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  cover: ImageRef;
  /** Lightweight markdown: #, ##, >, -, **bold**, *italic*, blank-line paras. */
  body: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  tags: string[];
  readingMinutes: number;
  seo?: {
    title?: string;
    description?: string;
    canonical?: string;
    ogImage?: string;
  };
  published: boolean;
}

export interface Service {
  slug: string;
  name: string;
  /** Short editorial label, e.g. "Muhurtham". */
  eyebrow: string;
  summary: string;
  description: string[];
  includes: string[];
  image: ImageRef;
  category: PortfolioCategory;
  order: number;
  published: boolean;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  weddingType?: string;
  location?: string;
  image?: ImageRef;
  /**
   * A permissioned screenshot of the message she actually sent — a WhatsApp
   * thread, an Instagram DM. To this audience that is far more credible than
   * typed text, because typed text is what a designer writes.
   * ⚠ Never publish one without the sender's explicit permission.
   */
  screenshot?: ImageRef;
  published: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order: number;
  published: boolean;
}

export interface TimelineEntry {
  time: string;
  title: string;
  note?: string;
}

export interface SiteSettings {
  brandName: string;
  artistName: string;
  tagline: string;
  location: string;
  serviceAreas: string[];
  instagram: string;
  instagramHandle: string;
  phone: string;
  whatsapp: string;
  email: string;
  biography: string[];
  philosophy: string;
  experience: string;
  bookingCta: string;
  /** One word of Tamil, rendered once per page. See site.ts. */
  signatureTamil: string;
  /**
   * The hero's opening frame. An OVERRIDE — normally left undefined, so it
   * resolves from the portfolio through slots.ts like every other photograph.
   */
  hero: { poster?: ImageRef };
  /** Marks demo copy so the UI can be honest about what is placeholder. */
  contentIsPlaceholder: boolean;
  showPlaceholderBadges: boolean;
}

export type ContentSource = "local" | "cms" | "instagram";

/**
 * The single interface the entire frontend talks to.
 * Local, CMS and Instagram providers all implement it.
 */
export interface ContentProvider {
  readonly source: ContentSource;
  getSiteSettings(): Promise<SiteSettings>;
  getPortfolio(options?: PortfolioQuery): Promise<PortfolioItem[]>;
  getPortfolioItem(slug: string): Promise<PortfolioItem | null>;
  getBrides(): Promise<BrideStory[]>;
  getBride(slug: string): Promise<BrideStory | null>;
  getPosts(): Promise<BlogPost[]>;
  getPost(slug: string): Promise<BlogPost | null>;
  getServices(): Promise<Service[]>;
  getService(slug: string): Promise<Service | null>;
  getTestimonials(): Promise<Testimonial[]>;
  getFaqs(): Promise<FAQItem[]>;
  getTimeline(): Promise<TimelineEntry[]>;
}

export interface PortfolioQuery {
  category?: PortfolioCategory | "all";
  featured?: boolean;
  limit?: number;
  offset?: number;
}

/** Result summary returned by POST /api/instagram/sync. */
export interface SyncSummary {
  imported: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  messages: string[];
  syncedAt: string;
}
