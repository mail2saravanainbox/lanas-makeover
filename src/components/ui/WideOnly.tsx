"use client";

import { useIsWide } from "@/lib/motion/useBreakpoint";

/**
 * Renders its children only where the wide layout is the one on screen.
 *
 * `hidden lg:block` lays a rendering out; it does not stop it existing. A
 * `display:none` container has no layout box to defer against, so the browser
 * fetches its lazy images anyway — six bridal photographs pulled down a phone
 * connection for a list nobody can see — and every control inside it stays in
 * the accessibility tree.
 *
 * Returns children while the answer is unknown (`null`, i.e. server render and
 * the first paint), so a visitor without JavaScript keeps both renderings and
 * CSS decides. One tick after hydration the loser unmounts, invisibly, because
 * it was never on screen. See useIsWide.
 */
export default function WideOnly({ children }: { children: React.ReactNode }) {
  return useIsWide() === false ? null : <>{children}</>;
}
