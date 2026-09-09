"use client";

import { useEffect } from "react";

/**
 * Hard ceiling. Whatever is still pending at this point, the veil goes.
 * Raised from 1,200ms to sit above the floor below — a ceiling under a floor
 * is not a ceiling.
 */
const CEILING = 1700;

/**
 * A FLOOR, which this deliberately did not have before.
 *
 * The silk takes 420ms to fall (see `veil-drape`) and then has to be SEEN.
 * On a warm cache the fonts and the hero can both be ready inside 300ms, and
 * the veil would lift while the fabric was still falling — a drape cut in half
 * reads as a glitch rather than as an opening.
 *
 * Measured off the reference: it falls for ~0.3s, is held for ~1.5s, and is
 * gone by 1.9s. This is that hold.
 *
 * This is the one honest use of a minimum here: it is not pretending the page
 * is still loading, it is letting a deliberate 520ms gesture finish. It costs
 * every first-time visitor a fraction of a second, once per session, and the
 * ceiling above is unchanged — nothing waits longer because of it.
 */
const FLOOR = 1400;

/**
 * The lift. Faster than the fall by design and faster than it used to be:
 * in the reference the silk is gone within about a tenth of a second once it
 * starts moving. A slow exit makes the visitor wait twice.
 */
const WIPE = 520;

/** Resolves when the hero's own image has decoded, or immediately if there isn't one. */
function heroReady(): Promise<void> {
  const img = document.querySelector<HTMLImageElement>(
    'section[aria-label="Introduction"] img',
  );
  // No photograph yet — the hero is a placeholder plate, which is inline SVG
  // and has nothing to decode. Nothing to wait for, and nothing to pretend.
  if (!img) return Promise.resolve();

  if (img.complete) return img.decode().catch(() => undefined);
  return new Promise<void>((resolve) => {
    img.addEventListener("load", () => resolve(), { once: true });
    img.addEventListener("error", () => resolve(), { once: true });
  });
}

export default function BrandVeilRunner() {
  useEffect(() => {
    // Only run when the guard actually decided to show it.
    if (!document.documentElement.classList.contains("lm-veiled")) return;
    const found = document.getElementById("lm-veil");
    if (!found) return;
    const el: HTMLElement = found;

    let done = false;

    /**
     * Nothing to advance any more — the veil carries no progress line and no
     * mark since it became bare silk. The readiness promises below are still
     * what decides WHEN it lifts; they simply have nothing to draw.
     */

    const startedAt = performance.now();
    let floorTimer = 0;

    /**
     * `force` is the escape hatch for deliberate input. The floor exists to
     * protect an animation, and no animation outranks someone who has already
     * decided to walk through it.
     */
    function finish(force = false) {
      if (done) return;

      const elapsed = performance.now() - startedAt;
      if (!force && elapsed < FLOOR) {
        window.clearTimeout(floorTimer);
        floorTimer = window.setTimeout(() => finish(), FLOOR - elapsed);
        return;
      }

      done = true;

      try {
        sessionStorage.setItem("lm:veil", "1");
      } catch {
        /* private mode — the veil simply shows again next time */
      }

      el.setAttribute("data-veil", "out");
      window.setTimeout(() => {
        document.documentElement.classList.remove("lm-veiled");
      }, WIPE);
    }

    // Any deliberate input beats the animation, floor included. Nobody waits
    // for a curtain they have already decided to walk through.
    const skip = () => finish(true);
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });

    const ceiling = window.setTimeout(() => finish(), CEILING);

    void Promise.all([
      document.fonts.ready.catch(() => undefined),
      heroReady().catch(() => undefined),
    ]).then(() => finish());

    return () => {
      window.clearTimeout(ceiling);
      window.clearTimeout(floorTimer);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, []);

  return null;
}
