"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cx } from "@/lib/utils";
import { track } from "@/lib/analytics";
import MobileNav from "./MobileNav";

export const NAV_LINKS = [
  { href: "/brides", label: "Brides" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/services", label: "Services" },
  { href: "/journal", label: "Journal" },
  { href: "/about", label: "About" },
] as const;

/**
 * Floating navigation.
 *
 * On the homepage it stays out of the way until the opening cinematic has been
 * passed — but it is revealed immediately on the first Tab press, so a keyboard
 * user is never trapped behind an animation. That is the whole trick.
 */
export default function Nav({ brand, cta }: { brand: string; cta: string }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [revealed, setRevealed] = useState(!isHome);
  const [condensed, setCondensed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Reset the reveal when the route changes, adjusting state during render
  // rather than in an effect — no cascading re-render, no flash of wrong state.
  const [wasHome, setWasHome] = useState(isHome);
  if (wasHome !== isHome) {
    setWasHome(isHome);
    setRevealed(!isHome);
  }

  useEffect(() => {
    const threshold = () => (isHome ? window.innerHeight * 0.62 : 40);

    const onScroll = () => {
      const y = window.scrollY;
      setCondensed(y > 40);
      if (y > threshold()) setRevealed(true);
      else if (isHome) setRevealed(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") setRevealed(true);
    };

    // Deferred a frame so the first paint is never a cascading re-render.
    const initial = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(initial);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, [isHome]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-ivory focus:px-5 focus:py-3 focus:text-xs focus:uppercase focus:tracking-[0.2em] focus:text-ink"
      >
        Skip to content
      </a>

      <header
        className={cx(
          "fixed inset-x-0 top-0 z-50 transition-[transform,opacity,background-color,backdrop-filter,border-color] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          revealed ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
          condensed
            ? "border-b border-ivory/10 bg-ink/70 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
        aria-hidden={!revealed}
      >
        <nav
          aria-label="Primary"
          className="shell flex h-[var(--nav-h)] items-center justify-between gap-6"
        >
          <Link
            href="/"
            className="font-display text-[0.95rem] uppercase leading-none tracking-[0.28em] text-ivory transition-colors duration-500 hover:text-champagne sm:text-[1.05rem]"
            tabIndex={revealed ? 0 : -1}
          >
            {brand}
          </Link>

          <ul className="hidden items-center gap-9 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    tabIndex={revealed ? 0 : -1}
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "link-wipe text-[0.68rem] font-medium uppercase tracking-[0.26em] transition-colors duration-500",
                      active ? "text-champagne" : "text-ivory/70 hover:text-ivory",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              tabIndex={revealed ? 0 : -1}
              onClick={() => track("booking_click", { placement: "nav" })}
              className="btn hidden !px-6 !py-3 !text-[0.62rem] sm:inline-flex"
            >
              {cta}
            </Link>

            <button
              type="button"
              tabIndex={revealed ? 0 : -1}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="group flex h-11 w-11 items-center justify-center rounded-full border border-ivory/20 transition-colors duration-500 hover:border-champagne/60 lg:hidden"
            >
              <span className="relative block h-[9px] w-[18px]">
                <span className="absolute left-0 top-0 h-px w-full bg-ivory transition-transform duration-500 group-hover:translate-y-[1px]" />
                <span className="absolute bottom-0 left-0 h-px w-full bg-ivory transition-transform duration-500 group-hover:-translate-y-[1px]" />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} brand={brand} cta={cta} />
    </>
  );
}
