"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Fires `journal_view` once per article view. */
export default function JournalViewTracker({
  slug,
  category,
}: {
  slug: string;
  category: string;
}) {
  useEffect(() => {
    track("journal_view", { slug, category });
  }, [slug, category]);

  return null;
}
