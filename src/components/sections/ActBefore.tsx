import { sectionEyebrow } from "@/lib/utils";
import type { ImageRef } from "@/lib/types";
import EditorialImage from "@/components/ui/EditorialImage";
import ParallaxFrame from "@/components/ui/ParallaxFrame";
import Reveal from "@/components/ui/Reveal";
import SplitLines from "@/components/ui/SplitLines";

/**
 * ACT I — BEFORE THE BRIDE (§5)
 * The thesis of the whole site, stated in six words.
 */
const PLATES: [ImageRef, ImageRef, ImageRef] = [
  { alt: "Bridal portrait", tone: "bronze", seed: 901 },
  { alt: "Detail study", tone: "ink", seed: 902 },
  { alt: "Close detail", tone: "champagne", seed: 903 },
];

export default function ActBefore({
  index,
  images = PLATES,
}: {
  index: number;
  images?: [ImageRef, ImageRef, ImageRef];
}) {
  return (
    <section
      className="section-dark relative overflow-hidden py-[var(--s-12)] sm:py-[var(--s-16)]"
      aria-labelledby="act-before-title"
    >
      {/* Oversized ghost word — depth cue, not decoration */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-[6vw] top-[8%] select-none font-display text-[26vw] leading-none text-ivory/[0.035]"
      >
        Before
      </span>

      <div className="shell relative grid items-center gap-16 lg:grid-cols-[1fr_0.9fr] lg:gap-24">
        <div>
          <Reveal>
            <p className="eyebrow mb-10">{sectionEyebrow(index, "Before the bride")}</p>
          </Reveal>

          <SplitLines
            as="h2"
            className="display-lg text-ivory"
            lines={["We don’t change her."]}
          />
          <SplitLines
            as="p"
            className="display-lg mt-2 text-champagne"
            lineClassName="italic-serif"
            lines={["We reveal her."]}
            delay={180}
          />

          <Reveal delay={420}>
            <p className="body-lg mt-12 max-w-lg">
              There is a face under the jewellery, the silk and the light. Everything that happens
              in the chair is in service of that face — never in place of it.
            </p>
          </Reveal>

          <Reveal delay={560}>
            <p className="body-base mt-6 max-w-lg">
              A bride should be able to look at a photograph twenty years from now and recognise
              herself in it. That is the whole standard.
            </p>
          </Reveal>
        </div>

        {/* Layered portrait — foreground, plane, background */}
        <ParallaxFrame className="relative mx-auto w-full max-w-lg" strength={1}>
          <Reveal blur>
            <div className="relative aspect-[3/4]">
              {/* Background layer */}
              <div
                className="absolute -left-[7%] -top-[6%] h-[70%] w-[62%]"
                style={{
                  transform:
                    "translate3d(calc(var(--px) * -22px), calc(var(--py) * -18px + var(--sy) * -32px), 0)",
                }}
              >
                <EditorialImage
                  image={images[1]}
                  className="h-full w-full"
                  sizes="(max-width: 1024px) 40vw, 20vw"
                  decorative
                />
              </div>

              {/* Principal plane */}
              <div
                className="absolute inset-0 z-10 shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9)]"
                style={{
                  transform:
                    "translate3d(calc(var(--px) * 12px), calc(var(--py) * 10px + var(--sy) * 18px), 0)",
                }}
              >
                <EditorialImage
                  image={images[0]}
                  className="h-full w-full"
                  sizes="(max-width: 1024px) 90vw, 40vw"
                  badgeLabel="Placeholder"
                />
              </div>

              {/* Foreground fragment */}
              <div
                className="absolute -bottom-[8%] -right-[8%] z-20 h-[38%] w-[44%] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]"
                style={{
                  transform:
                    "translate3d(calc(var(--px) * 34px), calc(var(--py) * 26px + var(--sy) * 46px), 0)",
                }}
              >
                <EditorialImage
                  image={images[2]}
                  className="h-full w-full"
                  sizes="(max-width: 1024px) 40vw, 18vw"
                  decorative
                />
              </div>
            </div>
          </Reveal>
        </ParallaxFrame>
      </div>
    </section>
  );
}
