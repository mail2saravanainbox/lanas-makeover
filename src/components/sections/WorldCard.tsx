"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";

/**
 * A bridal world. 3D tilt on pointer, image scale-and-drift, title lift.
 * All CSS-variable driven so the browser compositor does the work.
 * Tilt is disabled on touch and under reduced motion.
 */
export default function WorldCard({
  href,
  eyebrow,
  name,
  summary,
  index,
  children,
}: {
  href: string;
  eyebrow: string;
  name: string;
  summary: string;
  index: number;
  /** The image layer. */
  children: ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--tx", ((e.clientX - r.left) / r.width - 0.5).toFixed(4));
    el.style.setProperty("--ty", ((e.clientY - r.top) / r.height - 0.5).toFixed(4));
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tx", "0");
    el.style.setProperty("--ty", "0");
  };

  return (
    <Link
      ref={ref}
      href={href}
      data-cursor="view"
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="group relative block [perspective:1400px]"
      style={{ ["--tx" as string]: 0, ["--ty" as string]: 0 }}
    >
      <div
        className="relative overflow-hidden transition-transform duration-[var(--d-slow)] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
        style={{
          transform:
            "rotateY(calc(var(--tx) * 7deg)) rotateX(calc(var(--ty) * -7deg)) translateZ(0)",
        }}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <div
            className="absolute inset-[-6%] transition-transform duration-[var(--d-slow)] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
            style={{
              transform:
                "translate3d(calc(var(--tx) * -22px), calc(var(--ty) * -22px), 0)",
            }}
          >
            {children}
          </div>

          {/* Legibility scrim — always, never conditional */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent opacity-90 transition-opacity duration-[var(--d-base)] group-hover:opacity-75" />

          <span className="absolute right-5 top-5 font-mono text-[0.75rem] tracking-[0.24em] text-ivory/55">
            {String(index).padStart(2, "0")}
          </span>

          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
            <p className="eyebrow mb-3 !text-champagne/80">{eyebrow}</p>
            <h3 className="font-display text-3xl leading-none text-ivory transition-transform duration-[var(--d-base)] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1">
              {name}
            </h3>
            {/* Always visible. Hiding the one sentence that explains the
                ceremony behind a hover meant it did not exist on any phone. */}
            <p className="body-base mt-3">{summary}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
