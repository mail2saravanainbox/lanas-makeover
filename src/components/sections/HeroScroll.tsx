"use client";

import { useEffect, useRef } from "react";
import { register } from "@/lib/motion/scheduler";

/**
 * Writes the hero's own passage — 0 at the top of it, 1 as it leaves — to
 * `--p` on the section, for CSS to read.
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

    return register(section as HTMLElement, ({ through }) => {
      (section as HTMLElement).style.setProperty("--p", through.toFixed(4));
    });
  }, []);

  return <span ref={anchor} hidden aria-hidden="true" />;
}
