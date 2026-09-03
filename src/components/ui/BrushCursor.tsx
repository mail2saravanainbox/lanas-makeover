"use client";

import { useEffect, useRef, useState } from "react";
import { damp } from "@/lib/utils";
import { onFrame } from "@/lib/motion/scheduler";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE BRUSH — Lana's signature, as the pointer
 * ═══════════════════════════════════════════════════════════════════════════
 *  The visitor's cursor is a makeup brush. Not a circle, not a novelty: a
 *  slim ferruled brush with soft bristles, held at the angle an artist holds
 *  one, with the BRISTLE TIP at the true pointer position so a click lands
 *  where the brush touches.
 *
 *  Three parts, in ascending cost:
 *
 *   1. An inline SVG brush. DOM, one transform per frame, no layout reads.
 *   2. A label pill for contextual states, driven by `data-cursor` in markup.
 *   3. A powder trail on a half-resolution canvas — soft dabs at the tip that
 *      fade in under half a second. Half-res because it is blurred anyway;
 *      a full-DPR fullscreen clear every frame is not worth it for something
 *      you are not meant to consciously see.
 *
 *  ACCESSIBILITY. The brush is decorative and aria-hidden. Every label it
 *  shows duplicates an affordance already in the markup — the real cursor is
 *  hidden only once this is actually running, so a failure here can never
 *  leave the page cursorless, and no label is the only way to understand an
 *  action. Desktop fine-pointer only; touch gets nothing, reduced motion gets
 *  nothing.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** `data-cursor` value → the word the brush carries. */
const LABELS: Record<string, string> = {
  view: "View",
  drag: "Drag",
  read: "Read",
  sweep: "Sweep",
  open: "Open",
};

/** How far the brush leans while at rest, in degrees. */
const REST_ANGLE = -34;

interface Dab {
  x: number;
  y: number;
  life: number;
}

