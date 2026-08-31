"use client";

/* eslint-disable react-hooks/immutability -- Imperative WebGL by design.
   Three.js objects are mutated in place inside useFrame (uniforms, transforms).
   That mutation is the render loop; allocating new objects per frame would be
   a correctness and performance regression. The React Compiler cannot model
   this, so the rule is disabled for this file only. */

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createSilkMaterial } from "./materials";
import { useDomSync } from "./useDomSync";
import { damp } from "@/lib/utils";

/**
 * 3D SILK TRANSITION (§9).
 *
 * Shader-displaced cloth rather than a cloth solver — the visual result is
 * indistinguishable at this scale and it costs one draw call.
 *
 * The camera "passes through" the fabric: as the section scrolls, an aperture
 * opens from the centre of the weave and the next act is revealed behind it.
 */
export default function SilkScene({ anchor }: { anchor: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useMemo(() => createSilkMaterial(), []);
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1, 90, 90), []);
  const { read } = useDomSync(anchor);
  const smooth = useRef({ p: 0, z: 0 });

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

    // Runs 0 → 1 across the middle 70% of the section's travel.
    const raw = THREE.MathUtils.clamp((a.through - 0.18) / 0.62, 0, 1);
    s.p = damp(s.p, raw, 5, dt);
    s.z = damp(s.z, raw * 1.5, 3.4, dt);

    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uProgress.value = s.p;
    material.uniforms.uOpacity.value = THREE.MathUtils.smoothstep(a.through, 0.02, 0.16) *
      (1 - THREE.MathUtils.smoothstep(a.through, 0.86, 1));

    m.position.set(a.x, a.y, s.z);
    // Overscale so the cloth always bleeds past the frame edges.
    m.scale.set(a.width * 1.25, a.height * 1.25, 1);
  });

  return (
    <mesh ref={mesh} frustumCulled={false}>
      <primitive object={geometry} attach="geometry" />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
