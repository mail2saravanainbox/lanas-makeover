"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { damp } from "@/lib/utils";
import { onFrame, register } from "@/lib/motion/scheduler";
import { pointer } from "@/lib/motion/pointer";

/**
 * Depth without WebGL.
 *
 * Layers move at different rates against the pointer and against scroll,
 * which is what makes a flat photograph read as a plane in space. Damped, so
 * it drifts rather than snaps. Disabled on touch and under reduced motion.
 *
 * There used to be one requestAnimationFrame and one getBoundingClientRect
 * per instance, per frame — and /services renders six of these. Now the
 * scheduler supplies the rect on scroll frames, the shared pointer is damped
 * once for the whole page, and this component's frame callback is pure
 * arithmetic against numbers that already exist.
 */
export default function ParallaxFrame({
  children,
  strength = 1,
  scrollStrength = 1,
  className,
}: {
  children: ReactNode;
  strength?: number;
  scrollStrength?: number;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    /** Where the element sits relative to the viewport centre, −1…1-ish. */
    let targetS = 0;
    let currentS = 0;

    const stopScroll = register(el, ({ top, height, vh }) => {
      targetS = (top + height / 2 - vh / 2) / vh;
    });

    const stopFrame = onFrame((dt) => {
      currentS = damp(currentS, targetS, 6, dt);
      // ×0.5: the shared pointer spans the viewport in −1…1, where the old
      // per-instance one spanned the element. Same amplitude on screen.
      el.style.setProperty("--px", ((fine ? pointer.x : 0) * strength * 0.5).toFixed(4));
      el.style.setProperty("--py", ((fine ? -pointer.y : 0) * strength * 0.5).toFixed(4));
      el.style.setProperty("--sy", (currentS * scrollStrength).toFixed(4));
    });

    return () => {
      stopScroll();
      stopFrame();
    };
  }, [strength, scrollStrength]);

  return (
    <div
      ref={root}
      className={className}
      style={{ ["--px" as string]: 0, ["--py" as string]: 0, ["--sy" as string]: 0 }}
    >
      {children}
    </div>
  );
}
