import type { ImageRef } from "@/lib/types";
import EditorialImage from "@/components/ui/EditorialImage";
import ParallaxFrame from "@/components/ui/ParallaxFrame";
import Reveal from "@/components/ui/Reveal";
import SplitLines from "@/components/ui/SplitLines";
import type { MediaTone } from "@/lib/types";

/**
 * WHERE THE MAGIC HAPPENS (§21)
 * The atelier. Trust-building, deliberately unglamorous in its subject matter
 * and rigorously composed in its layout.
 */
const FRAMES: Array<{
  label: string;
  tone: MediaTone;
  seed: number;
  col: string;
  ratio: string;
}> = [
  { label: "The kit, laid out before anyone is awake", tone: "ink", seed: 851, col: "sm:col-span-7", ratio: "aspect-[16/11]" },
  { label: "Skin, first", tone: "ivory", seed: 852, col: "sm:col-span-5", ratio: "aspect-[3/4]" },
  { label: "The first brushstroke", tone: "bronze", seed: 853, col: "sm:col-span-5", ratio: "aspect-[3/4]" },
  { label: "Setting the jadai", tone: "champagne", seed: 854, col: "sm:col-span-7", ratio: "aspect-[16/11]" },
];

const PLATES: ImageRef[] = FRAMES.map((f) => ({ alt: f.label, tone: f.tone, seed: f.seed }));

export default function Atelier({ images = PLATES }: { images?: ImageRef[] }) {
  return (
    <section className="section-dark relative py-[var(--s-12)] sm:py-[var(--s-16)]" aria-labelledby="atelier-title">
      <div className="shell">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow mb-8">Behind the scenes</p>
          </Reveal>
          <SplitLines
            as="h2"
            id="atelier-title"
            className="display-md text-ivory"
            lines={["Where the magic", "happens."]}
          />
          <Reveal delay={260}>
            <p className="body-lg mt-8">
              Most of a bridal morning is quiet, unphotogenic and entirely technical. It is also
              where the result is decided.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-12">
          {FRAMES.map((f, i) => (
            <figure key={f.label} className={f.col}>
              <Reveal blur delay={i * 120}>
                <ParallaxFrame strength={0.45}>
                  <div
                    className={`relative w-full overflow-hidden ${f.ratio}`}
                    style={{ transform: "translate3d(0, calc(var(--sy) * 16px), 0)" }}
                  >
                    <EditorialImage
                      image={images[i] ?? PLATES[i]}
                      className="absolute inset-0 h-full w-full"
                      sizes="(max-width: 640px) 92vw, 46vw"
                      decorative
                    />
                  </div>
                </ParallaxFrame>
                <figcaption className="mt-4 text-xs uppercase tracking-[0.2em] text-muted">
                  {f.label}
                </figcaption>
              </Reveal>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
