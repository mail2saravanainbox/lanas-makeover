"use client";

/**
 * A single global pointer signal, read inside useFrame.
 * Module-level rather than context so it never triggers a React re-render —
 * mouse parallax at 60fps through state would be a performance disaster.
 */
export const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

let bound = false;

export function bindPointer(): () => void {
  if (typeof window === "undefined" || bound) return () => {};
  bound = true;

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

  return () => {
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerleave", onLeave);
    bound = false;
  };
}
