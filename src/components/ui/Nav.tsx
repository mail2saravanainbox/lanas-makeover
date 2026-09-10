"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cx } from "@/lib/utils";
import { track } from "@/lib/analytics";
import MobileNav from "./MobileNav";
import BrandMark from "./BrandMark";
import SocialCtas from "./SocialCtas";
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
  // Jewellery rental is a second line of business, not a sub-page of the
  // makeup work — a bride looking to rent a haram will not find it under
  // "Services", and most of them arrive looking for exactly that.
  { href: "/rental-jewellery", label: "Jewellery" },
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
            className="group flex min-h-11 shrink-0 items-center gap-3 whitespace-nowrap font-display text-[0.85rem] uppercase leading-none tracking-[0.28em] text-ivory transition-colors duration-[var(--d-base)] hover:text-champagne sm:text-[1.05rem]"
          >
            <BrandMark className="shrink-0 text-champagne/70 transition-colors duration-[var(--d-base)] group-hover:text-champagne" />
            {brand}
          </Link>

          <ul className="hidden items-center gap-5 lg:flex xl:gap-8">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "link-wipe block whitespace-nowrap py-3 text-[0.72rem] font-medium uppercase tracking-[0.18em] transition-colors duration-[var(--d-base)] xl:text-[0.8rem] xl:tracking-[0.24em]",
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
            {/* ── THE TWO CHANNELS ─────────────────────────────────────
                Most of this site's traffic arrives from Instagram, on a
                phone, and most of what follows an enquiry happens on
                WhatsApp. Both are here at every width — a 44px icon each,
                names carried by aria-label so they do not compete with the
                booking CTA beside them.

                Shared with the footer so the two cannot drift. WhatsApp
                renders only when a real number is configured. */}
            <SocialCtas placement="nav" />

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
              className="btn !hidden whitespace-nowrap lg:!inline-flex lg:!px-5 lg:!py-3 lg:!text-[0.7rem] xl:!px-6 xl:!text-[0.75rem]"
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
