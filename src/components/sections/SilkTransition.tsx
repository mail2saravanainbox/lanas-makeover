import Reveal from "@/components/ui/Reveal";

/**
 * THE SILK TRANSITION (§9)
 *
 * A tall, otherwise-empty section. The WebGL `SilkScene` binds to the anchor
 * and the camera passes through the cloth into the next act.
 *
 * Without WebGL the same beat still lands — a woven CSS field with a slow
 * sheen sweep. It is quieter, but it is not missing.
 */
export default function SilkTransition({ line }: { line: string }) {
  return (
    <section className="relative flex min-h-[110vh] items-center justify-center overflow-hidden">
      {/* Anchor only — the WebGL cloth binds here. Decorative. */}

      {/* 2D understudy — visible only where the canvas isn't drawing */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-70"
        style={{
          backgroundImage: [
            "repeating-linear-gradient(100deg, rgba(224,205,178,0.055) 0px, rgba(224,205,178,0.055) 1px, transparent 1px, transparent 9px)",
            "radial-gradient(70% 55% at 50% 50%, rgba(160,122,78,0.28) 0%, rgba(10,8,6,0) 72%)",
            "linear-gradient(165deg, #0a0806 0%, #1d1710 48%, #0a0806 100%)",
          ].join(","),
        }}
      />

      <Reveal blur>
        <p className="shell text-center font-display text-[clamp(1.4rem,3.4vw,2.6rem)] italic leading-snug text-champagne/85">
          {line}
        </p>
      </Reveal>
    </section>
  );
}
