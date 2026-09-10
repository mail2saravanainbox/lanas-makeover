/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE WHATSAPP LINK
 * ─────────────────────────────────────────────────────────────────────────────
 *  One builder, used by the sticky bar, the closing block, the header, the
 *  enquiry flow and the contact page — so the number is validated once and the
 *  opening message reads the same wherever a bride taps.
 *
 *  ⚠ RENDERS NOTHING WITHOUT A REAL NUMBER. `waNumber()` returns null unless a
 *    plausible one is configured, and every caller is written to handle null by
 *    rendering no control at all. A WhatsApp button that opens an empty chat is
 *    worse than no button: it costs the enquiry AND the trust.
 *
 *  TWO SOURCES, IN ORDER:
 *    1. NEXT_PUBLIC_WHATSAPP_NUMBER — public by design; a phone number printed
 *       on the site is not a secret, and the client needs it in the browser.
 *    2. siteSettings.whatsapp — the content file, for parity with the rest of
 *       the brand configuration.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { siteSettings } from "@/content/site";

/** What a bride sees typed for her when the chat opens. */
export const WHATSAPP_GREETING = "Hi Lana, my wedding date is ";

/**
 * The number in wa.me form — digits only, country code included — or null.
 *
 * The placeholder `91XXXXXXXXXX` that ships in the setup docs survives
 * `replace(/\D/g, "")` as "91", which is why the length check exists: a
 * two-digit "number" would otherwise build a link that opens a chat with
 * nobody.
 */
export function waNumber(): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || siteSettings.whatsapp || "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  // A bare ten-digit Indian mobile is not dialable internationally.
  return digits.length === 10 ? `91${digits}` : digits;
}

/** A wa.me deep link with the message prefilled, or null when unconfigured. */
export function waLink(message: string = WHATSAPP_GREETING): string | null {
  const n = waNumber();
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(message)}` : null;
}

/** True when any WhatsApp affordance may be rendered. */
export const waEnabled = (): boolean => waNumber() !== null;
