"use client";

import type { FAQItem } from "@/lib/types";
import { track } from "@/lib/analytics";

/**
 * THE FAQ (§20)
 *
 * Fifteen questions is a long page flat, and a bride looking for one of them —
 * "do you travel", "how much advance" — should be able to see all fifteen
 * headings at once and open the one she came for.
 *
 * BUILT ON `<details>` AND `<summary>`, DELIBERATELY. The native disclosure
 * element is keyboard-operable, screen-reader-announced and correctly
 * `aria-expanded` without a line of ARIA, it works with JavaScript disabled,
 * and — the reason it beats a div-based accordion here — its content stays in
 * the DOM, so every answer is still indexed and still findable with the
 * browser's own find-in-page.
 *
 * The `toggle` event gives `faq_open` (§37) for free: which questions brides
 * actually open is the cheapest content research this site can do.
 */
export default function FaqList({
  items,
  showBadges,
}: {
  items: FAQItem[];
  showBadges: boolean;
}) {
  return (
    <div className="max-w-3xl divide-y divide-ivory/10 border-y border-ivory/10">
      {items.map((f) => (
        <details
          key={f.id}
          id={f.id}
          className="group"
          onToggle={(e) => {
            if ((e.currentTarget as HTMLDetailsElement).open) {
              track("faq_open", { id: f.id, question: f.question });
            }
          }}
        >
          <summary
            data-cursor="read"
            // list-none + the marker rule kills the default triangle in every
            // engine; the chevron below is ours and rotates with the state.
            className="flex cursor-pointer list-none items-start justify-between gap-6 py-7 text-ivory transition-colors duration-[var(--d-base)] hover:text-champagne [&::-webkit-details-marker]:hidden"
          >
            <h2 className="display-sm font-display">{f.question}</h2>
            <span
              aria-hidden="true"
              className="mt-2 shrink-0 text-champagne/70 transition-transform duration-[var(--d-base)] ease-[var(--ease-silk)] group-open:rotate-45"
            >
              <svg width="14" height="14" viewBox="0 0 14 14">
                <path d="M7 0v14M0 7h14" stroke="currentColor" strokeWidth="1" fill="none" />
              </svg>
            </span>
          </summary>

          <div className="body-base max-w-2xl pb-8 pr-10">
            {/* ⟨…⟩ marks an answer awaiting Lana's confirmation. */}
            {f.answer.split(/(⟨[^⟩]*⟩)/).map((part, j) =>
              part.startsWith("⟨") ? (
                showBadges ? (
                  <span
                    key={j}
                    className="ml-2 rounded-full border border-champagne/25 px-2 py-0.5 text-[0.75rem] uppercase tracking-[0.18em] text-champagne/70"
                  >
                    To confirm
                  </span>
                ) : null
              ) : (
                <span key={j}>{part}</span>
              ),
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
