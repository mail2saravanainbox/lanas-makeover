"use client";

import type { ReactNode } from "react";
import { track } from "@/lib/analytics";

/** Instagram outbound link with analytics. Keeps Footer a server component. */
export default function InstagramLink({
  href,
  children,
  className,
  placement,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  placement: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => track("instagram_click", { placement })}
    >
      {children}
    </a>
  );
}
