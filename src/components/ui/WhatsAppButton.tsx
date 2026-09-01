"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";

/**
 * Discreet floating WhatsApp affordance.
 *
 * Renders nothing at all when no number is configured — no dead link, no
 * placeholder phone number. Appears only after the opening cinematic, sits
 * clear of content, and is a real link with a real accessible name.
 */
export default function WhatsAppButton({ href }: { href: string | null }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("whatsapp_click", { placement: "floating" })}
      aria-label="Message Lana's Makeover on WhatsApp"
      data-cursor="open"
      className={[
        "fixed bottom-5 right-5 z-[55] flex h-12 w-12 items-center justify-center rounded-full",
        "border border-ivory/15 bg-ink-2/85 text-ivory/85 backdrop-blur-xl",
        "transition-all duration-[var(--d-base)] ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:border-champagne/50 hover:text-champagne",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      ].join(" ")}
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2A9.9 9.9 0 0 0 2.1 11.9c0 1.75.46 3.46 1.34 4.96L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01A9.9 9.9 0 0 0 22 11.94 9.9 9.9 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.2 8.2 0 0 1-1.26-4.36 8.24 8.24 0 1 1 8.25 8.23Zm4.52-6.16c-.25-.13-1.46-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.04-.39-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.19 3.7.59.26 1.04.41 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.46-.6 1.66-1.17.21-.58.21-1.07.15-1.17-.06-.11-.22-.17-.47-.29Z" />
      </svg>
    </a>
  );
}
