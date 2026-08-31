"use client";

/* eslint-disable react-hooks/immutability -- Imperative WebGL by design.
   Three.js objects are mutated in place inside useFrame (uniforms, transforms).
   That mutation is the render loop; allocating new objects per frame would be
   a correctness and performance regression. The React Compiler cannot model
   this, so the rule is disabled for this file only. */

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createJasmineBloom, disposeBloom } from "./jasmine";
import { useDomSync } from "./useDomSync";
import { pointer } from "./pointer";
import { damp } from "@/lib/utils";

/**
 * The jasmine. Anchored to a DOM element, drifting with the pointer, breathing
 * on a slow cycle, and pushed gently through space by scroll.
 *
 * Nothing spins. Nothing pulses. It behaves like a flower held in the air.
 */
export default function JasmineBloom({
  anchor,
  seed = 0,
  scale = 1,
  drift = 1,
}: {
  anchor: string;
  seed?: number;
  scale?: number;
  drift?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const bloom = useMemo(() => createJasmineBloom(seed), [seed]);
  const { read } = useDomSync(anchor);
  const smooth = useRef({ x: 0, y: 0, rx: 0, ry: 0, z: 0 });

  useEffect(() => () => disposeBloom(bloom), [bloom]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    const a = read();
    g.visible = a.visible;
    if (!a.visible) return;

    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const s = smooth.current;

    // Pointer parallax — small, damped, never 1:1 with the cursor.
    s.x = damp(s.x, a.x + pointer.x * 0.22 * drift, 3.2, dt);
    s.y = damp(s.y, a.y + pointer.y * 0.14 * drift + Math.sin(t * 0.42) * 0.055, 3.2, dt);
    // Scroll dollies it toward the viewer through the section.
    s.z = damp(s.z, (a.through - 0.5) * 1.35 * drift, 2.4, dt);

    s.ry = damp(s.ry, pointer.x * 0.34 + t * 0.045, 2.6, dt);
    s.rx = damp(s.rx, -0.34 + pointer.y * 0.2, 2.6, dt);

    g.position.set(s.x, s.y, s.z);
    g.rotation.set(s.rx, s.ry, Math.sin(t * 0.3) * 0.045);

    const base = Math.min(a.width, a.height) * 0.42 * scale;
    g.scale.setScalar(base * (1 + Math.sin(t * 0.5) * 0.012));

    // Petals breathe individually — the detail that sells it as organic.
    for (const child of bloom.children) {
      const mesh = child as THREE.Mesh;
      if (mesh.userData.baseTilt === undefined) continue;
      mesh.rotation.x =
        mesh.userData.baseTilt + Math.sin(t * 0.55 + mesh.userData.phase) * 0.035;
    }
  });

  return (
    <group ref={group}>
      <primitive object={bloom} />
    </group>
  );
}
