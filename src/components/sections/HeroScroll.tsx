"use client";

import { useEffect, useRef } from "react";
import { clamp } from "@/lib/utils";
import { register } from "@/lib/motion/scheduler";

/**
 * Writes the hero's own passage — 0 at the top of it, 1 as it leaves — to
 * `--p` on the section, for CSS to read, and drives the diagonal wipe on
 * whichever section declares `data-wipe-target` as that section enters.
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

    /**
     * THE WIPE IS ANCHORED TO THE SECTION IT REVEALS, NOT TO THE HERO.
     *
     * It used to be driven by the hero's own passage, on the assumption that
     * Act 01 was always the next thing on the page. The proof section now
     * runs directly after the hero (§7), which left the wipe finishing several
     * screens before the section it wipes ever appeared — a dead effect that
     * still cost a property write on every frame of the hero.
     *
     * Registering on the target itself means the reveal happens as that
     * section actually enters, wherever it is ordered. Two registrations
     * instead of one; the scheduler batches both into the same rAF.
     */
    const target = document.querySelector<HTMLElement>("[data-wipe-target]");
    const stopWipe = target
      ? register(target, ({ through }) => {
          // Fully revealed by the time it is a third of the way up the screen.
          target.style.setProperty("--wipe", clamp(through / 0.45).toFixed(4));
        })
      : undefined;

    const stopHero = register(el, ({ through }) => {
      el.style.setProperty("--p", through.toFixed(4));
    });

    return () => {
      stopHero();
      stopWipe?.();
    };
  }, []);

  return <span ref={anchor} hidden aria-hidden="true" />;
}
