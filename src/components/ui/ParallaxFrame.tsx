"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { damp } from "@/lib/utils";

/**
 * Depth without WebGL.
 *
 * Layers move at different rates against the pointer and against scroll,
 * which is what makes a flat photograph read as a plane in space. Damped, so
 * it drifts rather than snaps. Disabled on touch and under reduced motion.
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
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0, s: 0 };
    let raf = 0;
    let last = performance.now();

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = (e.clientX - (r.left + r.width / 2)) / r.width;
      target.y = (e.clientY - (r.top + r.height / 2)) / r.height;
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      current.x = damp(current.x, fine ? target.x : 0, 3.4, dt);
      current.y = damp(current.y, fine ? target.y : 0, 3.4, dt);

      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const centred = (r.top + r.height / 2 - vh / 2) / vh;
      current.s = damp(current.s, centred, 6, dt);

      el.style.setProperty("--px", (current.x * strength).toFixed(4));
      el.style.setProperty("--py", (current.y * strength).toFixed(4));
      el.style.setProperty("--sy", (current.s * scrollStrength).toFixed(4));

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    if (fine) window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
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
