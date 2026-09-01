"use client";

/* eslint-disable react-hooks/immutability -- Imperative WebGL by design.
   Three.js objects are mutated in place inside useFrame (uniforms, transforms).
   That mutation is the render loop; allocating new objects per frame would be
   a correctness and performance regression. The React Compiler cannot model
   this, so the rule is disabled for this file only. */

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { createTransformationMaterial } from "./materials";
import { useDomSync } from "./useDomSync";
import { pointer } from "@/lib/motion/pointer";
import { damp } from "@/lib/utils";

/**
 * ACT III — THE BRIDAL TRANSFORMATION (§7).
 *
 * Scroll drives a single continuous value 0 → 4 across the five stages:
 *   01 BARE · 02 PREPARED · 03 DEFINED · 04 ADORNED · 05 BRIDAL
 *
 * PHOTOGRAPHY: pass five image paths as `stages` and the shader crossfades
 * between the real photographs with a noise dissolve. With none supplied it
 * renders an abstract procedural tonal study instead — deliberately *not* a
 * fabricated face.
 */
export default function TransformationScene({
  anchor,
  trackAnchor,
  stages = [],
}: {
  /** The sticky frame — supplies position and size. */
  anchor: string;
  /** The tall scroll track behind it — supplies progress. */
  trackAnchor: string;
  /** Optional five real photographs, in stage order. */
  stages?: string[];
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useMemo(() => createTransformationMaterial(), []);
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1, 1, 1), []);
  // Position/size come from the sticky frame; progress comes from the tall
  // track behind it. Two anchors, because a pinned element never moves.
  const { read } = useDomSync(anchor);
  const { read: readTrack } = useDomSync(trackAnchor);
  const { gl } = useThree();
  const smooth = useRef({ stage: 0 });
  const textures = useRef<THREE.Texture[]>([]);

  // Load real photographs only when they are actually supplied.
  useEffect(() => {
    if (stages.length === 0) return;
    const loader = new THREE.TextureLoader();
    let cancelled = false;

    Promise.all(
      stages.map(
        (src) =>
          new Promise<THREE.Texture | null>((resolve) =>
            loader.load(src, resolve, undefined, () => resolve(null)),
          ),
      ),
    ).then((loaded) => {
      if (cancelled) return;
      const ok = loaded.filter((t): t is THREE.Texture => Boolean(t));
      for (const t of ok) {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
      }
      textures.current = ok;
      material.uniforms.uHasTex.value = ok.length >= 2 ? 1 : 0;
    });

    return () => {
      cancelled = true;
      textures.current.forEach((t) => t.dispose());
      textures.current = [];
    };
  }, [stages, material, gl]);

  useEffect(() => {
    return () => {
      material.dispose();
      geometry.dispose();
    };
  }, [material, geometry]);

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;

    const a = read();
    m.visible = a.visible;
    if (!a.visible) return;

    const dt = Math.min(delta, 0.05);
    const s = smooth.current;

    // `pinned` is 0 at the start of the sticky run and 1 at the end.
    const track = readTrack();
    s.stage = damp(s.stage, (track.visible ? track.pinned : a.through) * 4, 6, dt);

    const u = material.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uStage.value = s.stage;
    u.uAspect.value = a.height > 0 ? a.width / a.height : 1;
    u.uMouse.value.set(pointer.x, pointer.y);
    u.uOpacity.value = 1;

    const tex = textures.current;
    if (tex.length >= 2) {
      const idx = Math.min(Math.floor(s.stage), tex.length - 2);
      u.uTexA.value = tex[idx];
      u.uTexB.value = tex[idx + 1];
      u.uMix.value = s.stage - idx;
    }

    m.position.set(a.x, a.y, 0);
    m.scale.set(a.width, a.height, 1);
  });

  return (
    <mesh ref={mesh} frustumCulled={false}>
      <primitive object={geometry} attach="geometry" />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
