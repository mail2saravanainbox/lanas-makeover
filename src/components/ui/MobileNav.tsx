"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { MENU_ID, type NavLink } from "./Nav";
import { citiesDotted, siteSettings } from "@/content/site";
import { track } from "@/lib/analytics";

/**
 * Mobile navigation — a full-screen editorial menu, not a shrunken desktop bar.
 *
 * Focus is trapped, Escape closes, the background scroll is locked, and links
 * arrive on a stagger. Everything is real anchors and real buttons.
 */
export default function MobileNav({
  open,
  onClose,
  cta,
  links,
  whatsapp = null,
}: {
  open: boolean;
  onClose: () => void;
  /**
   * No `brand`. The drawer used to draw its own wordmark and its own close
   * button in a header row of its own; the real header now floats above the
   * curtain and carries both, so this had two of everything in one frame.
   */
  cta: string;
  links: NavLink[];
  /** Deep link, or null when no business number is configured. */
  whatsapp?: string | null;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    /**
     * Scroll lock that survives iOS. `overflow: hidden` on <body> alone does
     * not hold on iOS Safari — the page scrolls under the drawer anyway — so
     * the position is pinned and restored to the exact pixel on close (§61).
     */
    const y = window.scrollY;
    const { body } = document;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.width = "100%";
    window.__lenis?.stop();
    firstLinkRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      /**
       * The toggle sits in the header, outside this panel, and it is the
       * control that closes the drawer — so it has to be inside the trap or
       * a keyboard visitor is shut in with no way out but Escape.
       */
      const toggle = document.querySelector<HTMLElement>(
        `[aria-controls="${MENU_ID}"]`,
      );
      const inPanel = [
        ...(panelRef.current?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        ) ?? []),
      ];
      const focusables = toggle ? [toggle, ...inPanel] : inPanel;
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      window.scrollTo(0, y);
      // Lenis writes its own cached position back on start(); tell it where
      // the page actually is first, or it undoes the line above.
      window.__lenis?.scrollTo(y, { immediate: true, force: true });
      window.__lenis?.start();
      // Back to the toggle that opened it, which is now the same control
      // that closes it (§8).
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  return (
    <div
      ref={panelRef}
      id={MENU_ID}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      inert={!open ? true : undefined}
      className="fixed inset-0 z-[65] lg:hidden"
      style={{ pointerEvents: open ? "auto" : "none" }}
    >
      {/* Curtain */}
      <div
        className="absolute inset-0 bg-ink transition-[clip-path] duration-[var(--d-slow)] ease-[cubic-bezier(0.65,0,0.35,1)]"
        style={{ clipPath: open ? "inset(0 0 0 0)" : "inset(0 0 100% 0)" }}
      />

      <div
        className="relative flex h-full flex-col transition-opacity duration-[var(--d-base)]"
        style={{
          opacity: open ? 1 : 0,
          transitionDelay: open ? "260ms" : "0ms",
        }}
      >
        {/* No header row of its own. The real header is above this curtain
            and already carries the wordmark and the toggle — drawing a second
            wordmark and a second close control in the same corner was two of
            everything in one frame. */}
        <div className="h-[var(--nav-h)] shrink-0" aria-hidden="true" />

        {/* ── LANDSCAPE (§78) ─────────────────────────────────────────────
            At 844 × 390 the seven links, the two buttons and the handle come
            to 645px inside a 390px panel, and `justify-center` on a fixed-
            height flex column clips equally at both ends — the first link and
            the booking CTA were both off-screen with no way to reach either.

            `min-h-0` is the part that actually does it: a flex child will not
            shrink below its content without it, so `overflow-y-auto` on its
            own scrolls nothing. Centred while it fits, scrolled when it does
            not.

            `justify-center` is NOT how the centring is done, and that is the
            whole trick: on a scroll container it centres the overflow too, and
            the part that goes off the START edge cannot be scrolled back to —
            "Work" was unreachable at 390px tall. `margin-block: auto` on the
            list centres it while it fits and collapses to zero when it does
            not, which leaves every link reachable. */}
        <nav
          aria-label="Mobile"
          className="shell flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
        >
          <ul className="my-auto space-y-1 py-4">
            {links.map((link, i) => (
              <li key={link.href} className="line-mask">
                <span
                  className="block transition-transform duration-[var(--d-slow)] ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    transform: open ? "none" : "translate3d(0,105%,0)",
                    transitionDelay: open ? `${320 + i * 70}ms` : "0ms",
                  }}
                >
                  <Link
                    href={link.href}
                    ref={i === 0 ? firstLinkRef : undefined}
                    onClick={onClose}
                    className="display-md block py-2 text-ivory"
                  >
                    {link.label}
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        </nav>

        <div
          className="shell shrink-0 space-y-6 pb-10"
          style={{
            paddingBottom: "max(2.5rem, env(safe-area-inset-bottom, 0px))",
          }}
        >
          <Link
            href="/contact"
            onClick={() => {
              track("booking_click", { placement: "mobile-nav" });
              onClose();
            }}
            className="btn w-full"
          >
            {cta}
          </Link>

          {/* The third door, in the standard order and the standard words
              (§6, §44). Rendered only when a real number exists. */}
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                track("whatsapp_click", { placement: "mobile-nav" });
                onClose();
              }}
              className="btn btn-ghost w-full"
            >
              WhatsApp Lana
            </a>
          )}

          {/* Third tier (§7, §68). Instagram is not a conversion CTA and is
              not dressed as one — a text link under the two buttons.

              It was a `justify-between` row with the cities opposite. At 390px
              the city list wrapped to two lines and ran straight through the
              handle; at 320px it was unreadable. They are two separate facts
              and they stack. */}
          <div className="space-y-2 text-[0.75rem] uppercase tracking-[0.2em] text-muted">
            <a
              href={siteSettings.instagram}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                track("instagram_click", { placement: "mobile-nav" })
              }
              className="tap link-wipe inline-block"
            >
              {siteSettings.instagramHandle}
            </a>
            <p className="leading-relaxed">{citiesDotted()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
