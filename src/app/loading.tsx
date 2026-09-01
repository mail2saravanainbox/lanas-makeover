/**
 * Route-level Suspense fallback (§34, §43).
 *
 * Deliberately almost nothing: a held wordmark on the ink ground, matching the
 * page transition curtain. A spinner would break the film.
 */
export default function Loading() {
  return (
    <div
      className="flex min-h-[70vh] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading</span>
      <span
        aria-hidden="true"
        className="font-display text-[0.8rem] uppercase tracking-[0.4em] text-champagne/70"
        style={{ animation: "breathe 2.4s ease-in-out infinite" }}
      >
        Lana&rsquo;s Makeover
      </span>
      <style>{`
        @keyframes breathe { 0%,100% { opacity: .35 } 50% { opacity: 1 } }
        @media (prefers-reduced-motion: reduce) {
          @keyframes breathe { 0%,100% { opacity: .8 } }
        }
      `}</style>
    </div>
  );
}
