"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cx } from "@/lib/utils";
import { track } from "@/lib/analytics";
import MobileNav from "./MobileNav";
import JasmineMark from "./JasmineMark";
import { onScrollY } from "@/lib/motion/scheduler";

export interface NavLink {
  href: string;
  label: string;
}

/**
 * The primary links, in reading order.
 *
 * "Brides" is not here: the route renders nothing until real bride stories
 * exist, and a nav link to an empty page is a promise the site cannot keep.
 * `navLinks(hasBrides)` inserts it after Portfolio once there is something
 * behind it.
 */
const BASE_LINKS: NavLink[] = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/services", label: "Services" },
  { href: "/journal", label: "Journal" },
  { href: "/about", label: "About" },
];

export function navLinks(hasBrides: boolean): NavLink[] {
  if (!hasBrides) return BASE_LINKS;
  return [BASE_LINKS[0], { href: "/brides", label: "Brides" }, ...BASE_LINKS.slice(1)];
}

/**
 * Primary navigation.
 *
 * Always rendered, always focusable, never aria-hidden. The brand and the one
 * booking CTA are in frame one on every route including the homepage — a
 * visitor should never have to scroll to learn whose site this is or how to
 * ask for a date. The header only earns a background once the page moves.
 */
export default function Nav({
  brand,
  cta,
  hasBrides = false,
}: {
  brand: string;
  cta: string;
  hasBrides?: boolean;
}) {
  const pathname = usePathname();
  const [condensed, setCondensed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const links = navLinks(hasBrides);

  useEffect(
    () =>
      onScrollY((y) => {
        const next = y > 40;
        setCondensed((prev) => (prev === next ? prev : next));
      }),
    [],
  );

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
          "fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-[var(--d-slow)] ease-[cubic-bezier(0.16,1,0.3,1)]",
          condensed
            ? "border-b border-ivory/10 bg-ink/70 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav
          aria-label="Primary"
          className="shell flex h-[var(--nav-h)] items-center justify-between gap-3 sm:gap-6"
        >
          <Link
            href="/"
            className="group flex items-center gap-3 font-display text-[0.85rem] uppercase leading-none tracking-[0.28em] text-ivory transition-colors duration-[var(--d-base)] hover:text-champagne sm:text-[1.05rem]"
          >
            <JasmineMark className="h-5 w-5 shrink-0 text-champagne/70 transition-colors duration-[var(--d-base)] group-hover:text-champagne" />
            {brand}
          </Link>

          <ul className="hidden items-center gap-9 lg:flex">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "link-wipe block py-3 text-[0.8rem] font-medium uppercase tracking-[0.26em] transition-colors duration-[var(--d-base)]",
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
              onClick={() => track("booking_click", { placement: "nav" })}
              className="btn inline-flex !px-4 !py-2.5 !text-[0.75rem] sm:!px-6 sm:!py-3"
            >
              {cta}
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ivory/20 transition-colors duration-[var(--d-base)] hover:border-champagne/60 lg:hidden"
            >
              <span className="relative block h-[9px] w-[18px]">
                <span className="absolute left-0 top-0 h-px w-full bg-ivory transition-transform duration-[var(--d-base)] group-hover:translate-y-[1px]" />
                <span className="absolute bottom-0 left-0 h-px w-full bg-ivory transition-transform duration-[var(--d-base)] group-hover:-translate-y-[1px]" />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <MobileNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        brand={brand}
        cta={cta}
        links={links}
      />
    </>
  );
}
