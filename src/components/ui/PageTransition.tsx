"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Cinematic route transition — a single ink curtain that wipes away to reveal
 * the new page, with the wordmark held for a beat behind it.
 *
 * Deliberately a *reveal*, not a pre-load block: the new page is already
 * rendered underneath, so nobody ever waits on the animation. ~850ms total,
 * skipped on first paint (the hero has its own opening) and under reduced
 * motion.
 */
export default function PageTransition({ brand }: { brand: string }) {
  const pathname = usePathname();
  const first = useRef(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const on = window.setTimeout(() => setPlaying(true), 0);
    const off = window.setTimeout(() => setPlaying(false), 60);
    return () => {
      window.clearTimeout(on);
      window.clearTimeout(off);
    };
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[75] flex items-center justify-center"
      style={{
        clipPath: playing ? "inset(0 0 0 0)" : "inset(0 0 100% 0)",
        transition: playing
          ? "none"
          : "clip-path 850ms cubic-bezier(0.65, 0, 0.35, 1)",
        backgroundColor: "var(--color-ink)",
        visibility: playing ? "visible" : undefined,
      }}
    >
      <span
        className="font-display text-[0.8rem] uppercase tracking-[0.4em] text-champagne"
        style={{
          opacity: playing ? 1 : 0,
          transition: "opacity 420ms ease",
        }}
      >
        {brand}
      </span>
    </div>
  );
}
