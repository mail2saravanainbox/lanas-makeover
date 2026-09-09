"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/**
 * Fires one analytics event once per page view, from a server-rendered route.
 *
 * Exists so a server component does not have to become a client component to
 * report that it was seen. Renders nothing.
 */
export default function ViewTracker({
  event,
  payload,
}: {
  event: AnalyticsEvent;
  payload?: Record<string, string | number | boolean | undefined>;
}) {
  const serialised = JSON.stringify(payload ?? {});
  useEffect(() => {
    track(event, JSON.parse(serialised));
    // `serialised` rather than `payload`: an object literal in the caller is a
    // new reference on every render, which would re-fire the event forever.
  }, [event, serialised]);

  return null;
}
