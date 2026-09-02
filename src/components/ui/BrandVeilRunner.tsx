"use client";

import { useEffect } from "react";

/** Hard ceiling. Whatever is still pending at this point, the veil goes. */
const CEILING = 1200;
/** The wipe itself. */
const WIPE = 900;

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

    const line = el.querySelector<HTMLElement>(".lm-veil__line");
    const mark = el.querySelector<HTMLElement>(".lm-veil__mark");
    let done = false;

    const settled = { n: 0 };
    const total = 2;
    const advance = () => {
      settled.n += 1;
      if (line) line.style.transform = `scaleX(${(settled.n / total).toFixed(3)})`;
    };

    // Something is happening, and it is real: the line starts where the work
    // starts, not at a number chosen to look busy.
    if (line) line.style.transform = "scaleX(0.08)";

    function finish() {
      if (done) return;
      done = true;

      try {
        sessionStorage.setItem("lm:veil", "1");
      } catch {
        /* private mode — the veil simply shows again next time */
      }

      // The mark flies to where the nav's mark already is, so the brand
      // arrives in its final position rather than dissolving.
      const navMark = document.querySelector<SVGElement>("header a svg");
      if (mark && navMark) {
        const from = mark.getBoundingClientRect();
        const to = navMark.getBoundingClientRect();
        const scale = to.width / from.width;
        mark.style.transition = `transform var(--d-base) var(--ease-silk)`;
        mark.style.transform =
          `translate(${(to.left + to.width / 2 - (from.left + from.width / 2)).toFixed(1)}px,` +
          ` ${(to.top + to.height / 2 - (from.top + from.height / 2)).toFixed(1)}px)` +
          ` scale(${scale.toFixed(3)})`;
      }

      el.setAttribute("data-veil", "out");
      window.setTimeout(() => {
        document.documentElement.classList.remove("lm-veiled");
      }, WIPE);
    }

    // Any deliberate input beats the animation. Nobody waits for a curtain
    // they have already decided to walk through.
    const skip = () => finish();
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });

    const ceiling = window.setTimeout(finish, CEILING);

    void Promise.all([
      document.fonts.ready.then(advance, advance),
      heroReady().then(advance, advance),
    ]).then(() => {
      // A beat on a full progress line, so it reads as complete rather than
      // as having been interrupted.
      window.setTimeout(finish, 120);
    });

    return () => {
      window.clearTimeout(ceiling);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, []);

  return null;
}
