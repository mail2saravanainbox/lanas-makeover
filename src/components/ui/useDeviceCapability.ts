"use client";

import { useEffect, useState } from "react";

export interface DeviceCapability {
  /** Null until measured on the client — render the 2D path meanwhile. */
  ready: boolean;
  webgl: boolean;
  reducedMotion: boolean;
  coarsePointer: boolean;
  lowPower: boolean;
  /** The single question every 3D component asks. */
  allow3D: boolean;
}

const INITIAL: DeviceCapability = {
  ready: false,
  webgl: false,
  reducedMotion: false,
  coarsePointer: true,
  lowPower: true,
  allow3D: false,
};

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    if (!gl) return false;
    // Some software rasterisers report a context but cannot do anything useful.
    const ctx = gl as WebGLRenderingContext;
    const renderer = ctx.getParameter(ctx.RENDERER);
    if (typeof renderer === "string" && /swiftshader|software|llvmpipe/i.test(renderer)) {
      return false;
    }
    ctx.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

/**
 * Decides — once, on mount — whether this device gets the WebGL layer.
 *
 * Everything degrades gracefully: when `allow3D` is false the DOM sections are
 * already complete and premium on their own. WebGL only ever *enhances*.
 */
export function useDeviceCapability(): DeviceCapability {
  const [cap, setCap] = useState<DeviceCapability>(INITIAL);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    const nav = navigator as NavigatorWithMemory;
    const cores = nav.hardwareConcurrency ?? 4;
    const memory = nav.deviceMemory ?? 4;
    const smallViewport = window.innerWidth < 640;
    const lowPower = cores <= 4 || memory <= 4;

    const evaluate = () => {
      const reducedMotion = motionQuery.matches;
      const coarsePointer = !pointerQuery.matches;
      const webgl = detectWebGL();

      setCap({
        ready: true,
        webgl,
        reducedMotion,
        coarsePointer,
        lowPower,
        // Mobile keeps a lighter WebGL layer; very low-power phones get none.
        allow3D: webgl && !reducedMotion && !(lowPower && smallViewport),
      });
    };

    evaluate();
    motionQuery.addEventListener("change", evaluate);
    pointerQuery.addEventListener("change", evaluate);
    return () => {
      motionQuery.removeEventListener("change", evaluate);
      pointerQuery.removeEventListener("change", evaluate);
    };
  }, []);

  return cap;
}
