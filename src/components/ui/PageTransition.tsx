"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * ROUTE TRANSITION
 *
 * An ink curtain wiped across every single navigation, which is a lot of
 * ceremony for going from Portfolio to Services. It now does two different
 * things:
 *
 *   · FIRST navigation of a session — the curtain, once, with the wordmark.
 *     It reads as the site introducing its own architecture. Seen once, it is
 *     a signature; seen on every click, it is a toll.
 *   · EVERY navigation after — a plain fade-through of the page content.
 *
 * Deliberately a *reveal*, not a pre-load block: the new page is already
 * rendered underneath, so nobody ever waits on the animation. Skipped
 * entirely on first paint (the hero and the veil have the opening) and under
 * reduced motion.
 */
export default function PageTransition({ brand }: { brand: string }) {
  const pathname = usePathname();
  const first = useRef(true);
  const [curtain, setCurtain] = useState(false);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const content = document.querySelector<HTMLElement>(".page-content");

    let seen = true;
    try {
      seen = sessionStorage.getItem("lm:first-nav") === "1";
      if (!seen) sessionStorage.setItem("lm:first-nav", "1");
    } catch {
      // Private mode: treat it as seen. The fade is the safe default.
    }

    if (!seen) {
      const on = window.setTimeout(() => setCurtain(true), 0);
      const off = window.setTimeout(() => setCurtain(false), 60);
      return () => {
        window.clearTimeout(on);
        window.clearTimeout(off);
      };
    }

    // The fade-through. Written straight to the element: this is one property
    // on one node for a few hundred milliseconds, not a reason to re-render.
    if (!content) return;
    content.style.transition = "none";
    content.style.opacity = "0";
    // Next frame, or the browser coalesces both writes and nothing animates.
    const raf = requestAnimationFrame(() => {
      content.style.transition = "opacity var(--d-base) var(--ease-silk)";
      content.style.opacity = "1";
    });

    return () => {
      cancelAnimationFrame(raf);
      content.style.transition = "";
      content.style.opacity = "";
    };
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[75] flex items-center justify-center"
      style={{
        clipPath: curtain ? "inset(0 0 0 0)" : "inset(0 0 100% 0)",
        transition: curtain ? "none" : "clip-path var(--d-slow) var(--ease-veil)",
        backgroundColor: "var(--color-ink)",
        visibility: curtain ? "visible" : undefined,
      }}
    >
      <span
        className="font-display text-[0.8rem] uppercase tracking-[0.4em] text-champagne"
        style={{ opacity: curtain ? 1 : 0, transition: "opacity var(--d-base) ease" }}
      >
        {brand}
      </span>
    </div>
  );
}
