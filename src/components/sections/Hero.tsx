import MagneticCta from "@/components/ui/MagneticCta";
import type { HeroMedia, ImageRef } from "@/lib/types";
import HeroVideo from "@/components/ui/HeroVideo";
import HeroScroll from "./HeroScroll";

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

      {/* ── The identity, in frame one ─────────────────────────────────── */}
      <div className="shell relative z-10 pb-[14vh] pt-[calc(var(--nav-h)+4rem)]">
        <p className="wordmark wordmark-mobile display-lg uppercase leading-[0.95] text-ivory">
          {brand.replace(/'s/i, "’s")}
        </p>

        {/* The page's single H1: what this business is, not what it is called. */}
        <h1 className="eyebrow mt-6 text-champagne/85">
          Tamil bridal makeup &amp; hair artist, Trichy
        </h1>

        <p className="italic-serif display-sm mt-8 max-w-[24ch] text-balance text-champagne">
          Before she becomes a bride&hellip;
        </p>

        <MagneticCta href="/contact" placement="hero" className="btn mt-9">
          {cta}
        </MagneticCta>
      </div>

      {/* Scroll cue — the same 48px line device as before. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
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
