"use client";

/* eslint-disable react-hooks/immutability -- Imperative WebGL by design.
   Three.js objects are mutated in place inside useFrame (transforms, camera,
   materials). That mutation is the render loop; allocating per frame would be
   a correctness and performance regression the React Compiler cannot model. */

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { createJasmineStrand, disposeBloom } from "./jasmine";
import { useDomSync } from "./useDomSync";
import { pointer } from "./pointer";
import { clamp, damp, norm } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE FIRST FLOWER — the opening sequence
 * ═══════════════════════════════════════════════════════════════════════════
 *  Five phases driven by one scroll value. The whole point is that the flower
 *  is not decoration — it is the camera's subject, then its path, then the
 *  portal through which the bride arrives.
 *
 *    0.00–0.18  ONE FLOWER, very close, almost still. Texture and breath.
 *    0.18–0.38  The camera drifts around it. A strand is discovered.
 *    0.38–0.58  The strand travels across the frame.
 *    0.58–0.78  It crosses the lens and becomes the transition.
 *    0.78–1.00  Pull back. The bride is behind it.
 *
 *  CAMERA LANGUAGE, not keyframed spinning: dolly, orbit, focal drift. Every
 *  movement is damped, so scrubbing quickly never snaps.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export default function HeroSequence({ anchor }: { anchor: string }) {
  const root = useRef<THREE.Group>(null);
  const { group, blooms } = useMemo(() => createJasmineStrand(7), []);
  const { read } = useDomSync(anchor);
  const { camera } = useThree();

  const s = useRef({ p: 0, camZ: 5, camY: 0, camX: 0, rotY: 0, rotX: 0, scale: 1 });
  const restZ = useRef(5);

  useEffect(() => {
    restZ.current = camera.position.z;
    return () => {
      disposeBloom(group);
      camera.position.set(0, 0, restZ.current);
      camera.lookAt(0, 0, 0);
    };
  }, [group, camera]);

  useFrame((state, delta) => {
    const g = root.current;
    if (!g) return;

    const a = read();
    g.visible = a.visible;
    if (!a.visible) return;

    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const p = a.pinned;

    s.current.p = damp(s.current.p, p, 6, dt);
    const P = s.current.p;

    // ── Phase weights ─────────────────────────────────────────────────────
    const discover = norm(P, 0.18, 0.38); // strand revealed
    const travel = norm(P, 0.38, 0.58); // strand crosses
    const cross = norm(P, 0.58, 0.78); // passes the lens
    const pullback = norm(P, 0.78, 1.0); // bride behind

    // ── Camera: dolly in on the flower, then pull away to the portrait ────
    // Starts intimate (close), ends wide. Nothing ever cuts.
    const targetZ = 1.55 + discover * 0.9 + travel * 0.55 + pullback * 2.4;
    const targetY = discover * 0.16 - pullback * 0.1;
    // A slight lateral drift as the strand travels — the camera follows it.
    const targetX = travel * 0.5 - cross * 0.85 + pointer.x * 0.06;

    s.current.camZ = damp(s.current.camZ, targetZ, 3.2, dt);
    s.current.camY = damp(s.current.camY, targetY, 3.2, dt);
    s.current.camX = damp(s.current.camX, targetX, 3.2, dt);

    camera.position.set(s.current.camX, s.current.camY, s.current.camZ);
    camera.lookAt(0, s.current.camY * 0.4, 0);

    // ── The strand ────────────────────────────────────────────────────────
    // Phase 1: a single bloom fills the frame, breathing, barely moving.
    // Phase 3–4: the whole strand slides across and past the lens.
    const slide = travel * 1.9 + cross * 3.4;
    const rise = discover * 0.1 + cross * 0.35;

    s.current.rotY = damp(
      s.current.rotY,
      // Slow reveal of the strand's length, plus a whisper of pointer parallax.
      -0.35 + discover * 0.55 + travel * 0.3 + pointer.x * 0.12,
      2.4,
      dt,
    );
    s.current.rotX = damp(s.current.rotX, -0.12 + pointer.y * 0.07 - pullback * 0.2, 2.4, dt);

    g.position.set(-slide, rise + Math.sin(t * 0.32) * 0.012, cross * 1.6);
    g.rotation.set(s.current.rotX, s.current.rotY, Math.sin(t * 0.24) * 0.02);

    // The strand recedes as the bride takes the frame.
    const scale = 1 - pullback * 0.45;
    s.current.scale = damp(s.current.scale, scale, 3, dt);
    g.scale.setScalar(s.current.scale);

    // ── Per-bloom life ────────────────────────────────────────────────────
    // Only the centre bloom exists at first; its neighbours fade in as the
    // camera pulls back and discovers the strand.
    for (const bloom of blooms) {
      const centrality = 1 - Math.abs((bloom.userData.t as number) - 0.5) * 2;
      const revealAt = (1 - centrality) * 0.55;
      const on = clamp(norm(P, revealAt, revealAt + 0.22));
      const visible = centrality > 0.92 ? 1 : on;

      bloom.visible = visible > 0.02;
      bloom.scale.setScalar(
        (0.36 * (1 - (1 - centrality) * 0.34)) * (0.55 + visible * 0.45) *
          (1 + Math.sin(t * 0.5 + bloom.userData.index) * 0.014),
      );

      // Petals breathe individually — the detail that reads as organic.
      for (const child of bloom.children) {
        const mesh = child as THREE.Mesh;
        if (mesh.userData.baseTilt === undefined) continue;
        mesh.rotation.x =
          mesh.userData.baseTilt + Math.sin(t * 0.5 + mesh.userData.phase) * 0.03;
      }
    }
  });

  return (
    <group ref={root}>
      <primitive object={group} />
    </group>
  );
}
