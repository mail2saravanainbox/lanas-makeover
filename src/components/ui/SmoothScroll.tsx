"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { invalidate } from "@/lib/motion/scheduler";

/**
 * Lenis, on its own.
 *
 * GSAP and ScrollTrigger used to live here purely as a ticker and a
 * re-measurement bus — 3.15.0 of animation library for two function calls.
 * The scheduler measures on demand, and Lenis has a `raf` of its own, so both
 * are gone.
 *
 * Deliberately gentle: `lerp` is high enough to feel weighted but the wheel is
 * never hijacked, `syncTouch` is off so native mobile scrolling stays native,
 * and the whole thing is skipped entirely under prefers-reduced-motion.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      lerp: 0.09,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      // Native touch scrolling — no scroll-jacking on mobile.
      syncTouch: false,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // Expose for anchor links / "back to top" without a context provider.
    window.__lenis = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Images and fonts landing change every section's height.
    window.addEventListener("load", invalidate);
    const t = window.setTimeout(invalidate, 350);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("load", invalidate);
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  // Reset scroll position and re-measure on every route change.
  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    const t = window.setTimeout(invalidate, 260);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return null;
}
