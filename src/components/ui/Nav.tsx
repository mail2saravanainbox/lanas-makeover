"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cx } from "@/lib/utils";
import { track } from "@/lib/analytics";
import MobileNav from "./MobileNav";
import BrandMark from "./BrandMark";
import SocialCtas from "./SocialCtas";
import WideOnly from "./WideOnly";
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
  // Four city pages exist and rank; the menu is where a bride looks for
  // "do you come to Madurai" before she looks anywhere else (§7).
  { href: "/locations", label: "Locations" },
  { href: "/about", label: "About" },
  { href: "/journal", label: "Journal" },
  { href: "/faq", label: "FAQ" },
];

/** The drawer's id, shared so `aria-controls` cannot point at nothing. */
export const MENU_ID = "mobile-menu";

export function navLinks(hasBrides: boolean): NavLink[] {
  if (!hasBrides) return BASE_LINKS;
  return [
    BASE_LINKS[0],
    { href: "/brides", label: "Brides" },
    ...BASE_LINKS.slice(1),
  ];
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
          "fixed inset-x-0 top-0 transition-[background-color,backdrop-filter,border-color] duration-[var(--d-slow)] ease-[cubic-bezier(0.16,1,0.3,1)]",
          // --z-header, and --z-header-over-drawer while the menu is open.
          // The toggle is ONE control that morphs, so it has to stay above the
          // curtain it opened; a second close button inside the drawer is a
          // second thing to find in the same corner.
          menuOpen ? "z-[70]" : "z-50",
          condensed && !menuOpen
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
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "link-wipe block whitespace-nowrap py-3 text-[0.72rem] font-medium uppercase tracking-[0.18em] transition-colors duration-[var(--d-base)] xl:text-[0.8rem] xl:tracking-[0.24em]",
                      active
                        ? "text-champagne"
                        : "text-ivory/70 hover:text-ivory",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-3">
            {/* ── THE TWO CHANNELS — DESKTOP ONLY (§5) ─────────────────
                They used to sit here at every width. At 390px that put four
                controls in one row — wordmark, WhatsApp, Instagram, menu —
                and at 320px the wordmark had 92px to live in. Worse, the
                WhatsApp icon here and the WhatsApp button in the sticky bar
                are the same control on screen at the same time.

                Below `lg` the sticky bar carries WhatsApp and the menu
                carries Instagram, each once. The mobile header is a wordmark
                and a way in, and nothing else.

                WideOnly rather than `hidden lg:flex`: hiding it leaves both
                anchors in the DOM and in the accessibility tree, so a screen
                reader on a phone still met a WhatsApp link in the header —
                the same control the sticky bar is already carrying. */}
            <WideOnly>
              <SocialCtas placement="nav" className="hidden lg:flex" />
            </WideOnly>

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

            {/* ── THE MENU TOGGLE (§6) ──────────────────────────────────
                It had two bars. Not clipped, not transformed away, not an
                opacity bug — the markup drew a top rule and a bottom rule and
                there was never a middle one, at 1px each inside an 18 × 9px
                box. On a 390px phone in daylight that is not a hamburger;
                it is two hairlines.

                Now: three bars, 2px, in a 22 × 16px box inside a 48 × 48
                target, and it morphs to a cross in 220ms rather than handing
                the closing to a second button in the same corner of the
                drawer. One control, one place, one accessible name that says
                which way it goes. */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls={MENU_ID}
              className="group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ivory/20 transition-colors duration-[var(--d-base)] hover:border-champagne/60 lg:hidden"
            >
              <span aria-hidden="true" className="relative block h-4 w-[22px]">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={cx(
                      "absolute left-0 block h-[2px] w-full rounded-full bg-ivory",
                      // 220ms, and the middle bar fades on its own curve so
                      // the two outer bars are already rotating as it goes.
                      "transition-[transform,opacity] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
                    )}
                    style={
                      menuOpen
                        ? [
                            { top: "7px", transform: "rotate(45deg)" },
                            {
                              top: "7px",
                              opacity: 0,
                              transform: "scaleX(0.4)",
                            },
                            { top: "7px", transform: "rotate(-45deg)" },
                          ][i]
                        : [{ top: 0 }, { top: "7px" }, { top: "14px" }][i]
                    }
                  />
                ))}
              </span>
            </button>
          </div>
        </nav>
      </header>

      <MobileNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        cta={cta}
        links={links}
        whatsapp={whatsapp}
      />
    </>
  );
}
