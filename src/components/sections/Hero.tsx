import Link from "next/link";
import MagneticCta from "@/components/ui/MagneticCta";
import type { HeroMedia, ImageRef } from "@/lib/types";
import HeroVideo from "@/components/ui/HeroVideo";
import HeroScroll from "./HeroScroll";
import { citiesDotted } from "@/content/site";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE HERO — one screen
 * ═══════════════════════════════════════════════════════════════════════════
 *  Replaces a 420vh scroll track that withheld the brand until 84% of the way
 *  through it. A visitor now learns whose site this is, what she does, where
 *  she is, and how to ask for a date — in the first frame, without scrolling.
 *
 *  A SERVER COMPONENT. The most SEO-critical markup on the site ships as HTML;
 *  the only client code here is the media loader and one scroll value.
 *
 *  Nothing moves but the frame itself: the media scales 6% and the scrim
 *  deepens across the hero's own height. No pinning, no scroll-jacking, and
 *  under reduced motion, no movement at all — `--p` is simply never written.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export default function Hero({
  brand,
  cta,
  poster,
  posterPortrait,
  video,
}: {
  brand: string;
  cta: string;
  poster: ImageRef;
  posterPortrait?: ImageRef | null;
  video?: HeroMedia["video"];
}) {
  return (
    <section
      aria-label="Introduction"
      data-hero=""
      className="relative isolate flex min-h-[100dvh] flex-col justify-end overflow-hidden"
      style={{ ["--p" as string]: 0 }}
    >
      <HeroScroll />

      {/* ── The frame ──────────────────────────────────────────────────────
          The wrapper does the positioning, and HeroVideo's own children carry
          only sizing. Putting `absolute` on EditorialImage via className is a
          coin-flip on Tailwind's emit order against PlaceholderPlate's own
          `relative` — which is exactly how this rendered 1280x0 once. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{ transform: "scale(calc(1 + var(--p) * 0.06))" }}
      >
        <HeroVideo poster={poster} posterPortrait={posterPortrait} video={video} />
      </div>

      {/* Bottom-heavy, so the type below sits on ink rather than on a face. */}
      <div
        aria-hidden="true"
        // Kept from the fix: the original values were tuned for a photograph
        // and turned a placeholder plate into a black rectangle.
        className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/70 via-ink/25 to-ink/85"
        style={{ opacity: "calc(1 + var(--p) * 0.4)" }}
      />

      {/* ── The identity, in frame one (§5) ─────────────────────────────────
          Five answers before a single scroll: what the business is, what she
          does, where she works, why it is different, and what to do next.

          The order is deliberate. The wordmark says whose site this is; the
          H1 says what it is FOR; the register line says what kind of work it
          is; the cities say whether she can even come; the italic line is the
          only line here that is voice rather than fact, and it earns its place
          precisely because everything around it is plain.

          Vertical budget on a phone: the pair of CTAs stacks, and the bottom
          padding drops to clear the sticky action bar rather than sitting
          behind it. ────────────────────────────────────────────────────── */}
      <div className="shell relative z-10 pb-[calc(11vh+var(--action-bar-h))] pt-[calc(var(--nav-h)+3rem)] sm:pb-[14vh] sm:pt-[calc(var(--nav-h)+4rem)]">
        {/* The name is already in the header on every screen, and on a phone
            the header, this line and the footer logo made three. Desktop keeps
            it: there it is the masthead of a full-height editorial frame. */}
        <p className="wordmark wordmark-mobile display-lg hidden uppercase leading-[0.95] text-ivory lg:block">
          {brand.replace(/'s/i, "’s")}
        </p>

        {/* The page's single H1: what this business is, not what it is called. */}
        <h1 className="display-sm mt-5 max-w-[20ch] font-display text-champagne sm:mt-6">
          Tamil Bridal Makeup &amp; Hair Artist
        </h1>

        {/* The register, then the reach. Two lines, hairline between them, so
            neither is mistaken for a slogan. */}
        <p className="eyebrow mt-5 !text-ivory/75">Natural · HD · South Indian Bridal</p>
        <p className="eyebrow mt-2.5 !text-champagne/70">{citiesDotted()}</p>

        <p className="italic-serif display-sm mt-7 hidden max-w-[24ch] text-balance text-champagne sm:mt-8 lg:block">
          Before she becomes a bride&hellip;
        </p>

        {/* Primary and secondary, in that order and never equal in weight.
            One filled, one ghost — the same pairing everywhere on the site. */}
        <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center sm:gap-4">
          <MagneticCta href="/contact" placement="hero" className="btn w-full sm:w-auto">
            {cta}
          </MagneticCta>
          {/* One button, one link. Two filled buttons stacked on a phone read
              as two equal choices; the work is a detour, not the ask. */}
          <Link
            href="/portfolio"
            data-cursor="view"
            className="tap link-wipe self-start text-[0.8rem] uppercase tracking-[0.22em] text-ivory/75 hover:text-ivory lg:hidden"
          >
            View the work &rarr;
          </Link>
          <Link
            href="/portfolio"
            data-cursor="view"
            className="btn btn-ghost hidden lg:inline-flex"
          >
            View the work
          </Link>
        </div>
      </div>

      {/* Scroll cue — the same 48px line device as before. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex"
        style={{ opacity: "max(0, calc(1 - var(--p) * 6))" }}
      >
        <span className="text-[0.75rem] uppercase tracking-[0.24em] text-muted">Scroll</span>
        <span className="relative block h-12 w-px overflow-hidden bg-ivory/15">
          <span className="absolute inset-x-0 top-0 h-4 animate-[scroll-cue_2.6s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-champagne" />
        </span>
      </div>

      <style>{`
        @keyframes scroll-cue {
          0%   { transform: translateY(-100%); }
          55%  { transform: translateY(300%); }
          100% { transform: translateY(300%); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes scroll-cue { 0%,100% { transform: translateY(100%); } }
        }
      `}</style>
    </section>
  );
}
