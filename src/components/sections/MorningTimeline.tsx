import type { TimelineEntry } from "@/lib/types";
import Reveal from "@/components/ui/Reveal";
import SplitLines from "@/components/ui/SplitLines";

/**
 * HER MORNING (§18)
 *
 * The hours before the ceremony as a vertical film strip. The line on the left
 * draws itself as the section enters — a progress rule, not an animation for
 * its own sake.
 *
 * ⚠ Illustrative timings. See content/timeline.ts.
 */
export default function MorningTimeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <section className="section-dark relative py-28 sm:py-40" aria-labelledby="morning-title">
      <div className="shell">
        <div className="grid gap-16 lg:grid-cols-[0.85fr_1fr] lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <p className="eyebrow mb-8">09 — Her morning</p>
            </Reveal>
            <SplitLines
              as="h2"
              id="morning-title"
              className="display-md text-ivory"
              lines={["Her morning."]}
            />
            <Reveal delay={240}>
              <p className="body-lg mt-8 max-w-sm">
                The wedding is a public event. The morning before it is not. It is the last few
                hours in which she is only herself.
              </p>
            </Reveal>
            <Reveal delay={360}>
              <p className="body-base mt-6 max-w-sm text-muted">
                Illustrative. Every real morning is timed backwards from the muhurtham.
              </p>
            </Reveal>
          </div>

          <ol className="relative border-l border-ivory/12 pl-8 sm:pl-12">
            {entries.map((e, i) => (
              <li key={`${e.time}-${i}`} className="relative pb-14 last:pb-0">
                <Reveal delay={i * 90}>
                  <span
                    aria-hidden="true"
                    className="absolute -left-[calc(2rem+3.5px)] top-2 block h-[7px] w-[7px] rounded-full bg-champagne sm:-left-[calc(3rem+3.5px)]"
                  />
                  <p className="font-mono text-[0.68rem] tracking-[0.24em] text-champagne/80">
                    <time>{e.time}</time>
                  </p>
                  <h3 className="display-sm mt-3 text-ivory">{e.title}</h3>
                  {e.note && <p className="body-base mt-3 max-w-md">{e.note}</p>}
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
