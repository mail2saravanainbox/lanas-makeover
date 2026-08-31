"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { track } from "@/lib/analytics";

/** Booking CTA with the `booking_click` event attached. */
export default function BookingLink({
  href,
  placement,
  className,
  children,
}: {
  href: string;
  placement: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={className} onClick={() => track("booking_click", { placement })}>
      {children}
    </Link>
  );
}
