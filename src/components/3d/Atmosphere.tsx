"use client";

/* eslint-disable react-hooks/immutability -- Imperative WebGL by design.
   Three.js objects are mutated in place inside useFrame (uniforms, transforms).
   That mutation is the render loop; allocating new objects per frame would be
   a correctness and performance regression. The React Compiler cannot model
   this, so the rule is disabled for this file only. */

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { createAtmosphereMaterial } from "./materials";
import { pointer } from "@/lib/motion/pointer";
import { damp } from "@/lib/utils";

/**
 * The warm void everything else sits inside. One full-screen quad locked to the
 * camera, drifting almost imperceptibly. This is what stops the dark sections
 * reading as flat black.
 */
export default function Atmosphere() {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useMemo(() => createAtmosphereMaterial(), []);
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const { camera, size } = useThree();
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    return () => {
      material.dispose();
      geometry.dispose();
    };
  }, [material, geometry]);

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    const dt = Math.min(delta, 0.05);

    material.uniforms.uTime.value = state.clock.elapsedTime;

    // Sit it just in front of the far plane and scale to fill the frustum.
    const cam = camera as THREE.PerspectiveCamera;
    const z = -6;
    const dist = cam.position.z - z;
    const h = 2 * Math.tan(((cam.fov ?? 45) * Math.PI) / 360) * dist;
    const w = h * (size.width / size.height);

    offset.current.x = damp(offset.current.x, pointer.x * 0.16, 1.6, dt);
    offset.current.y = damp(offset.current.y, pointer.y * 0.1, 1.6, dt);

    m.position.set(offset.current.x, offset.current.y, z);
    m.scale.set(w * 1.2, h * 1.2, 1);
  });

  return (
    <mesh ref={mesh} frustumCulled={false} renderOrder={-1}>
      <primitive object={geometry} attach="geometry" />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
