"use client";

import { useEffect, useRef } from "react";
import { clamp } from "@/lib/utils";
import { register } from "@/lib/motion/scheduler";

/**
 * Writes the hero's own passage — 0 at the top of it, 1 as it leaves — to
 * `--p` on the section, for CSS to read, and drives the wipe into Act 01
 * across the last 30% of it.
 *
 * Renders nothing. It exists so Hero itself can stay a server component:
 * the hero is the most SEO- and LCP-critical markup on the site and has no
 * business shipping as a client bundle for the sake of one scroll value.
 */
export default function HeroScroll() {
  const anchor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = anchor.current?.closest("section");
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = section as HTMLElement;
    const target = document.querySelector<HTMLElement>("[data-wipe-target]");

    return register(el, ({ through }) => {
      el.style.setProperty("--p", through.toFixed(4));
      // The last 30% of the hero pulls the next scene in behind a soft
      // diagonal edge. 0 = Act 01 still covered, 1 = fully revealed.
      target?.style.setProperty("--wipe", clamp((through - 0.7) / 0.3).toFixed(4));
    });
  }, []);

  return <span ref={anchor} hidden aria-hidden="true" />;
}
