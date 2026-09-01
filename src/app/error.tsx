"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Route-level error boundary (§43) — error state with a real retry.
 *
 * `reset()` re-renders the segment without a full page load, so a transient
 * failure costs the visitor one click rather than the whole experience.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced in `vercel logs`. Swap for Sentry et al. when one is chosen.
    console.error("[route error]", error.digest ?? error.message);
  }, [error]);

  return (
    <section className="flex min-h-[80vh] items-center justify-center">
      <div className="shell max-w-xl text-center">
        <p className="eyebrow mb-8">Something interrupted</p>
        <h1 className="display-md text-balance text-ivory">
          This page didn&rsquo;t load
          <br />
          <span className="italic-serif text-champagne">the way it should.</span>
        </h1>
        <p className="body-lg mt-8">
          It is almost certainly temporary. Try again, or carry on to the work.
        </p>

        <div className="mt-11 flex flex-wrap justify-center gap-4">
          <button type="button" onClick={reset} className="btn">
            Try again
          </button>
          <Link href="/portfolio" className="btn btn-ghost">
            See the work
          </Link>
        </div>

        {error.digest && (
          <p className="mt-10 font-mono text-[0.6rem] tracking-widest text-muted">
            Reference {error.digest}
          </p>
        )}
      </div>
    </section>
  );
}
