"use client";

import { useEffect, useRef } from "react";
import { cx } from "@/lib/utils";

/**
 * Masked, line-by-line headline reveal — the signature editorial move.
 * Each line rises out of its own overflow-hidden box, staggered.
 */
export default function SplitLines({
  lines,
  id,
  className,
  lineClassName,
  stagger = 110,
  delay = 0,
  as: Tag = "h2",
}: {
  lines: string[];
  id?: string;
  className?: string;
  lineClassName?: string;
  stagger?: number;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "div";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.setAttribute("data-reveal", "in");
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-reveal", "in");
          io.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref as never} id={id} className={className} data-reveal="out">
      {lines.map((line, i) => (
        <span key={`${line}-${i}`} className={cx("line-mask", lineClassName)}>
          <span style={{ "--reveal-delay": `${delay + i * stagger}ms` } as React.CSSProperties}>
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
