import Reveal from "@/components/ui/Reveal";
import type { TimelineEntry } from "@/lib/types";

/**
 * HER MORNING — the seven steps of a bridal morning.
 *
 * Lifted out of `ActArtist` and given its own component so it can live on
 * /about, where a bride who has decided to read about Lana is already reading.
 * It used to sit on the homepage AND be the longest block in that section:
 * seven timestamped steps between a visitor and the rest of the page.
 *
 * One copy, one place. The homepage links to it.
 */
export default function HerMorning({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <section
      id="her-morning"
      aria-labelledby="morning-title"
      // scroll-mt: the header is fixed, so a link to #her-morning would
      // otherwise land with the heading underneath it.
      className="shell scroll-mt-[calc(var(--nav-h)+2rem)] py-24 sm:py-32"
    >
      <Reveal>
        <p className="eyebrow mb-8">The morning</p>
        <h2 id="morning-title" className="display-md max-w-[16ch] text-ivory">
          Her
          <br />
          <span className="italic-serif text-champagne">morning.</span>
        </h2>
        <p className="body-lg measure mt-6">
          The wedding is a public event. The morning before it is not — it is the last few hours
          in which she is only herself. The order is fixed; the hours are not, because every
          morning is timed backwards from the muhurtham itself.
        </p>
      </Reveal>

      <ol className="relative mt-14 border-l border-ivory/12 pl-8 sm:pl-12">
        {entries.map((e, i) => (
          <li key={`${e.time}-${i}`} className="relative pb-12 last:pb-0">
            <Reveal delay={i * 90}>
              <span
                aria-hidden="true"
                className="absolute -left-[calc(2rem+3.5px)] top-2 block h-[7px] w-[7px] rounded-full bg-champagne sm:-left-[calc(3rem+3.5px)]"
              />
              <p className="text-[0.75rem] uppercase tracking-[0.28em] text-champagne/80">
                {e.time}
              </p>
              <h3 className="display-sm mt-3 text-ivory">{e.title}</h3>
              {e.note && <p className="body-base measure-note mt-3">{e.note}</p>}
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
