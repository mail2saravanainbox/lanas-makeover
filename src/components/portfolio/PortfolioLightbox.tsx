"use client";

import { useCallback, useEffect, useRef } from "react";
import type { PortfolioItem } from "@/lib/types";
import EditorialImage from "@/components/ui/EditorialImage";

/**
 * Cinematic detail view (§15).
 *
 * The image scales and un-blurs into place rather than popping; the frame
 * around it is deliberately empty so the work is the only thing in the room.
 *
 * Accessible dialog: labelled, focus-trapped, Escape closes, arrows navigate,
 * background scroll locked, focus returned on close.
 */
export default function PortfolioLightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: PortfolioItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = index !== null;
  const item = open ? items[index] : null;

  const go = useCallback(
    (delta: number) => {
      if (index === null || items.length === 0) return;
      onNavigate((index + delta + items.length) % items.length);
    },
    [index, items.length, onNavigate],
  );

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop();
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab") {
        const f = dialogRef.current?.querySelectorAll<HTMLElement>("button, a[href]");
        if (!f?.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.__lenis?.start();
      previous?.focus?.();
    };
  }, [open, onClose, go]);

  if (!open || !item) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-[80] flex items-center justify-center"
    >
      <button
        type="button"
        aria-label="Close image"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/95 backdrop-blur-xl"
        style={{ animation: "lb-veil 500ms ease both" }}
        tabIndex={-1}
      />

      <div
        className="relative z-10 flex h-full w-full max-w-6xl flex-col px-4 py-6 sm:px-8 sm:py-10"
        style={{ animation: "lb-in 750ms cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <div className="flex shrink-0 items-start justify-between gap-6">
          <div>
            <p className="eyebrow mb-2">{item.category.replace("-", " ")}</p>
            <h2 className="font-display text-2xl text-ivory sm:text-3xl">{item.title}</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ivory/25 text-ivory transition-colors duration-500 hover:border-champagne"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
          </button>
        </div>

        <div className="relative my-6 flex-1 overflow-hidden">
          <EditorialImage
            image={{
              src: item.imageUrl,
              alt: item.alt,
              tone: item.tone,
              seed: item.seed,
              blurDataURL: item.blurDataURL,
            }}
            className="h-full w-full"
            sizes="(max-width: 1024px) 96vw, 72vw"
            priority
          />
        </div>

        <div className="flex shrink-0 items-center justify-between gap-6">
          <div className="min-w-0">
            {item.caption && (
              <p className="body-base line-clamp-2 max-w-xl">{item.caption}</p>
            )}
            {item.permalink && (
              <a
                href={item.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="link-wipe mt-2 inline-block text-[0.75rem] uppercase tracking-[0.24em] text-muted hover:text-ivory"
              >
                View on Instagram
              </a>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="font-mono text-[0.75rem] tracking-[0.2em] text-muted">
              {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/25 text-ivory transition-colors duration-500 hover:border-champagne"
            >
              <svg width="16" height="10" viewBox="0 0 16 10" aria-hidden="true">
                <path d="M15 5H1m0 0l4-4M1 5l4 4" stroke="currentColor" fill="none" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/25 text-ivory transition-colors duration-500 hover:border-champagne"
            >
              <svg width="16" height="10" viewBox="0 0 16 10" aria-hidden="true">
                <path d="M1 5h14m0 0l-4-4m4 4l-4 4" stroke="currentColor" fill="none" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes lb-veil { from { opacity: 0 } to { opacity: 1 } }
        @keyframes lb-in {
          from { opacity: 0; transform: scale(0.94); filter: blur(16px); }
          to   { opacity: 1; transform: none; filter: blur(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes lb-in { from { opacity: 1 } to { opacity: 1 } }
        }
      `}</style>
    </div>
  );
}
