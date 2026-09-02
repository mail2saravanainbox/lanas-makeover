"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { track } from "@/lib/analytics";

/** Bride-story link with the `bride_story_view` event and a VIEW cursor. */
export default function StoryLink({
  slug,
  name,
  children,
  className,
}: {
  slug: string;
  name: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={`/brides/${slug}`}
      data-cursor="view"
      aria-label={`Read the story: ${name}`}
      onClick={() => track("bride_story_view", { slug, placement: "home" })}
      className={`group block ${className ?? ""}`}
    >
      {children}
    </Link>
  );
}
