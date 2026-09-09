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

/**
 * ── THE ART'S DIMENSIONS, AND THE HOTSPOT DERIVED FROM THEM (§27) ────────
 * The brush is drawn with its bristle tip at (TIP, TIP) inside a VIEWBOX-unit
 * square and rendered at SIZE css pixels. HOTSPOT is therefore the tip's
 * position in rendered pixels, and the layer offsets itself by exactly that —
 * so the point where the bristles touch is the point that receives the click,
 * and it stays true if any of these three numbers change.
 */
const SIZE = 34;
const VIEWBOX = 48;
const TIP = 7;
const HOTSPOT = (TIP * SIZE) / VIEWBOX;

/**
 * ── INTERACTION STATES (§28) ─────────────────────────────────────────────
 * Five, and no more. Each is a scale and a rotation offset applied to the
 * SAME transform the frame loop already writes — no extra element, no extra
 * listener, no second animation clock.
 *
 *   default  the brush at rest
 *   link     a slight lift, the way a hand raises a brush off the surface
 *   cta      the same gesture, a little further — a conversion is worth more
 *   image    turned toward the plate, as if about to sweep it
 *   drag     squared up to the axis it is about to travel along
 *
 * The click dab is not a state: it is a one-frame impulse (see `dabNow`),
 * because a press is an event, not a condition.
 */
type BrushState = "default" | "link" | "cta" | "image" | "drag";

const STATES: Record<BrushState, { scale: number; angle: number }> = {
  default: { scale: 1, angle: 0 },
  link: { scale: 1.05, angle: -4 },
  cta: { scale: 1.09, angle: -7 },
  image: { scale: 1.06, angle: 5 },
  drag: { scale: 1.04, angle: 0 },
};

/**
 * What the brush is standing on, resolved from ONE `closest()` per move.
 *
 * `data-cursor="drag"` wins outright — it is declared by the only control on
 * the site where the pointer is about to be captured, and mistaking that for
 * an image hover would be a lie about what the next press does.
 */
function stateFor(el: Element | null): BrushState {
  if (!el) return "default";
  const declared = el.closest("[data-cursor]")?.getAttribute("data-cursor");
  if (declared === "drag") return "drag";
  if (el.closest(".btn, [data-cta]")) return "cta";
  if (el.closest("[data-tile], figure, picture, img")) return "image";
  if (el.closest("a[href], button, [role=\"button\"], label, summary")) return "link";
  return declared ? "link" : "default";
}

interface Dab {
  x: number;
  y: number;
  life: number;
  /** Radius multiplier. The click dab is a heavier press than a travel dab. */
  weight: number;
}