export default function BrushCursor() {
  const brushRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [down, setDown] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("has-brush-cursor");
    const enable = requestAnimationFrame(() => setActive(true));

    const target = { x: innerWidth / 2, y: innerHeight / 2 };
    const at = { ...target };
    /** Lean, driven by horizontal speed — the brush trails its own stroke. */
    let angle = REST_ANGLE;
    let moved = false;

    const dabs: Dab[] = [];
    let lastDab = { x: target.x, y: target.y };

    const SCALE = 0.5;
    /**
     * Resolved lazily inside the frame loop, not captured here: nothing
     * renders until `active` flips on the next frame, so at this point the
     * ref is still null and a captured copy would stay null forever — the
     * trail would silently never draw.
     */
    let canvas: HTMLCanvasElement | null = null;
    let ctx: CanvasRenderingContext2D | null = null;

    const size = () => {
      if (!canvas) return;
      canvas.width = Math.ceil(innerWidth * SCALE);
      canvas.height = Math.ceil(innerHeight * SCALE);
    };

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      moved = true;
      const el = (e.target as Element | null)?.closest?.("[data-cursor]");
      const state = el?.getAttribute("data-cursor") ?? null;
      setLabel(state && LABELS[state] ? LABELS[state] : null);
    };

    const stop = onFrame((dt) => {
      // Elegant inertia: fast enough to feel attached, slow enough to feel
      // like an object with weight rather than a pointer sprite.
      const px = at.x;
      at.x = damp(at.x, target.x, 18, dt);
      at.y = damp(at.y, target.y, 18, dt);

      // Lean into the direction of travel, then settle back to rest.
      const lean = Math.max(-14, Math.min(14, (at.x - px) * 0.9));
      angle = damp(angle, REST_ANGLE + lean, 8, dt);

      const brush = brushRef.current;
      if (brush) {
        brush.style.transform =
          `translate3d(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px, 0)` +
          ` rotate(${angle.toFixed(2)}deg) scale(${down ? 0.92 : 1})`;
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px, 0)`;
      }

      // ── Powder trail ────────────────────────────────────────────────────
      if (!canvas && canvasRef.current) {
        canvas = canvasRef.current;
        ctx = canvas.getContext("2d");
        size();
      }
      if (!ctx || !canvas) return;

      if (moved) {
        const d = Math.hypot(at.x - lastDab.x, at.y - lastDab.y);
        if (d > 5) {
          dabs.push({ x: at.x, y: at.y, life: 1 });
          lastDab = { x: at.x, y: at.y };
          if (dabs.length > 16) dabs.shift();
        }
      }

      if (dabs.length === 0) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = dabs.length - 1; i >= 0; i--) {
        const dab = dabs[i];
        // ~450ms to nothing. A stroke you notice only after it has gone.
        dab.life -= dt * 2.2;
        if (dab.life <= 0) {
          dabs.splice(i, 1);
          continue;
        }
        const r = (3 + (1 - dab.life) * 9) * SCALE;
        const g = ctx.createRadialGradient(
          dab.x * SCALE, dab.y * SCALE, 0,
          dab.x * SCALE, dab.y * SCALE, r,
        );
        g.addColorStop(0, `rgba(232, 217, 184, ${(dab.life * 0.16).toFixed(3)})`);
        g.addColorStop(1, "rgba(232, 217, 184, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(dab.x * SCALE, dab.y * SCALE, r, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    const onDown = () => setDown(true);
    const onUp = () => setDown(false);
    const onLeave = () => setLabel(null);

    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onDown, { passive: true });
    addEventListener("pointerup", onUp, { passive: true });
    addEventListener("resize", size);
    document.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(enable);
      stop();
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
      removeEventListener("resize", size);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-brush-cursor");
    };
  }, [down]);

  if (!active) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70]">
      {/* The powder, under the brush */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ filter: "blur(2px)" }}
      />

      {/* The brush. Tip at (12,56) in its own coordinates, which is the
          transform origin, so the bristle point sits exactly on the pointer. */}
      <div
        ref={brushRef}
        className="absolute left-0 top-0 will-change-transform"
        style={{ transformOrigin: "15px 65px", marginLeft: -15, marginTop: -65 }}
      >
        <svg width="30" height="66" viewBox="0 0 30 66" fill="none">
          <defs>
            <linearGradient id="lm-bristle" x1="15" y1="36" x2="15" y2="65"
              gradientUnits="userSpaceOnUse">
              <stop stopColor="#FBF7EE" />
              <stop offset="0.45" stopColor="#EBDCC2" />
              <stop offset="1" stopColor="#C9AE89" />
            </linearGradient>
            <linearGradient id="lm-handle" x1="10" y1="4" x2="21" y2="32"
              gradientUnits="userSpaceOnUse">
              <stop stopColor="#3A2C20" />
              <stop offset="0.5" stopColor="#1C1510" />
              <stop offset="1" stopColor="#0E0A07" />
            </linearGradient>
            <linearGradient id="lm-ferrule" x1="10" y1="29" x2="20" y2="38"
              gradientUnits="userSpaceOnUse">
              <stop stopColor="#EBD9B8" />
              <stop offset="0.45" stopColor="#A07A4E" />
              <stop offset="1" stopColor="#E4D0AC" />
            </linearGradient>
            {/* Reads on ivory surfaces and over photographs alike. */}
            <filter id="lm-shadow" x="-60%" y="-20%" width="220%" height="150%">
              <feDropShadow dx="0.6" dy="1.2" stdDeviation="1.3"
                floodColor="#000" floodOpacity="0.42" />
            </filter>
          </defs>

          <g filter="url(#lm-shadow)">
            {/* handle — tapered, matte, with a rim light so it survives a
                dark hero instead of disappearing into it */}
            <path d="M10.6 30 L12.1 6.4 C12.2 4 17.8 4 17.9 6.4 L19.4 30 Z"
              fill="url(#lm-handle)" />
            <path d="M12.3 7 L13.4 29.4 L14.4 29.4 L13.3 7 Z"
              fill="#E0CDB2" fillOpacity="0.22" />

            {/* ferrule — the one metallic note */}
            <rect x="10.2" y="29.2" width="9.6" height="8" rx="1.3"
              fill="url(#lm-ferrule)" />
            <rect x="10.2" y="31.4" width="9.6" height="0.9"
              fill="#0E0A07" fillOpacity="0.22" />

            {/* bristles — full at the ferrule, soft to the point that IS the
                pointer. Two overlaid shapes so the edge reads as hair rather
                than as a filled triangle. */}
            <path d="M10.5 36.6 C9.2 45 10.6 53.6 15 64.8 C19.4 53.6 20.8 45 19.5 36.6 Z"
              fill="url(#lm-bristle)" />
            <path d="M12.4 36.8 C11.7 45 12.7 53 15 60.6 C17.3 53 18.3 45 17.6 36.8 Z"
              fill="#FFFDF8" fillOpacity="0.28" />
          </g>
        </svg>
      </div>

      {/* Contextual label. Duplicates an affordance in the markup — never the
          only way to know what something does. */}
      <span
        ref={labelRef}
        className="absolute left-0 top-0 whitespace-nowrap rounded-full bg-ivory px-3 py-1 text-[0.75rem] font-medium uppercase tracking-[0.22em] text-ink will-change-transform"
        style={{
          marginLeft: 18,
          marginTop: 6,
          opacity: label ? 1 : 0,
          transition: "opacity var(--d-fast) var(--ease-silk)",
        }}
      >
        {label ?? ""}
      </span>
    </div>
  );
}
