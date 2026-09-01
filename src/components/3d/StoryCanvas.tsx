"use client";

import dynamic from "next/dynamic";
import { useDeviceCapability } from "@/components/ui/useDeviceCapability";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  STORY CANVAS — the gatekeeper
 * ═══════════════════════════════════════════════════════════════════════════
 *  Deliberately tiny. It holds no Three.js import of its own; it decides
 *  whether this device should get the WebGL layer at all, and only then pulls
 *  the scenes in with a dynamic import.
 *
 *  Consequence: a visitor on a low-power phone, with reduced motion enabled,
 *  or without WebGL never downloads the 3D runtime. They get the complete 2D
 *  experience, which is the baseline the whole site is designed around.
 *
 *  `ssr: false` because there is nothing to server-render — the canvas is
 *  decorative, and every word of the story lives in the DOM regardless.
 * ═══════════════════════════════════════════════════════════════════════════
 */
const StoryScenes = dynamic(() => import("./StoryScenes"), { ssr: false });

export default function StoryCanvas() {
  const cap = useDeviceCapability();

  // The 2D experience is the baseline; WebGL is additive and always optional.
  if (!cap.ready || !cap.allow3D) return null;

  // Phones that do get WebGL keep the atmosphere and jasmine, but not the
  // two heavy shader planes.
  return <StoryScenes light={cap.coarsePointer || cap.lowPower} />;
}