export default function BrushCursor() {
  const brushRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  /**
   * THE PRESS IS A REF, NOT STATE.
   *
   * It used to be `useState` with `down` in this effect's dependency array,
   * which meant every single mousedown and mouseup tore down the frame loop
   * and all five listeners and rebuilt them — and the rebuild re-seeded the
   * tracked position at the CENTRE OF THE VIEWPORT. The brush visibly flew to
   * the middle of the screen and eased back on every click. It also dropped
   * every pointer event in the gap.
   *
   * The frame loop reads this ref directly. The effect now binds once, for
   * the lifetime of the component, which is what it always meant to do.
   */
  const downRef = useRef(false);

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

    /** The state the brush is easing toward, and the two values it eases. */
    let state: BrushState = "default";
    let scale = 1;
    let stateAngle = 0;
    /** One-frame impulse set by pointerdown: the brush dabs the surface. */
    let press = 0;

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

    /**
     * `clientX/clientY` and nothing else. The layer is `position: fixed`, so
     * these are already in its coordinate space — mixing in pageX/pageY or a
     * scroll offset is exactly what makes a custom cursor drift as the page
     * moves, and there is no scroll term anywhere in this file.
     */
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      moved = true;

      const el = e.target as Element | null;
      state = stateFor(el);

      const declared = el?.closest?.("[data-cursor]")?.getAttribute("data-cursor") ?? null;
      const next = declared && LABELS[declared] ? LABELS[declared] : null;
      // One `closest()` per move is cheap; a React render per move is not.
      setLabel((prev) => (prev === next ? prev : next));
    };

    const stop = onFrame((dt) => {
      // Elegant inertia: fast enough to feel attached, slow enough to feel
      // like an object with weight rather than a pointer sprite.
      const px = at.x;
      at.x = damp(at.x, target.x, 18, dt);
      at.y = damp(at.y, target.y, 18, dt);

      // Lean into the direction of travel, then settle back to rest.
      // ±8°, not ±14°: past about ten degrees this stops reading as weight
      // and starts reading as a wobble.
      const lean = Math.max(-8, Math.min(8, (at.x - px) * 0.55));
      angle = damp(angle, REST_ANGLE + lean, 9, dt);

      // The interaction state, eased rather than snapped, and the press —
      // which decays on its own clock so a click reads as a dab, not a hold.
      const want = STATES[state];
      scale = damp(scale, want.scale * (downRef.current ? 0.9 : 1), 14, dt);
      stateAngle = damp(stateAngle, want.angle, 10, dt);
      press = Math.max(0, press - dt * 5);

      const brush = brushRef.current;
      if (brush) {
        brush.style.transform =
          `translate3d(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px, 0)` +
          ` rotate(${(angle + stateAngle).toFixed(2)}deg)` +
          ` scale(${(scale - press * 0.06).toFixed(3)})`;
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
          dabs.push({ x: at.x, y: at.y, life: 1, weight: 1 });
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
        const r = (3 + (1 - dab.life) * 9) * dab.weight * SCALE;
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

    const onDown = () => {
      downRef.current = true;
      // The dab a press leaves behind: one heavier mark at the bristle tip.
      press = 1;
      dabs.push({ x: at.x, y: at.y, life: 1, weight: 2.1 });
      if (dabs.length > 16) dabs.shift();
    };
    const onUp = () => {
      downRef.current = false;
    };
    const onLeave = () => {
      setLabel(null);
      state = "default";
      downRef.current = false;
    };

    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onDown, { passive: true });
    addEventListener("pointerup", onUp, { passive: true });
    // A press that ends outside the window never fires pointerup on it.
    addEventListener("pointercancel", onUp, { passive: true });
    addEventListener("blur", onUp);
    addEventListener("resize", size);
    document.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(enable);
      stop();
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onUp);
      removeEventListener("blur", onUp);
      removeEventListener("resize", size);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-brush-cursor");
    };
    // Binds ONCE. See `downRef` above — this array must stay empty.
  }, []);

  if (!active) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70]">
      {/* The powder, under the brush */}
      <canvas
        ref={canvasRef}
        // Stable hook. The WebGL guard test has to be able to tell this 2D
        // trail canvas apart from a hypothetical WebGL one WITHOUT probing it
        // — `getContext("webgl")` on a canvas that has no context yet does not
        // report one, it CREATES one, which is a false positive for exactly
        // the thing that test exists to forbid.
        data-brush-trail=""
        className="absolute inset-0 h-full w-full"
        style={{ filter: "blur(2px)" }}
      />

      {/* ── THE BRUSH ────────────────────────────────────────────────────
          Redrawn. The previous art was a blush-pink powder blob with a
          lavender ferrule and a purple handle, at 42px — three colours that
          appear nowhere else on this site, on a head almost as wide as the
          cursor was tall, with three heavy hatching strokes across it. It read
          as a sticker rather than as a tool.

          This one is a slim artist's brush in the site's own palette and
          nothing else: champagne bristles, an ivory ferrule, a bronze handle,
          34px. No saturated colour, no hatching, no outline.

          GEOMETRY. Drawn along a LOCAL VERTICAL AXIS with the tip at the
          origin, then rotated -45° into the diagonal. Every number below is
          therefore a readable width or length along the brush rather than a
          hand-solved diagonal coordinate — which is what made the old art
          effectively un-editable.

          HOTSPOT (§27). The tip is at viewBox (TIP, TIP) by construction, so
          the CSS offset is computed from it rather than eyeballed: change the
          size or the tip and the hotspot follows. The bristle point sits
          exactly on the true pointer position. */}
      <div
        ref={brushRef}
        className="absolute left-0 top-0 will-change-transform"
        style={{
          transformOrigin: `${HOTSPOT}px ${HOTSPOT}px`,
          marginLeft: -HOTSPOT,
          marginTop: -HOTSPOT,
        }}
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} fill="none">
          <defs>
            {/* Warm and shallow. The old shadow was a purple 1.2px blur at
                34% — a halo you could see. This is just enough to hold the
                brush legible over both the ink pages and the ivory ones. */}
            <filter id="lm-brush-shadow" x="-40%" y="-40%" width="200%" height="200%">
              <feDropShadow dx="0.4" dy="0.8" stdDeviation="0.8"
                floodColor="#120D08" floodOpacity="0.34" />
            </filter>

            {/* Light along the length of the brush, not across it. */}
            <linearGradient id="lm-bristle" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#EDDDC0" />
              <stop offset="1" stopColor="#BCA485" />
            </linearGradient>
            <linearGradient id="lm-ferrule" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F7F3E9" />
              <stop offset="1" stopColor="#C3B8A4" />
            </linearGradient>
            {/* Deep bronze, deliberately desaturated. The first pass sat at
                #AC8354, which on a warm-black ground read as orange wood. */}
            <linearGradient id="lm-handle" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#93724A" />
              <stop offset="1" stopColor="#453320" />
            </linearGradient>
          </defs>

          <g filter="url(#lm-brush-shadow)" transform={`translate(${TIP} ${TIP}) rotate(-45)`}>
            {/* handle — long, slim, gently tapered, rounded at the end.

                PROPORTION IS WHAT MAKES IT A BRUSH. Head 11, handle 28: a bit
                over 1:2.5. At the near-1:1 it started out with, the silhouette
                read as a nib or a blade, because that is the proportion a nib
                has. */}
            <path
              d="M-2.7 16.4 L2.7 16.4 L1.15 41.8 C1.15 43.9 -1.15 43.9 -1.15 41.8 Z"
              fill="url(#lm-handle)"
            />

            {/* ferrule, with the single crimp line that makes it read as metal */}
            <path
              d="M-3.6 11.2 L3.6 11.2 L2.7 16.5 L-2.7 16.5 Z"
              fill="url(#lm-ferrule)"
              stroke="#8B7857"
              strokeWidth="0.5"
              strokeOpacity="0.32"
              strokeLinejoin="round"
            />
            <path d="M-3.4 13.7 L3.4 13.7" stroke="#8E8271" strokeWidth="0.55" opacity="0.45" />

            {/* bristles — SOFT, not sharp. The control points pull the width
                out early (−2.4 at y 2.6), so the bundle has a belly and the
                apex is a point you can aim with rather than a needle. That is
                the whole difference between reading as loaded bristles and
                reading as a scalpel.

                `data-brush` is a stable test hook: the tests once selected on
                a gradient id, which vanished the moment the art was redrawn. */}
            {/* THE HAIRLINE IS NOT DECORATION.

                The site has an ivory surface as well as an ink one, and on
                ivory the pale head — which is where the HOTSPOT is — had
                almost no contrast and the tip disappeared. A cursor whose
                point of contact you cannot see is a broken cursor.

                A 0.5-unit stroke in a warm mid-tone defines the silhouette on
                a light ground and, on the dark pages, is simply read as the
                edge of the bristles. One value that works on both, rather
                than a backdrop-aware cursor, which SVG cannot be. */}
            <path
              data-brush="bristles"
              d="M0 0 C-2.4 2.6 -3.9 6.2 -3.6 11.2 L3.6 11.2 C3.9 6.2 2.4 2.6 0 0 Z"
              fill="url(#lm-bristle)"
              stroke="#8B7857"
              strokeWidth="0.5"
              strokeOpacity="0.5"
              strokeLinejoin="round"
            />
            {/* the shaded flank, at a fraction of the old contrast */}
            <path
              d="M0 0 C1.3 2.6 2.5 6.2 2.3 11.2 L3.6 11.2 C3.9 6.2 2.4 2.6 0 0 Z"
              fill="#A8916F"
              opacity="0.32"
            />
          </g>
        </svg>
      </div>

      {/* Contextual label. Duplicates an affordance in the markup — never the
          only way to know what something does. */}
      <span
        ref={labelRef}
        className="absolute left-0 top-0 whitespace-nowrap rounded-full bg-ivory px-3 py-1 text-[0.75rem] font-medium uppercase tracking-[0.22em] text-ink will-change-transform"
        style={{
          // Up and right of the head, clear of the handle, which runs
          // down-right. Scales with the art rather than being a magic number.
          marginLeft: SIZE * 0.8,
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
