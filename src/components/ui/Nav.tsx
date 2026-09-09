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
  // "Work", not "Portfolio" (§32, §44). The same word the hero's secondary
  // CTA uses, so a visitor who read "View the work" recognises where it went.
  { href: "/portfolio", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/journal", label: "Journal" },
  { href: "/faq", label: "FAQ" },
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
  whatsapp = null,
}: {
  brand: string;
  cta: string;
  hasBrides?: boolean;
  /** Deep link, or null when no business number is configured. */
  whatsapp?: string | null;
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
            className="group flex min-h-11 items-center gap-3 font-display text-[0.85rem] uppercase leading-none tracking-[0.28em] text-ivory transition-colors duration-[var(--d-base)] hover:text-champagne sm:text-[1.05rem]"
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
            {/* §13 — WhatsApp as a first-class channel, not a footnote. Icon
                only: the label would compete with the one booking CTA beside
                it, and the accessible name carries the meaning. Rendered only
                when a real number exists. */}
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("whatsapp_click", { placement: "nav" })}
                aria-label="WhatsApp Lana"
                data-cursor="open"
                className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ivory/20 text-ivory/80 transition-colors duration-[var(--d-base)] hover:border-champagne/60 hover:text-champagne lg:flex"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.04 2A9.9 9.9 0 0 0 2.1 11.9c0 1.75.46 3.46 1.34 4.96L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01A9.9 9.9 0 0 0 22 11.94 9.9 9.9 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.2 8.2 0 0 1-1.26-4.36 8.24 8.24 0 1 1 8.25 8.23Zm4.52-6.16c-.25-.13-1.46-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.04-.39-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.19 3.7.59.26 1.04.41 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.46-.6 1.66-1.17.21-.58.21-1.07.15-1.17-.06-.11-.22-.17-.47-.29Z" />
                </svg>
              </a>
            )}

            {/* ── DESKTOP ONLY ─────────────────────────────────────────────
                Below `lg` the sticky action bar carries this exact link, and
                it carries it permanently rather than only at scroll 0. Kept
                here as well, a 390px header showed CHECK YOUR DATE three
                times in one frame — header, hero, bar — with the label
                wrapping onto two lines and squeezing the wordmark beside it.

                The CTA is not weakened on mobile by this; it is strengthened.
                It moves from a control that scrolls away to one that never
                does, and the header gets the room to read as a wordmark. */}
            <Link
              href="/contact"
              data-cursor="open"
              onClick={() => track("booking_click", { placement: "nav" })}
              // `!` throughout: .btn is declared outside a cascade layer in
              // globals.css, and unlayered rules beat Tailwind's layered
              // utilities — a plain `hidden` here does nothing at all.
              className="btn !hidden lg:!inline-flex lg:!px-6 lg:!py-3 lg:!text-[0.75rem]"
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
        whatsapp={whatsapp}
      />
    </>
  );
}
