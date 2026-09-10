import Reveal from "@/components/ui/Reveal";
import { publishedTrustSignals } from "@/content/trust";
import { sectionEyebrow } from "@/lib/utils";

/**
 * TRUST (§19)
 *
 * Four plain statements, no icons, no counters animating up from zero. The
 * section renders only the signals that are verified — see `src/content/trust.ts`
 * — so it grows as real facts arrive and never pads itself in the meantime.
 *
 * Returns null on an empty set rather than rendering an empty heading, which
 * is the behaviour every optional section on this site shares.
 */
export default function TrustSignals({
  index,
  omit = [],
}: {
  index?: number;
  /**
   * Labels this page has already made a section out of.
   *
   * On /about, "Four cities" and "Travel" were rendered here word for word
   * about a screen and a half after the Locations section said the same two
   * things at display size — the same fact twice on one page, which reads as
   * padding rather than as reassurance.
   *
   * Nothing leaves trust.ts. The signal is withheld from ONE page that has
   * already made it, so the day this section appears anywhere else it arrives
   * complete.
   */
  omit?: string[];
}) {
  const signals = publishedTrustSignals().filter((s) => !omit.includes(s.label));
  if (signals.length === 0) return null;

  return (
    <section className="section-dark py-24 sm:py-32" aria-labelledby="trust-title">
      <div className="shell">
        <Reveal>
          <p className="eyebrow mb-8">{sectionEyebrow(index, "What is certain")}</p>
          <h2 id="trust-title" className="display-md max-w-[18ch] text-ivory">
            What you can
            <br />
            <span className="italic-serif text-champagne">count on.</span>
          </h2>
        </Reveal>

        <ul className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {signals.map((s, i) => (
            <li key={s.label}>
              <Reveal delay={(i % 4) * 110}>
                <h3 className="border-t border-champagne/30 pt-5 font-display text-xl text-champagne">
                  {s.label}
                </h3>
                <p className="body-base mt-4">{s.detail}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
