"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  IS THIS THE WIDE LAYOUT?
 * ═══════════════════════════════════════════════════════════════════════════
 *  A `lg:hidden` / `hidden lg:block` pair is the right way to lay two
 *  renderings out, and the wrong way to STOP one of them running. The hidden
 *  half still mounts, still observes scroll, still holds timers — and, because
 *  a `display:none` container has no layout box to defer against, the browser
 *  fetches its lazy images anyway. The mobile ritual carousel arrived with the
 *  desktop scrub still alive underneath it: six photographs pulled down a
 *  phone connection to show one, and sixteen "Stage n" buttons in the
 *  accessibility tree where there should be eight.
 *
 *  ── WHY IT RETURNS null ───────────────────────────────────────────────────
 *  There is no viewport on the server. Returning a guess would either mismatch
 *  hydration or ship the wrong half to whoever has JavaScript off. `null`
 *  means "not known yet", and the caller renders BOTH — which is exactly the
 *  no-JS behaviour we want, with CSS deciding what is seen. One tick after
 *  hydration the answer arrives and the loser unmounts, invisibly, because it
 *  was never on screen in the first place.
 *
 *  Matches Tailwind's `lg` (64rem). Kept in sync by hand: there is one
 *  breakpoint in this codebase that splits a layout, and this is it.
 * ═══════════════════════════════════════════════════════════════════════════
 */
const LG = "(min-width: 64rem)";

/**
 * `useSyncExternalStore` rather than state-in-an-effect: a media query IS an
 * external store, React hydrates against `getServerSnapshot` and then re-reads,
 * and a viewport that changes mid-session is a subscription, not a one-off.
 */
export function useIsWide(): boolean | null {
  const subscribe = useCallback((onChange: () => void) => {
    // A phone turning sideways and a desktop window dragged narrow are the
    // same event as far as this is concerned.
    const q = window.matchMedia(LG);
    q.addEventListener("change", onChange);
    return () => q.removeEventListener("change", onChange);
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(LG).matches,
    () => null,
  );
}
