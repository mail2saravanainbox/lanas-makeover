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

/** The art is drawn on its own diagonal, so rest is no rotation. */
const REST_ANGLE = 0;

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
      {/* The brush. A blush powder head up-left, lavender ferrule, two-tone
          charcoal handle down-right — drawn on its own diagonal, so the lean
          below is a real lean rather than a correction. The HEAD is the
          hotspot: the pointer sits where the bristles touch. */}
      <div
        ref={brushRef}
        className="absolute left-0 top-0 will-change-transform"
        style={{ transformOrigin: "6px 6px", marginLeft: -6, marginTop: -6 }}
      >
        <svg width="42" height="42" viewBox="0 0 48 48" fill="none">
          <defs>
            <filter id="lm-brush-shadow" x="-30%" y="-30%" width="180%" height="180%">
              <feDropShadow dx="0.8" dy="1.4" stdDeviation="1.2"
                floodColor="#2A2033" floodOpacity="0.34" />
            </filter>
          </defs>

          <g filter="url(#lm-brush-shadow)">
            {/* handle — lighter upper-right face */}
            <path
              d="M32.2 20.8 L44.6 39.4 C46.6 42.4 42.4 46.6 39.4 44.6 L20.8 32.2 Z"
              fill="#3B3348"
            />
            {/* handle — shadow face along the lower-left edge */}
            <path
              d="M26.4 26.4 L41.9 44.9 C40.9 45.1 39.9 44.9 39.4 44.6 L20.8 32.2 Z"
              fill="#272033"
            />

            {/* ferrule */}
            <path d="M28.7 17.3 L32.2 20.8 L20.8 32.2 L17.3 28.7 Z" fill="#EDE8F2" />
            <path d="M30.5 19.1 L32.2 20.8 L20.8 32.2 L19.1 30.5 Z" fill="#DED8E7" />

            {/* bristles — soft powder head. data-brush is a stable test hook:
                the tests used to select on a gradient id, which vanished the
                moment the art was redrawn. */}
            <path
              data-brush="bristles"
              d="M28.7 17.3 C30.2 8 24 1.4 15 2.5 C6 3.6 1.4 10 3.5 18 C5.1 24.6 11 30.6 17.3 28.7 Z"
              fill="#F8CCC2"
            />
            {/* the shaded side of the head */}
            <path
              d="M17.3 28.7 C11 30.6 5.1 24.6 3.5 18 C2 11.6 5 6 10.2 3.4 C6.4 8 5.2 14 7.1 19.6 C8.9 25 12.9 28.2 17.3 28.7 Z"
              fill="#F2B0A4"
            />
            {/* fan lines — the bristles reading as hair, not as a blob */}
            <g stroke="#F0A99C" strokeWidth="1.7" strokeLinecap="round">
              <path d="M24.6 20.8 L17.4 9.9" />
              <path d="M22.4 23.2 L12.2 14.6" />
              <path d="M20.4 25.4 L9.6 20.3" />
            </g>
          </g>
        </svg>
      </div>

      {/* Contextual label. Duplicates an affordance in the markup — never the
          only way to know what something does. */}
      <span
        ref={labelRef}
        className="absolute left-0 top-0 whitespace-nowrap rounded-full bg-ivory px-3 py-1 text-[0.75rem] font-medium uppercase tracking-[0.22em] text-ink will-change-transform"
        style={{
          // Up and right of the head, clear of the handle — which now runs
          // down-right and had the label sitting on top of it.
          marginLeft: 34,
          marginTop: -12,
          opacity: label ? 1 : 0,
          transition: "opacity var(--d-fast) var(--ease-silk)",
        }}
      >
        {label ?? ""}
      </span>
    </div>
  );
}
