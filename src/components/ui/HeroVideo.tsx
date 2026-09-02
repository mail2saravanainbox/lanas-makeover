"use client";

import { useEffect, useRef, useState } from "react";
import type { HeroMedia, ImageRef, VideoSources } from "@/lib/types";
import EditorialImage from "@/components/ui/EditorialImage";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE HERO'S MEDIA
 * ═══════════════════════════════════════════════════════════════════════════
 *  Three states, all of which must be correct:
 *
 *    video present  → poster paints first, film fades in over it once it is
 *                     genuinely playing
 *    video absent   → poster, and nothing else happens
 *    poster absent  → placeholder plate, and nothing else happens
 *
 *  THE POSTER IS ALWAYS THE LCP ELEMENT. The video never loads until the
 *  poster has painted and the browser is idle, so film can never delay the
 *  first meaningful frame — it can only follow it.
 *
 *  It is also refused outright when the visitor has told us not to:
 *  prefers-reduced-motion, Save-Data, or anything the browser reports as
 *  slower than 4g. A bride on a train in Trichy does not need 3 MB of loop.
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface Connection {
  saveData?: boolean;
  effectiveType?: string;
}

function refuses(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  const c = (navigator as Navigator & { connection?: Connection }).connection;
  if (!c) return false;
  if (c.saveData) return true;
  return Boolean(c.effectiveType && c.effectiveType !== "4g");
}

/** Source order matters: the browser takes the first it can decode. */
function sourcesOf(v: VideoSources) {
  return [
    v.av1 && { src: v.av1, type: 'video/mp4; codecs="av01.0.05M.08"' },
    v.webm && { src: v.webm, type: "video/webm" },
    { src: v.mp4, type: "video/mp4" },
  ].filter(Boolean) as Array<{ src: string; type: string }>;
}

export default function HeroVideo({
  poster,
  posterPortrait,
  video,
}: {
  poster: ImageRef;
  posterPortrait?: ImageRef | null;
  video?: HeroMedia["video"];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [portrait, setPortrait] = useState(false);
  const [playing, setPlaying] = useState(false);
  /** Null until we have decided; then the encode this viewport should load. */
  const [chosen, setChosen] = useState<VideoSources | null>(null);

  // ── Which shape of frame is this? ───────────────────────────────────────
  useEffect(() => {
    const q = window.matchMedia("(orientation: portrait)");
    const read = () => setPortrait(q.matches);
    read();
    q.addEventListener("change", read);
    return () => q.removeEventListener("change", read);
  }, []);

  // ── Decide whether film is appropriate, then wait for a quiet moment ────
  useEffect(() => {
    if (!video || refuses()) return;

    const pick = () => {
      const use =
        portrait && video.portrait ? video.portrait : video.landscape;
      setChosen(use);
    };

    // After the poster has painted AND the main thread is idle. The 1,500ms
    // fallback is for browsers without requestIdleCallback (Safari, still).
    const idle = window.requestIdleCallback?.(pick, { timeout: 1500 });
    const timer = idle === undefined ? window.setTimeout(pick, 1500) : undefined;

    return () => {
      if (idle !== undefined) window.cancelIdleCallback?.(idle);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [video, portrait]);

  // ── Load, play, and only then reveal ────────────────────────────────────
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !chosen) return;

    const onCanPlay = () => void el.play().catch(() => undefined);
    // Not `playing`, not `canplaythrough` — the first frame that has actually
    // advanced. Anything earlier can reveal a black rectangle.
    const onProgress = () => {
      if (el.currentTime > 0) setPlaying(true);
    };

    el.addEventListener("canplaythrough", onCanPlay);
    el.addEventListener("timeupdate", onProgress);
    el.load();

    // Off screen, it should not be decoding.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.intersectionRatio === 0) el.pause();
        else if (entry.intersectionRatio >= 0.25) void el.play().catch(() => undefined);
      },
      { threshold: [0, 0.25] },
    );
    io.observe(el);

    return () => {
      el.removeEventListener("canplaythrough", onCanPlay);
      el.removeEventListener("timeupdate", onProgress);
      io.disconnect();
    };
  }, [chosen]);

  const shown = portrait && posterPortrait ? posterPortrait : poster;

  return (
    <>
      <EditorialImage
        image={shown}
        className="absolute inset-0 h-full w-full"
        sizes="100vw"
        priority
        decorative
      />

      {chosen && (
        <video
          ref={videoRef}
          aria-hidden="true"
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: playing ? 1 : 0,
            transition: "opacity var(--d-base) linear",
          }}
        >
          {sourcesOf(chosen).map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      )}
    </>
  );
}
