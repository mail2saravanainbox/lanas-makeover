"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { NAV_LINKS } from "./Nav";
import { siteSettings } from "@/content/site";
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
  brand,
  cta,
}: {
  open: boolean;
  onClose: () => void;
  brand: string;
  cta: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop();
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusables?.length) return;
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
      document.body.style.overflow = "";
      window.__lenis?.start();
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      inert={!open ? true : undefined}
      className="fixed inset-0 z-[65] lg:hidden"
      style={{ pointerEvents: open ? "auto" : "none" }}
    >
      {/* Curtain */}
      <div
        className="absolute inset-0 bg-ink transition-[clip-path] duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
        style={{ clipPath: open ? "inset(0 0 0 0)" : "inset(0 0 100% 0)" }}
      />

      <div
        className="relative flex h-full flex-col transition-opacity duration-500"
        style={{ opacity: open ? 1 : 0, transitionDelay: open ? "260ms" : "0ms" }}
      >
        <div className="shell flex h-[var(--nav-h)] shrink-0 items-center justify-between">
          <span className="font-display text-[0.95rem] uppercase tracking-[0.28em] text-ivory">
            {brand}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/20 text-ivory transition-colors duration-500 hover:border-champagne/60"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
          </button>
        </div>

        <nav aria-label="Mobile" className="shell flex flex-1 flex-col justify-center">
          <ul className="space-y-1">
            {NAV_LINKS.map((link, i) => (
              <li key={link.href} className="line-mask">
                <span
                  className="block transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    transform: open ? "none" : "translate3d(0,105%,0)",
                    transitionDelay: open ? `${320 + i * 70}ms` : "0ms",
                  }}
                >
                  <Link
                    href={link.href}
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

        <div className="shell shrink-0 space-y-6 pb-10">
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
          <div className="flex items-center justify-between text-[0.62rem] uppercase tracking-[0.24em] text-muted">
            <a
              href={siteSettings.instagram}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("instagram_click", { placement: "mobile-nav" })}
              className="link-wipe"
            >
              {siteSettings.instagramHandle}
            </a>
            <span>{siteSettings.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
