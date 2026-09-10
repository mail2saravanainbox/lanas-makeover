"use client";

import { useId } from "react";
import { siteSettings } from "@/content/site";
import { waLink } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";
import { cx } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  WHATSAPP AND INSTAGRAM, AS CONTROLS
 * ═══════════════════════════════════════════════════════════════════════════
 *  Most of this site's traffic arrives from Instagram, on a phone, and most of
 *  the conversation that follows an enquiry happens on WhatsApp. Both were
 *  reachable before — one icon in the desktop header, a text handle in the
 *  footer — but neither read as something to press.
 *
 *  One component so the header and the footer cannot drift apart: the same two
 *  channels, the same order, the same accessible names, the same analytics
 *  placements. Only the dressing changes.
 *
 *  ── HONESTY ───────────────────────────────────────────────────────────────
 *  WhatsApp renders only when `waLink()` returns a number. It returns null for
 *  the `91XXXXXXXXXX` placeholder — which survives a digit-strip as "91" — so
 *  a half-configured site shows Instagram alone rather than a button that
 *  opens a chat with nobody.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Order matters: WhatsApp first. It is the one that starts a conversation. */
type Variant = "icon" | "labelled";

export default function SocialCtas({
  placement,
  variant = "icon",
  className,
}: {
  /** Where the tap happened, for analytics. "nav", "footer", … */
  placement: string;
  variant?: Variant;
  className?: string;
}) {
  const whatsapp = waLink();
  const labelled = variant === "labelled";
  /**
   * Instagram's mark is a GRADIENT, and a gradient needs an id. This component
   * renders twice on every page — once in the header, once in the footer — and
   * two <linearGradient id="ig"> in one document means the second silently
   * wins for both. useId gives each instance its own.
   */
  const gradId = useId();

  /**
   * ── BRAND COLOUR ON THE GLYPH, HOUSE COLOUR ON THE BUTTON ────────────────
   * The marks are recognised by colour before they are read — WhatsApp green
   * and Instagram's magenta-to-amber are doing the work of a label at 17px.
   * The chrome around them stays ivory and champagne, so the header reads as
   * this site rather than as a row of borrowed buttons, and the hover still
   * belongs to the house.
   */
  const base = cx(
    "inline-flex shrink-0 items-center justify-center rounded-full border border-ivory/20 text-ivory/80",
    "transition-colors duration-[var(--d-base)] hover:border-champagne/60 hover:text-champagne",
    // 44px in both axes either way (§14) — an icon button is the easiest
    // control on a page to under-size.
    labelled
      ? "h-11 gap-2.5 px-5 text-[0.7rem] uppercase tracking-[0.2em]"
      : "h-11 w-11",
  );

  return (
    <div className={cx("flex items-center gap-2.5", className)}>
      {whatsapp && (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("whatsapp_click", { placement })}
          // The accessible name carries the meaning when the label does not.
          aria-label={labelled ? undefined : "Message Lana on WhatsApp"}
          data-cursor="open"
          className={base}
        >
          <WhatsAppGlyph />
          {labelled && <span>WhatsApp</span>}
        </a>
      )}

      <a
        href={siteSettings.instagram}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("instagram_click", { placement })}
        aria-label={`Lana on Instagram, ${siteSettings.instagramHandle}`}
        data-cursor="open"
        className={base}
      >
        <InstagramGlyph gradId={gradId} />
        {labelled && <span>Instagram</span>}
      </a>
    </div>
  );
}

/** #25D366 is WhatsApp's own green. */
export const WHATSAPP_GREEN = "#25D366";

function WhatsAppGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill={WHATSAPP_GREEN} aria-hidden="true">
      <path d="M12.04 2A9.9 9.9 0 0 0 2.1 11.9c0 1.75.46 3.46 1.34 4.96L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01A9.9 9.9 0 0 0 22 11.94 9.9 9.9 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.2 8.2 0 0 1-1.26-4.36 8.24 8.24 0 1 1 8.25 8.23Zm4.52-6.16c-.25-.13-1.46-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.04-.39-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.19 3.7.59.26 1.04.41 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.46-.6 1.66-1.17.21-.58.21-1.07.15-1.17-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  );
}

/**
 * Instagram's mark, in Instagram's gradient — magenta through red to amber,
 * on the diagonal, which is how the brand actually draws it. Stroked rather
 * than filled so it sits at the same visual weight as the WhatsApp glyph
 * beside it.
 */
function InstagramGlyph({ gradId }: { gradId: string }) {
  const id = `ig-${gradId}`;
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEDA75" />
          <stop offset="28%" stopColor="#FA7E1E" />
          <stop offset="55%" stopColor="#D62976" />
          <stop offset="80%" stopColor="#962FBF" />
          <stop offset="100%" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke={`url(#${id})`} strokeWidth="1.9" />
      <circle cx="12" cy="12" r="4" stroke={`url(#${id})`} strokeWidth="1.9" />
      <circle cx="17.2" cy="6.8" r="1.25" fill={`url(#${id})`} />
    </svg>
  );
}
