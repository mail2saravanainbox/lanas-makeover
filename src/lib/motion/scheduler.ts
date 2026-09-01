"use client";

import { useEffect, type RefObject } from "react";
import { clamp, damp } from "@/lib/utils";
import { bindPointer, pointer } from "./pointer";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE SCROLL SCHEDULER
 * ═══════════════════════════════════════════════════════════════════════════
 *  One scroll listener, one resize listener, one requestAnimationFrame for
 *  the entire page.
 *
 *  Before this, every scroll-driven section and every ParallaxFrame ran its
 *  own rAF and its own getBoundingClientRect, then pushed the result through
 *  React state — so a single scroll frame could mean eight loops, a dozen
 *  forced layouts and a dozen re-renders of subtrees that had not changed.
 *
 *  Rules of the house:
 *
 *   1. Rects are read ONCE per element per frame, and only on frames where
 *      the scroll position or the viewport actually changed.
 *   2. Callbacks write CSS custom properties or `style` directly. They never
 *      call setState per frame. Where a section needs a discrete value — an
 *      active stage index driving text and aria-live — it guards the setState
 *      on the value having changed.
 *   3. Elements more than 1.5 viewports away are skipped entirely.
 *
 *  Two subscriptions, because they answer different questions:
 *    register()  "where is this element?"     — runs on scroll/resize
 *    onFrame()   "what time is it?"           — runs every frame, pure maths,
 *                                               no DOM reads. For damping.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface Progress {
  /**
   * Pinned progress: 0 when the track's top hits the viewport top, 1 when its
   * bottom does. Meaningful for tall tracks with a sticky child; 0 otherwise.
   */
  p: number;
  /** Passage through the viewport: 0 entering from below, 1 leaving the top. */
  through: number;
  /** Live rect values, so a callback never has to measure again. */
  top: number;
  height: number;
  vh: number;
}

type ScrollFn = (s: Progress) => void;
type FrameFn = (dt: number) => void;
type ScrollYFn = (y: number, vh: number) => void;

const scrollSubs = new Map<HTMLElement, ScrollFn>();
const frameSubs = new Set<FrameFn>();
const scrollYSubs = new Set<ScrollYFn>();

let raf = 0;
let lastTime = 0;
let lastY = -1;
let lastH = -1;
let lastW = -1;
let dirty = true;

/** Damping rate for the shared pointer. Matches the old per-instance value. */
const POINTER_LAMBDA = 3.4;

function measure(el: HTMLElement, vh: number): Progress {
  const r = el.getBoundingClientRect();
  const travel = r.height - vh;
  return {
    p: travel > 0 ? clamp(-r.top / travel) : 0,
    through: clamp((vh - r.top) / (vh + r.height)),
    top: r.top,
    height: r.height,
    vh,
  };
}

function tick(now: number) {
  raf = requestAnimationFrame(tick);

  const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0;
  lastTime = now;

  // The shared pointer is damped once, here, for every consumer.
  if (pointer.x !== pointer.tx || pointer.y !== pointer.ty) {
    pointer.x = damp(pointer.x, pointer.tx, POINTER_LAMBDA, dt);
    pointer.y = damp(pointer.y, pointer.ty, POINTER_LAMBDA, dt);
  }

  for (const fn of frameSubs) fn(dt);

  const y = window.scrollY;
  const vh = window.innerHeight;
  const vw = window.innerWidth;

  if (!dirty && y === lastY && vh === lastH && vw === lastW) return;
  lastY = y;
  lastH = vh;
  lastW = vw;
  dirty = false;

  for (const fn of scrollYSubs) fn(y, vh);

  for (const [el, fn] of scrollSubs) {
    const r = el.getBoundingClientRect();
    // More than 1.5 viewports away in either direction: nothing to say.
    if (r.bottom < -vh * 1.5 || r.top > vh * 2.5) continue;

    const travel = r.height - vh;
    fn({
      p: travel > 0 ? clamp(-r.top / travel) : 0,
      through: clamp((vh - r.top) / (vh + r.height)),
      top: r.top,
      height: r.height,
      vh,
    });
  }
}

function markDirty() {
  dirty = true;
}

let releasePointer: (() => void) | null = null;

function start() {
  if (raf || typeof window === "undefined") return;
  window.addEventListener("scroll", markDirty, { passive: true });
  window.addEventListener("resize", markDirty);
  // The scheduler damps the pointer, so the scheduler owns the listener.
  // Previously only the WebGL layer bound it, which meant pointer parallax
  // silently died on every device that never loaded WebGL.
  releasePointer = bindPointer();
  lastTime = 0;
  dirty = true;
  raf = requestAnimationFrame(tick);
}

function stop() {
  if (!raf) return;
  if (scrollSubs.size || frameSubs.size || scrollYSubs.size) return;
  cancelAnimationFrame(raf);
  raf = 0;
  lastY = lastH = lastW = -1;
  window.removeEventListener("scroll", markDirty);
  window.removeEventListener("resize", markDirty);
  releasePointer?.();
  releasePointer = null;
}

/** Subscribe an element to scroll progress. Returns the unsubscribe. */
export function register(el: HTMLElement, fn: ScrollFn): () => void {
  scrollSubs.set(el, fn);
  start();
  // Give the caller a position immediately rather than on the next scroll.
  fn(measure(el, window.innerHeight));
  return () => {
    scrollSubs.delete(el);
    stop();
  };
}

/**
 * Subscribe to the raw scroll position. For the handful of things that care
 * about the document, not about an element — the header's condensed state,
 * the floating WhatsApp affordance. Guard your setState on the value changing.
 */
export function onScrollY(fn: ScrollYFn): () => void {
  scrollYSubs.add(fn);
  start();
  fn(window.scrollY, window.innerHeight);
  return () => {
    scrollYSubs.delete(fn);
    stop();
  };
}

/** Subscribe to every frame. For damping only — do not read the DOM here. */
export function onFrame(fn: FrameFn): () => void {
  frameSubs.add(fn);
  start();
  return () => {
    frameSubs.delete(fn);
    stop();
  };
}

/** Force a re-measure on the next frame — after a layout change, say. */
export function invalidate(): void {
  dirty = true;
}

export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  fn: ScrollFn,
  deps: unknown[] = [],
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return register(el, fn);
    // The callback is intentionally not a dependency: sections pass a stable
    // closure over refs, and re-registering per render would defeat the point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, ...deps]);
}

export function useFrame(fn: FrameFn, deps: unknown[] = []): void {
  useEffect(() => {
    return onFrame(fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
