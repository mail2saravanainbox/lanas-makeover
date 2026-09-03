"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Scroll reveal via IntersectionObserver.
 *
 * Intentionally NOT ScrollTrigger: reveals are the most common animation on
 * the site and an observer costs nothing per frame. GSAP is reserved for the
 * places that genuinely need a scrubbed timeline.
 */
export default function Reveal({
  children,
  delay = 0,
  blur = false,
  mask = false,
  className,
  once = true,
}: {
  children: ReactNode;
  /** ms */
  delay?: number;
  blur?: boolean;
  /** Clip-path wipe from the bottom edge, for imagery. */
  mask?: boolean;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const attr = mask ? "data-reveal-mask" : blur ? "data-reveal-blur" : "data-reveal";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.setAttribute(attr, "in");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.setAttribute(attr, "in");
            if (once) io.unobserve(el);
          } else if (!once) {
            el.setAttribute(attr, "out");
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [attr, once]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
      {...{ [attr]: "out" }}
    >
      {children}
    </div>
  );
}
