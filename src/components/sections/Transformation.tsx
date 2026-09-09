import Reveal from "@/components/ui/Reveal";
import BeforeAfterSlider from "@/components/portfolio/BeforeAfterSlider";
import { sectionEyebrow } from "@/lib/utils";
import type { PortfolioItem } from "@/lib/types";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE TRANSFORMATION (§9)
 * ═══════════════════════════════════════════════════════════════════════════
 *  A before/after comparison, presented as an editorial plate rather than as
 *  the social-media widget this device usually is: one frame, one hairline
 *  handle, two quiet labels, and no arrows shouting SWIPE.
 *
 *  ⚠ IT RENDERS ONLY FROM A GENUINE, PERMISSIONED PAIR.
 *
 *  `beforeAfter` is populated per photograph, by Lana, for a bride who has
 *  agreed to it — the two frames have to be the same woman on the same
 *  morning, and only the artist who was in the room can say that they are.
 *  Nothing here fabricates a pair, crops one photograph into two, or shows a
 *  placeholder standing in for a transformation. With no pair in the archive
 *  this returns null and the homepage simply does not have the section, which
 *  is the correct outcome rather than a degraded one.
 *
 *  The caption is likewise only ever what the item already carries. It never
 *  asserts a technique, a duration or a result.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export default function Transformation({
  index,
  items,
}: {
  index?: number;
  items: PortfolioItem[];
}) {
  const pair = items.find((i) => i.beforeAfter?.before && i.beforeAfter?.after);
  if (!pair?.beforeAfter) return null;

  return (
    <section className="section-dark py-24 sm:py-32" aria-labelledby="transformation-title">
      <div className="shell">
        <Reveal>
          <p className="eyebrow mb-8">{sectionEyebrow(index, "The transformation")}</p>
          <h2 id="transformation-title" className="display-md max-w-[18ch] text-ivory">
            The same face,
            <br />
            <span className="italic-serif text-champagne">revealed.</span>
          </h2>
        </Reveal>

        <Reveal delay={160} className="mt-14">
          <BeforeAfterSlider
            before={pair.beforeAfter.before}
            after={pair.beforeAfter.after}
            label={`Before and after — ${pair.title}`}
          />
        </Reveal>

        {pair.caption && (
          <Reveal delay={280}>
            <p className="body-base measure-note mt-6">{pair.caption}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
