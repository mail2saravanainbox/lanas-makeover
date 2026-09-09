"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE STICKY ACTION BAR (§13, §33) — mobile only
 * ═══════════════════════════════════════════════════════════════════════════
 *  Most of this site's traffic arrives from one place: Instagram, on a phone,
 *  in an in-app browser. That visitor should never have to find the menu to
 *  ask about a date. Two actions, always in reach, always the same two.
 *
 *  WHAT IT IS NOT. It is not a floating bubble, and it does not overlap the
 *  content it sits on: `--action-bar-h` is a real reserved band at the foot of
 *  the document (see globals.css), so the last line of every page clears it.
 *  A bar that hides the thing you are reading is a worse bar than none.
 *
 *  HONESTY. WhatsApp renders only when a real number is configured. With no
 *  number the bar is not half-empty — the booking CTA takes the full width,
 *  because a dead link is worse than one fewer option.
 *
 *  AND IT NEVER OFFERS THE PAGE YOU ARE ON. On /contact the booking CTA is a
 *  link to /contact: a control that looks like the primary action of the site
 *  and does nothing when pressed. It is dropped there. If that leaves nothing
 *  in the bar — no number configured either — the bar does not render at all,
 *  and `.page-content` stops reserving space for it (see globals.css).
 *
 *  ACCESSIBILITY. Two real controls, 52px tall against a 44px minimum, with
 *  their own accessible names, inside a labelled landmark. `safe-area-inset-
 *  bottom` keeps them clear of the iPhone home indicator; without it the
 *  bottom 34px of the bar is not tappable at all on modern iOS.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export default function MobileActionBar({
  cta,
  whatsapp,
}: {
  cta: string;
  /** Deep link, or null when no business number is configured. */
  whatsapp: string | null;
}) {
  const pathname = usePathname();

  // The enquiry lives at /contact; offering a link to it from /contact is a
  // button that does nothing.
  const showBooking = pathname !== "/contact";

  if (!showBooking && !whatsapp) return null;

  return (
    <nav
      aria-label="Quick actions"
      data-action-bar=""
      // lg:hidden — the desktop header already carries both of these, and a
      // bar pinned across a 27-inch display would be a phone habit on a Mac.
      className="fixed inset-x-0 bottom-0 z-[58] lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-stretch gap-2 border-t border-ivory/12 bg-ink/92 px-3 py-2.5 backdrop-blur-xl">
        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { placement: "action-bar" })}
            className="flex min-h-[52px] flex-1 items-center justify-center gap-2.5 rounded-full border border-ivory/20 px-4 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-ivory transition-colors duration-[var(--d-base)] active:border-champagne/60 active:text-champagne"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.04 2A9.9 9.9 0 0 0 2.1 11.9c0 1.75.46 3.46 1.34 4.96L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01A9.9 9.9 0 0 0 22 11.94 9.9 9.9 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.2 8.2 0 0 1-1.26-4.36 8.24 8.24 0 1 1 8.25 8.23Zm4.52-6.16c-.25-.13-1.46-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.04-.39-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.19 3.7.59.26 1.04.41 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.46-.6 1.66-1.17.21-.58.21-1.07.15-1.17-.06-.11-.22-.17-.47-.29Z" />
            </svg>
            WhatsApp Lana
          </a>
        )}

        {showBooking && (
          <Link
            href="/contact"
            onClick={() => track("booking_click", { placement: "action-bar" })}
            className="flex min-h-[52px] flex-[1.15] items-center justify-center rounded-full bg-ivory px-4 text-center text-[0.72rem] font-medium uppercase tracking-[0.2em] text-ink transition-colors duration-[var(--d-base)] active:bg-champagne"
          >
            {cta}
          </Link>
        )}
      </div>
    </nav>
  );
}
