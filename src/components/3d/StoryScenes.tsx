"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import * as THREE from "three";
import { bindPointer } from "@/lib/motion/pointer";
import Atmosphere from "./Atmosphere";
import JasmineBloom from "./JasmineBloom";
import HeroSequence from "./HeroSequence";
import SilkScene from "./SilkScene";
import TransformationScene from "./TransformationScene";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE STORY SCENES — the heavy half of the canvas
 * ═══════════════════════════════════════════════════════════════════════════
 *  This module owns EVERY Three.js / R3F import in the application, and it is
 *  reached only through a dynamic import in StoryCanvas.tsx. That is what keeps
 *  ~350 KB of 3D runtime out of the bundle for visitors who will never see it:
 *  no WebGL, reduced motion, or a low-power phone.
 *
 *  `light` is decided by the caller — phones that do get WebGL keep the
 *  atmosphere and the jasmine but skip the two heavy shader planes.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE STORY CANVAS
 * ═══════════════════════════════════════════════════════════════════════════
 *  ONE fixed WebGL surface behind the whole document. Every scene inside it
 *  binds itself to a plain DOM element via `data-scene="…"`, so the 3D layer
 *  follows the HTML rather than replacing it.
 *
 *  Consequences, all deliberate:
 *   · No scroll-jacking — the page scrolls natively, WebGL follows.
 *   · Removing this component leaves a complete, premium 2D site (§35).
 *   · Content stays in the DOM: crawlable, selectable, screen-readable.
 *   · Scenes whose anchor is absent on the current route cost nothing.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function StoryScenes({ light }: { light: boolean }) {
  useEffect(() => bindPointer(), []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      data-story-canvas=""
    >
      <Canvas
        gl={{
          antialias: !light,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.06,
        }}
        dpr={light ? [1, 1.4] : [1, 1.75]}
        camera={{ position: [0, 0, 5], fov: 45, near: 0.1, far: 60 }}
        performance={{ min: 0.45 }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <Atmosphere />

          {/* Warm key, champagne rim. Two lights, deliberately. */}
          <ambientLight intensity={0.55} color="#6b5a44" />
          <directionalLight position={[2.4, 3.2, 4]} intensity={2.3} color="#ffe9c9" />
          <directionalLight position={[-3.2, 1.4, -2.2]} intensity={1.5} color="#c9a96a" />

          {/* THE FIRST FLOWER — the opening sequence owns the camera */}
          <HeroSequence anchor="[data-scene='hero-track']" />

          {/* ACT IV — a smaller bloom drifting through the heritage act */}
          <JasmineBloom anchor="[data-scene='heritage-jasmine']" seed={3} scale={0.72} drift={0.6} />

          {!light && (
            <>
              <TransformationScene
                anchor="[data-scene='transformation']"
                trackAnchor="[data-scene='transformation-track']"
              />
              <SilkScene anchor="[data-scene='silk']" />
            </>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
