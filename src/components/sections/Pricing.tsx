import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { sectionEyebrow } from "@/lib/utils";
import { formatRupees, pricing, publishedPackages } from "@/content/pricing";
import { siteSettings } from "@/content/site";

/**
 * PRICING TRANSPARENCY (§11)
 *
 * Two states, one component.
 *
 *   PUBLISHED   a floor per service — "From ₹XX,XXX" — under one qualifier
 *               that applies to all of them.
 *   UNPUBLISHED no figures, and the section says so in as many words. What it
 *               shows instead is what actually moves the number, which is
 *               genuinely useful to a bride budgeting a wedding and is true
 *               whether or not a figure has been set.
 *
 * The second state is not a placeholder pretending to be content. It is the
 * honest version of this section, and it stays correct forever; publishing
 * real figures is a two-line edit in `src/content/pricing.ts`.
 */
export default function Pricing({ index }: { index?: number }) {
  const packages = publishedPackages();

  return (
    <section className="section-dark py-24 sm:py-36" aria-labelledby="pricing-title">
      <div className="shell">
        <Reveal>
          <p className="eyebrow mb-8">{sectionEyebrow(index, "The investment")}</p>
          <h2 id="pricing-title" className="display-md max-w-[16ch] text-ivory">
            What it
            <br />
            <span className="italic-serif text-champagne">costs.</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-24">
          <Reveal delay={120}>
            {packages.length > 0 ? (
              <>
                <dl className="divide-y divide-ivory/10 border-y border-ivory/10">
                  {packages.map((p) => (
                    <div key={p.service} className="flex items-baseline justify-between gap-6 py-5">
                      <dt className="font-display text-xl text-ivory">{p.service}</dt>
                      <dd className="shrink-0 text-right">
                        <span className="text-[0.75rem] uppercase tracking-[0.24em] text-muted">
                          From{" "}
                        </span>
                        <span className="font-display text-xl text-champagne">
                          {formatRupees(p.from)}
                        </span>
                        {p.unit && (
                          <span className="block text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                            {p.unit}
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="body-base mt-6">{pricing.qualifier}</p>
              </>
            ) : (
              /* No figure has been supplied, and none is invented (§38). */
              <div className="border-y border-ivory/10 py-8">
                <p className="display-sm text-ivory/85">
                  Pricing is quoted per wedding, not per price list.
                </p>
                <p className="body-base mt-5">
                  {pricing.qualifier} Send the date and the events and you will be given a figure
                  for your wedding rather than a range that turns out not to apply to it.
                </p>
              </div>
            )}

            <Link href="/contact" className="btn mt-10">
              {siteSettings.bookingCta}
            </Link>
          </Reveal>

          <Reveal delay={240}>
            <h3 className="eyebrow mb-6">What moves the number</h3>
            <ul className="space-y-4">
              {pricing.factors.map((f) => (
                <li key={f} className="flex gap-4 text-sm leading-relaxed text-ivory/70">
                  <span aria-hidden="true" className="mt-2.5 h-px w-5 shrink-0 bg-champagne/50" />
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
