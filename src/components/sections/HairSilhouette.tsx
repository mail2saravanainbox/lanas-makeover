"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import EditorialImage from "@/components/ui/EditorialImage";
import Reveal from "@/components/ui/Reveal";
import SplitLines from "@/components/ui/SplitLines";
import { cx, sectionEyebrow } from "@/lib/utils";
import type { ImageRef, MediaTone, VideoSources } from "@/lib/types";

/**
 * THE SILHOUETTE OF THE BRIDE (§19)
 *
 * Hair gets its own act. It used to be a 380vh scroll track — six states
 * costing nearly four viewports, and no way to look at state 03 without
 * scrolling past 01 and 02.
 *
 * It is a stepper now. One screen, six real buttons, and an auto-advance that
 * plays the sequence once on arrival and stops the moment anyone touches it.
 * No fake 3D head, no CG hair — real photography is the plan, and placeholder
 * plates hold the composition until it arrives.
 */
const LOOKS: Array<{ name: string; note: string; tone: MediaTone; seed: number }> = [
  { name: "Open", note: "Nothing set. The natural fall of the hair.", tone: "ink", seed: 801 },
  { name: "Waved", note: "Texture worked in first — structure holds better on it.", tone: "bronze", seed: 802 },
  { name: "Braided", note: "The base tension that everything else is pinned to.", tone: "champagne", seed: 803 },
  { name: "Jadai", note: "Ornamental plates graduated down the length of the braid.", tone: "bronze", seed: 804 },
  { name: "Flowered", note: "Jasmine, measured in muzham. The clock starts here.", tone: "olive", seed: 805 },
  { name: "Bridal", note: "The silhouette that reads from the back of the hall.", tone: "rose", seed: 806 },
];

const PLATES: ImageRef[] = LOOKS.map((l) => ({ alt: `${l.name} bridal hair`, tone: l.tone, seed: l.seed }));

/** Long enough to read the state name, short enough not to feel stuck. */
const DWELL = 1600;

export default function HairSilhouette({
  index,
  images = PLATES,
  clip,
}: {
  index: number;
  images?: ImageRef[];
  /** Footage for state 05, "Flowered". Absent by default. */
  clip?: VideoSources;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(0);
  /** Set by the first deliberate interaction, and never unset. */
  const touched = useRef(false);
  const [nearby, setNearby] = useState(false);
  const swipeX = useRef<number | null>(null);

  // ── Auto-advance once, on arrival ───────────────────────────────────────
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        const step = () => {
          if (touched.current) return;
          setActive((prev) => {
            if (prev >= LOOKS.length - 1) return prev;
            timer = window.setTimeout(step, DWELL);
            return prev + 1;
          });
        };
        timer = window.setTimeout(step, DWELL);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  // ── The clip only loads once the panel is roughly in reach ──────────────
  useEffect(() => {
    const el = panelRef.current;
    if (!el || !clip) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNearby(true);
          io.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [clip]);

  function select(next: number) {
    touched.current = true;
    setActive(Math.max(0, Math.min(LOOKS.length - 1, next)));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      select(active + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      select(active - 1);
    }
  }

  /** State 05 is "Flowered" — the one the clip belongs to. */
  const clipIndex = 4;
  const showClip = Boolean(clip) && nearby && active === clipIndex;

  return (
    <section
      ref={panelRef}
      aria-labelledby="hair-title"
      className="section-dark relative flex min-h-[100dvh] items-center py-[var(--s-8)]"
      onKeyDown={onKeyDown}
    >
      <div className="shell grid w-full items-center gap-10 lg:grid-cols-[1fr_0.95fr] lg:gap-20">
        {/* Phone puts the picture first; desktop reads left to right. */}
        <div
          data-cursor="sweep"
          className="relative order-1 aspect-[4/5] w-full touch-pan-y overflow-hidden lg:order-2 lg:aspect-auto lg:h-[70vh]"
          onPointerDown={(e) => {
            swipeX.current = e.clientX;
          }}
          onPointerUp={(e) => {
            const from = swipeX.current;
            swipeX.current = null;
            if (from === null) return;
            const dx = e.clientX - from;
            if (Math.abs(dx) >= 40) select(active + (dx < 0 ? 1 : -1));
          }}
          onPointerCancel={() => {
            swipeX.current = null;
          }}
        >
          {LOOKS.map((l, i) => (
            <div
              key={l.name}
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                opacity: i === active ? 1 : 0,
                transition: "opacity var(--d-base) var(--ease-silk)",
              }}
            >
              <EditorialImage
                image={images[i] ?? PLATES[i]}
                className="h-full w-full"
                sizes="(max-width: 1024px) 92vw, 45vw"
                decorative
              />
            </div>
          ))}

          {showClip && clip && (
            <video
              ref={videoRef}
              aria-hidden="true"
              muted
              loop
              autoPlay
              playsInline
              preload="none"
              className="absolute inset-0 h-full w-full object-cover"
            >
              {clip.av1 && <source src={clip.av1} type='video/mp4; codecs="av01.0.05M.08"' />}
              {clip.webm && <source src={clip.webm} type="video/webm" />}
              <source src={clip.mp4} type="video/mp4" />
            </video>
          )}

          <p className="sr-only" aria-live="polite">
            Hair stage: {LOOKS[active].name}
          </p>
        </div>

        <div className="order-2 lg:order-1">
          <Reveal>
            <p className="eyebrow mb-8">{sectionEyebrow(index, "The silhouette")}</p>
          </Reveal>
          <SplitLines
            as="h2"
            id="hair-title"
            className="display-md text-ivory"
            lines={["The silhouette", "of the bride."]}
          />

          <p className="body-lg measure-note mt-8">
            From the back of a wedding hall nobody can see a lip line. What they can see is a
            silhouette — and that is built, not styled.
          </p>

          <ol className="mt-10 flex flex-wrap gap-x-3 gap-y-2">
            {LOOKS.map((l, i) => (
              <li key={l.name}>
                <button
                  type="button"
                  onClick={() => select(i)}
                  aria-pressed={i === active}
                  className={cx(
                    "flex min-h-11 items-baseline gap-2 px-2 text-[0.8rem] uppercase tracking-[0.24em] transition-colors duration-[var(--d-base)]",
                    i === active ? "text-champagne" : "text-inactive hover:text-ivory",
                  )}
                >
                  <span className="font-mono text-[0.75rem]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{l.name}</span>
                </button>
              </li>
            ))}
          </ol>

          <p
            key={active}
            className="body-base measure-note mt-8"
            style={{ animation: "hair-in var(--d-slow) var(--ease-silk) both" }}
          >
            {LOOKS[active].note}
          </p>

          <Link href="/hair" className="btn btn-ghost mt-10">
            Bridal hair
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes hair-in {
          from { opacity: 0; transform: translate3d(0, 10px, 0); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </section>
  );
}
