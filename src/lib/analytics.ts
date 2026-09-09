"use client";

/**
 * ANALYTICS
 *
 * Provider-agnostic. Events are pushed to the GTM dataLayer and to gtag when
 * either is present; otherwise they are a no-op (and logged in development).
 *
 * NO IDs ARE HARDCODED. Configure:
 *   NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX      (Google Tag Manager)
 *   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX      (GA4, if used without GTM)
 * Vercel Analytics is enabled automatically on Vercel deployments.
 */

/**
 * THE FUNNEL (§37)
 *
 *   Landing → Portfolio → Services → Check Your Date → Booking Started
 *           → Booking Submitted → WhatsApp
 *
 * Every event below is one edge of that graph, so a drop-off can be located
 * rather than guessed at. Each carries a `placement` where more than one
 * control can fire it — a booking_click from the sticky bar and one from the
 * hero are the same intent from very different moments, and the difference is
 * the only thing that makes the number actionable.
 */
export type AnalyticsEvent =
  /** A look was opened in the lightbox. */
  | "portfolio_view"
  /** A portfolio facet was changed. Payload carries the facet and the value. */
  | "portfolio_filter"
  | "bride_story_view"
  | "journal_view"
  /** A service page or card was opened. */
  | "service_view"
  /** An FAQ answer was expanded. */
  | "faq_open"
  /** Any "Check Your Date" control was clicked, anywhere on the site. */
  | "booking_click"
  /** The first interaction with the enquiry flow. Once per visit. */
  | "booking_start"
  /** A submission the server accepted. Payload says whether it was delivered. */
  | "booking_complete"
  | "whatsapp_click"
  | "instagram_click"
  | "contact_submit"
  /** Fired once per page view, when the ritual's eighth frame becomes active. */
  | "ritual_complete";

type Payload = Record<string, string | number | boolean | undefined>;

interface AnalyticsWindow extends Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
}

export function track(event: AnalyticsEvent, payload: Payload = {}): void {
  if (typeof window === "undefined") return;
  const w = window as AnalyticsWindow;

  try {
    w.dataLayer?.push({ event, ...payload });
    w.gtag?.("event", event, payload);
  } catch {
    /* analytics must never break the page */
  }

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event, payload);
  }
}

export const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
export const gaId = process.env.NEXT_PUBLIC_GA_ID;
