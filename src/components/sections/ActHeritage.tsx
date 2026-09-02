"use client";

import { useEffect, useRef, useState } from "react";
import type { ImageRef, MediaTone } from "@/lib/types";
import EditorialImage from "@/components/ui/EditorialImage";
import Reveal from "@/components/ui/Reveal";
import SplitLines from "@/components/ui/SplitLines";
import KolamGrid from "./KolamGrid";
import { sectionEyebrow } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  MATERIAL → BRIDE — three panels, no pin
 * ═══════════════════════════════════════════════════════════════════════════
 *  Not an information block about Tamil materials. A sequence.
 *
 *    SILK      close on the weave      → she is wearing it
 *    GOLD      close on the setting    → she is wearing it
 *    JASMINE   close on the strand     → it is in her hair
 *                                      → THE BRIDE
 *
 *  Each material holds, then the bride is revealed carrying it. That is the
 *  whole grammar of the site in miniature: the detail always resolves into
 *  the woman.
 *
 *  This used to be a 320vh scroll track with one sticky frame, which meant
 *  three panels' worth of content cost three viewports of scrolling and could
 *  only be read in one direction at one speed. It is now three ordinary 100vh
 *  panels that reveal themselves on arrival. Same grammar, a third of the
 *  scroll, and every panel reachable by keyboard.
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface Material {
  name: string;
  line: string;
  note: string;
  tone: MediaTone;
  seed: number;
  brideTone: MediaTone;
  brideSeed: number;
}

const MATERIALS: Material[] = [
  {
    name: "Silk",
    line: "Woven in three parts, joined at the border.",
    note: "Kanchipuram holds its own weight — which is why it photographs like architecture.",
    tone: "bronze",
    seed: 601,
    brideTone: "rose",
    brideSeed: 611,
  },
  {
    name: "Gold",
    line: "Cast heavy, worn in layers.",
    note: "Vanki, oddiyanam, temple work. Set last, because it changes the balance of everything set before it.",
    tone: "champagne",
    seed: 602,
    brideTone: "bronze",
    brideSeed: 612,
  },
  {
    name: "Jasmine",
    line: "Measured in muzham, not in stems.",
    note: "It wilts. It is the one part of the look with a running clock — and the part that frames the silhouette.",
    tone: "olive",
    seed: 603,
    brideTone: "ivory",
    brideSeed: 613,
  },
];

/**
 * One material. Holds its close-up, then opens an aperture onto the bride
 * wearing it when the panel arrives in view.
 */
function Panel({
  material,
  closeUp,
  bride,
  reduced,
}: {
  material: Material;
  closeUp: ImageRef;
  bride: ImageRef;
  reduced: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setOpen(true);
          io.disconnect();
        }
      },
      // 0.6 — the panel is properly on screen, not merely touching the edge.
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  /** Hover (or tap) plays the reveal again: closed, then open. */
  function replay() {
    if (reduced) return;
    setOpen(false);
    window.setTimeout(() => setOpen(true), 60);
  }

  // Reduced motion is open by definition — derived, not set in an effect.
  const p = open || reduced ? 1 : 0;

  return (
    <section
      ref={ref}
      aria-label={material.name}
      className="relative flex min-h-[100dvh] items-end overflow-hidden"
      onMouseEnter={replay}
      onClick={replay}
    >
      {/* THE BRIDE — she is wearing it */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          clipPath: reduced ? undefined : `circle(${p * 115}% at 50% 45%)`,
          opacity: reduced ? 1 : Math.min(1, p * 1.3),
          transform: `scale(${1.1 - p * 0.1})`,
          transition: reduced
            ? undefined
            : "clip-path calc(var(--d-slow) * 2) var(--ease-silk), opacity var(--d-slow) var(--ease-silk), transform calc(var(--d-slow) * 2) var(--ease-silk)",
        }}
      >
        <EditorialImage image={bride} className="h-full w-full" sizes="100vw" decorative />
      </div>

      {/* THE MATERIAL — close, then gone. Under reduced motion it stays as a
          corner thumbnail rather than disappearing: the close-up is content,
          not a transition. */}
      {reduced ? (
        <div className="absolute right-6 top-6 z-10 aspect-square w-[40%] max-w-[18rem] overflow-hidden border border-ivory/15">
          <EditorialImage image={closeUp} className="h-full w-full" sizes="40vw" decorative />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            opacity: 1 - p,
            transform: `scale(${1 + p * 0.12})`,
            transition:
              "opacity var(--d-slow) var(--ease-silk), transform calc(var(--d-slow) * 2) var(--ease-silk)",
          }}
        >
          <EditorialImage image={closeUp} className="h-full w-full" sizes="100vw" decorative />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/55" />

      <div className="shell relative z-10 pb-[12vh]">
        <p className="display-lg text-ivory">{material.name}</p>
        <p className="italic-serif mt-4 max-w-xl text-[clamp(1.05rem,2vw,1.5rem)] text-champagne">
          {material.line}
        </p>
        <p className="body-base measure-note mt-5">{material.note}</p>
      </div>
    </section>
  );
}

export default function ActHeritage({
  index,
  images = [],
  details = [],
}: {
  index: number;
  images?: ImageRef[];
  /** Macro close-ups from the deleted DetailArt section, preferred for the
      material frames — a macro of a weave says "silk" where a bridal portrait
      says "bride". */
  details?: ImageRef[];
}) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(
      () => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches),
      0,
    );
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section aria-labelledby="heritage-title" className="section-dark relative">
      <KolamGrid
        className="pointer-events-none absolute right-[4%] top-[6%] z-10 h-[30rem] w-[30rem] text-champagne/[0.09]"
        cells={7}
      />

      <div className="shell relative z-10 pb-16 pt-[var(--s-12)] sm:pt-[var(--s-16)]">
        <Reveal>
          <p className="eyebrow mb-8">{sectionEyebrow(index, "Silk · Gold · Jasmine")}</p>
        </Reveal>
        <SplitLines
          as="h2"
          id="heritage-title"
          className="display-md max-w-[20ch] text-ivory"
          lines={["Silk, gold and jasmine", "are not decoration."]}
        />
        <Reveal delay={280}>
          <p className="body-lg mt-8 max-w-xl">
            They are the conditions the work has to survive.
          </p>
        </Reveal>
      </div>

      {MATERIALS.map((m, i) => (
        <Panel
          key={m.name}
          material={m}
          closeUp={details[i] ?? images[i * 2] ?? { alt: m.name, tone: m.tone, seed: m.seed }}
          bride={
            images[i * 2 + 1] ?? { alt: `${m.name} worn`, tone: m.brideTone, seed: m.brideSeed }
          }
          reduced={reduced}
        />
      ))}

      {/* The resolution of the sequence */}
      <div className="shell relative z-10 py-24 text-center sm:py-32">
        <Reveal blur>
          <p className="display-md text-ivory">
            And then, <span className="italic-serif text-champagne">the bride.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
