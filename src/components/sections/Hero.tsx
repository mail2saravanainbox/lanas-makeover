import Link from "next/link";
import type { ImageRef } from "@/lib/types";
import EditorialImage from "@/components/ui/EditorialImage";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE HERO — one screen
 * ═══════════════════════════════════════════════════════════════════════════
 *  Replaces a 420vh scroll track that withheld the brand until 84% of the way
 *  through it. A visitor now learns whose site this is, what she does, where
 *  she is, and how to ask for a date — in the first frame, without scrolling.
 *
 *  A SERVER COMPONENT, and now a completely static one: a photograph, a
 *  scrim, four lines of type and a link. No video, no scroll transform, no
 *  client JavaScript of its own at all.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export default function Hero({
  brand,
  cta,
  poster,
}: {
  brand: string;
  cta: string;
  poster: ImageRef;
}) {
  return (
    <section
      aria-label="Introduction"
      data-hero=""
      className="relative isolate flex min-h-[100dvh] flex-col justify-end overflow-hidden"
    >
      {/* ── The frame ──────────────────────────────────────────────────── */}
      <EditorialImage
        image={poster}
        className="absolute inset-0 -z-10 h-full w-full"
        sizes="100vw"
        priority
        decorative
      />

      {/* Bottom-heavy, so the type below sits on ink rather than on a face. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-ink via-ink/20 to-ink/60"
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

        <Link href="/contact" className="btn mt-9">
          {cta}
        </Link>
      </div>

      {/* Scroll cue — the same 48px line device as before. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
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
