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

export type AnalyticsEvent =
  | "portfolio_view"
  | "bride_story_view"
  | "journal_view"
  | "booking_click"
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
