"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * ROUTE TRANSITION
 *
 * A plain fade-through of the page content. The ink curtain that used to wipe
 * across navigations — and later, across the first navigation of a session —
 * is gone.
 *
 * Deliberately a *reveal*, not a pre-load block: the new page is already
 * rendered underneath, so nobody ever waits on it. Skipped on first paint and
 * under reduced motion.
 *
 * Written straight to the element rather than through state: one property on
 * one node for a few hundred milliseconds is not a reason to re-render a page.
 */
export default function PageTransition() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const content = document.querySelector<HTMLElement>(".page-content");
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

  return null;
}
