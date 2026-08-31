"use client";

import { useCallback, useRef, useState } from "react";
import type { ImageRef } from "@/lib/types";
import EditorialImage from "@/components/ui/EditorialImage";
import { clamp } from "@/lib/utils";

/**
 * BEFORE / AFTER (§16)
 *
 * Draggable, touch-friendly and keyboard-operable — the handle is a real
 * `role="slider"` with arrow-key support, so this is usable without a pointer.
 *
 * Only ever rendered from genuine paired client assets. Nothing is fabricated;
 * the homepage never shows this control because no such pair exists yet.
 */
export default function BeforeAfterSlider({
  before,
  after,
  label = "Before and after",
}: {
  before: ImageRef;
  after: ImageRef;
  label?: string;
}) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(clamp((clientX - r.left) / r.width) * 100);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 3;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setPos((p) => Math.max(0, p - step));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setPos((p) => Math.min(100, p + step));
    } else if (e.key === "Home") {
      e.preventDefault();
      setPos(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setPos(100);
    }
  };

  return (
    <figure className="w-full">
      <div
        ref={ref}
        data-cursor="drag"
        className="relative aspect-[4/5] w-full touch-pan-y select-none overflow-hidden sm:aspect-[3/2]"
        onPointerDown={(e) => {
          dragging.current = true;
          (e.target as Element).setPointerCapture?.(e.pointerId);
          setFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (dragging.current) setFromClientX(e.clientX);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        <EditorialImage image={after} className="absolute inset-0 h-full w-full" sizes="92vw" />

        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <EditorialImage image={before} className="absolute inset-0 h-full w-full" sizes="92vw" />
        </div>

        <span className="pointer-events-none absolute left-4 top-4 rounded-full border border-ivory/25 bg-ink/50 px-3 py-1.5 text-[0.55rem] uppercase tracking-[0.24em] text-ivory/85 backdrop-blur-sm">
          Before
        </span>
        <span className="pointer-events-none absolute right-4 top-4 rounded-full border border-ivory/25 bg-ink/50 px-3 py-1.5 text-[0.55rem] uppercase tracking-[0.24em] text-ivory/85 backdrop-blur-sm">
          After
        </span>

        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-ivory/85"
          style={{ left: `${pos}%` }}
        />

        <div
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          aria-valuetext={`${Math.round(pos)}% before`}
          onKeyDown={onKeyDown}
          className="absolute top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-ivory/50 bg-ink/60 text-ivory backdrop-blur-md"
          style={{ left: `${pos}%` }}
        >
          <svg width="20" height="12" viewBox="0 0 20 12" aria-hidden="true">
            <path d="M7 1L2 6l5 5M13 1l5 5-5 5" stroke="currentColor" fill="none" />
          </svg>
        </div>
      </div>
      <figcaption className="mt-4 text-xs uppercase tracking-[0.2em] text-muted">
        Drag, or use the arrow keys, to compare.
      </figcaption>
    </figure>
  );
}
