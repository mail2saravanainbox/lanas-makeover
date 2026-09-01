"use client";

/**
 * A single global pointer signal.
 *
 * Module-level rather than React context so it never triggers a re-render —
 * mouse parallax at 60fps through state would be a performance disaster.
 *
 *   tx / ty  the raw target, written by the listener, in −1…1
 *   x  / y   the damped value, written once per frame by the scheduler
 *
 * Nothing else damps it. Every consumer — ParallaxFrame, the WebGL rig —
 * reads the same already-smoothed number.
 */
export const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

let refs = 0;
let unbind: (() => void) | null = null;

/**
 * Ref-counted: the scheduler binds it for ParallaxFrame, the WebGL rig binds
 * it for the camera. Whoever leaves first must not blind the other.
 */
export function bindPointer(): () => void {
  if (typeof window === "undefined") return () => {};

  refs += 1;
  if (refs > 1) {
    let released = false;
    return () => {
      if (released) return;
      released = true;
      refs -= 1;
      if (refs === 0) unbind?.();
    };
  }

  const onMove = (e: PointerEvent) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1);
  };
  const onLeave = () => {
    pointer.tx = 0;
    pointer.ty = 0;
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerleave", onLeave);

  unbind = () => {
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerleave", onLeave);
    unbind = null;
  };

  let released = false;
  return () => {
    if (released) return;
    released = true;
    refs -= 1;
    if (refs === 0) unbind?.();
  };
}
