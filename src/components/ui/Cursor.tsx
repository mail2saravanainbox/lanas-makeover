"use client";

import { useEffect, useRef, useState } from "react";
import { damp } from "@/lib/utils";

/**
 * Custom cursor — desktop, fine-pointer, non-reduced-motion only.
 *
 * States are declared by markup, not by JS lookups: put `data-cursor="view"`
 * on anything and the cursor reads it. Supported: view · drag · open · read.
 * The real pointer is only hidden once this is actually running, so a failure
 * here can never leave the page cursorless.
 */
const LABELS: Record<string, string> = {
  view: "View",
  drag: "Drag",
  open: "Open",
  read: "Read",
};

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [down, setDown] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    document.documentElement.classList.add("has-custom-cursor");
    const enable = requestAnimationFrame(() => setActive(true));

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { ...target };
    let raf = 0;
    let last = performance.now();

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      const el = (e.target as Element | null)?.closest?.("[data-cursor]");
      const state = el?.getAttribute("data-cursor") ?? null;
      setLabel(state && LABELS[state] ? LABELS[state] : null);
    };

    const onDown = () => setDown(true);
    const onUp = () => setDown(false);
    const onLeave = () => setLabel(null);

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ring.x = damp(ring.x, target.x, 14, dt);
      ring.y = damp(ring.y, target.y, 14, dt);
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(enable);
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  if (!active) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70]">
      <div
        ref={ringRef}
        className="absolute left-0 top-0 flex items-center justify-center rounded-full border border-ivory/45 transition-[width,height,background-color,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
        style={{
          width: label ? 82 : down ? 26 : 34,
          height: label ? 82 : down ? 26 : 34,
          backgroundColor: label ? "rgba(224,205,178,0.92)" : "transparent",
          borderColor: label ? "rgba(224,205,178,0)" : "rgba(242,237,228,0.45)",
          mixBlendMode: label ? "normal" : "difference",
        }}
      >
        {label && (
          <span className="text-[0.75rem] font-medium uppercase tracking-[0.22em] text-ink">
            {label}
          </span>
        )}
      </div>
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1 w-1 rounded-full bg-ivory will-change-transform"
        style={{ opacity: label ? 0 : 1, transition: "opacity .3s" }}
      />
    </div>
  );
}
