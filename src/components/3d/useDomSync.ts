"use client";
import type * as THREE from "three";

import { useThree } from "@react-three/fiber";
import { useCallback, useMemo, useRef } from "react";
import { clamp } from "@/lib/utils";

export interface AnchorState {
  /** World-space centre of the anchor element. */
  x: number;
  y: number;
  /** World-space size of the anchor element. */
  width: number;
  height: number;
  /** 0 when the anchor's top hits the viewport bottom, 1 when its bottom exits the top. */
  through: number;
  /** For tall/sticky sections: 0 at pin start, 1 at pin end. */
  pinned: number;
  /** Anchor is anywhere near the viewport — used to cull the scene entirely. */
  visible: boolean;
}

const EMPTY: AnchorState = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  through: 0,
  pinned: 0,
  visible: false,
};

/**
 * Binds a WebGL object to a plain DOM element.
 *
 * This is what keeps the 3D layer honest: the canvas is a single fixed surface
 * behind the page, and every scene positions itself from the layout of real,
 * accessible, SEO-visible HTML. Remove the canvas and the page is unchanged.
 */
export function useDomSync(selector: string) {
  const { camera, size } = useThree();
  const state = useRef<AnchorState>({ ...EMPTY });
  const el = useRef<HTMLElement | null>(null);
  /** Throttles re-querying when the anchor isn't on this page at all. */
  const misses = useRef(0);

  /** World units per CSS pixel at the z=0 plane. */
  const pxToWorld = useMemo(() => {
    const cam = camera as THREE.PerspectiveCamera & { fov?: number };
    const fov = ((cam.fov ?? 45) * Math.PI) / 180;
    const visibleHeight = 2 * Math.tan(fov / 2) * camera.position.z;
    return visibleHeight / size.height;
  }, [camera, size.height]);

  const read = useCallback((): AnchorState => {
    if (typeof document === "undefined") return state.current;

    if (!el.current || !el.current.isConnected) {
      // Only re-query occasionally on pages where the anchor never exists.
      if (misses.current > 0 && misses.current % 30 !== 0) {
        misses.current++;
        state.current.visible = false;
        return state.current;
      }
      el.current = document.querySelector<HTMLElement>(selector);
    }

    const node = el.current;
    if (!node) {
      misses.current++;
      state.current = { ...EMPTY };
      return state.current;
    }
    misses.current = 0;

    const r = node.getBoundingClientRect();
    const vh = window.innerHeight;

    const s = state.current;
    s.width = r.width * pxToWorld;
    s.height = r.height * pxToWorld;
    s.x = (r.left + r.width / 2 - size.width / 2) * pxToWorld;
    s.y = -(r.top + r.height / 2 - size.height / 2) * pxToWorld;
    s.through = clamp((vh - r.top) / (vh + r.height));
    s.pinned = r.height > vh ? clamp(-r.top / (r.height - vh)) : s.through;
    s.visible = r.bottom > -vh * 0.4 && r.top < vh * 1.4;

    return s;
  }, [selector, pxToWorld, size.width, size.height]);

  return { read, pxToWorld };
}
