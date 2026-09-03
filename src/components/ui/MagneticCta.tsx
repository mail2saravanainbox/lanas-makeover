"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { damp } from "@/lib/utils";
import { onFrame } from "@/lib/motion/scheduler";
import { pointer } from "@/lib/motion/pointer";
import { track } from "@/lib/analytics";

/**
 * THE BOOKING CTA, WITH A LITTLE WEIGHT
 *
 * The button leans a few pixels toward the brush as it approaches, and
 * settles back when it leaves. Maximum travel is 6px — enough to feel alive
 * under the cursor, small enough that nobody consciously notices it moving,
 * and far too small to make the button hard to hit.
 *
 * Carries data-cursor="open", so the brush picks up the word as it arrives.
 *
 * Off entirely on touch and under reduced motion: it is a pointer affordance,
 * and there is no pointer.
 */
const MAX = 6;

export default function MagneticCta({
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
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = 0;
    let y = 0;
    let near = false;

    const onEnter = () => { near = true; };
    const onLeave = () => { near = false; };
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);

    const stop = onFrame((dt) => {
      // The shared pointer is already damped for the whole page — no listener
      // and no rect read of our own.
      const tx = near ? pointer.x * MAX : 0;
      const ty = near ? -pointer.y * MAX : 0;
      x = damp(x, tx, 9, dt);
      y = damp(y, ty, 9, dt);
      el.style.transform =
        Math.abs(x) < 0.05 && Math.abs(y) < 0.05
          ? ""
          : `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    });

    return () => {
      stop();
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.style.transform = "";
    };
  }, []);

  return (
    <Link
      ref={ref}
      href={href}
      data-cursor="open"
      onClick={() => track("booking_click", { placement })}
      className={className}
    >
      {children}
    </Link>
  );
}
