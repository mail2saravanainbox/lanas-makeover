import type { Metadata } from "next";
import Link from "next/link";
import { content } from "@/lib/content/provider";
import { rentalCategories } from "@/content/rental-categories";
import { rentalItems, rentalItemsFor } from "@/content/rental";
import {
  rentalTrichyFaqs,
  rentalTrichySections,
  rentalTrichySteps,
} from "@/content/rental-trichy";
import { locationHref } from "@/content/location-slugs";
import { siteSettings } from "@/content/site";
import {
  breadcrumbSchema,
  faqSchema,
  pageMetadata,
  rentalCityServiceSchema,
} from "@/lib/seo";
import PageHeader from "@/components/ui/PageHeader";
import RentalGrid from "@/components/rental/RentalGrid";
import Reveal from "@/components/ui/Reveal";
import JsonLd from "@/components/ui/JsonLd";
import ClosingCTA from "@/components/sections/ClosingCTA";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  RENTAL JEWELLERY IN TRICHY
 * ═══════════════════════════════════════════════════════════════════════════
 *  The showroom, not the directory. `/rental-jewellery` shows four covers and
 *  sends a bride onward; this page puts the entire collection in front of her
 *  on one URL and answers the city-specific question underneath it.
 *
 *  See `src/content/rental-trichy.ts` for why the two pages are not the same
 *  page twice, and for the commercial facts this page is still silent about.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CITY = "Trichy";
const PATH = "/rental-jewellery-trichy";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  /**
   * The query, in the order it is typed, then the thing she is actually
   * looking for, then the brand. Three clauses and no fourth — anything past
   * about sixty characters is truncated in a result anyway.
   */
  title: "Rental Jewellery in Trichy | Bridal Jewellery Sets",
  description: `${rentalItems().length} bridal jewellery sets on rent in ${CITY} — temple jewellery, American diamond, chokers and haram. Photographed at full size. Send your date for availability and terms.`,
  path: PATH,
});

export default async function Page() {
  const settings = await content().getSiteSettings();
  const items = rentalItems();
  const total = items.length;

  const description = `Bridal jewellery on rent in ${CITY} — ${total} sets across temple jewellery, American diamond, choker and necklace sets.`;

  return (
    <>
      <JsonLd
        data={[
          rentalCityServiceSchema({ city: CITY, path: PATH, description, count: total }),
          // The same questions the page renders, in the same words.
          faqSchema(rentalTrichyFaqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Jewellery Rental", path: "/rental-jewellery" },
            { name: CITY, path: PATH },
          ]),
        ]}
      />

      <PageHeader
        eyebrow={`${total} sets · ${CITY}`}
        titleLines={["Rental jewellery", "in Trichy."]}
        intro={`Bridal jewellery on rent in the home city — temple gold, American diamond, chokers and haram, chosen alongside the makeup rather than separately from it.`}
        breadcrumb={[
          { name: "Home", href: "/" },
          { name: "Jewellery Rental", href: "/rental-jewellery" },
          { name: CITY, href: PATH },
        ]}
      />

      {/* ── THE COLLECTION FIRST ───────────────────────────────────────────
          A bride who searched "bridal jewellery on rent in Trichy" came to
          look at jewellery. The essay is underneath it, where an essay
          belongs, and the catalogue is above the fold after the header.
          RentalGrid holds 24 in the DOM and pages the rest, so the whole
          hundred and thirty-three costs one screen's worth of images. */}
      <section aria-label={`Bridal jewellery sets for rent in ${CITY}`} className="shell pb-14">
        <RentalGrid items={items} />
      </section>

      {/* ── THE FOUR ROOMS ─────────────────────────────────────────────────
          Counted, never typed. These are the same four pages the hub links
          to; a bride who wants one register rather than all of them should
          not have to scroll a hundred and thirty-three frames to find it. */}
      <section aria-labelledby="rooms" className="shell pb-20">
        <Reveal>
          <h2 id="rooms" className="eyebrow mb-6">
            By register
          </h2>
        </Reveal>
        <ul className="flex flex-wrap gap-x-10 gap-y-4">
          {rentalCategories.map((c) => (
            <li key={c.slug}>
              <Reveal>
                <Link
                  href={`/rental-jewellery/${c.slug}`}
                  className="tap link-wipe font-display text-2xl text-ivory transition-colors duration-[var(--d-base)] hover:text-champagne"
                >
                  {c.name}
                  <span className="ml-3 align-middle text-[0.7rem] uppercase tracking-[0.2em] text-champagne/70">
                    {rentalItemsFor(c.key).length}
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* ── WHAT A TRICHY WEDDING ASKS OF A SET ────────────────────────────
          The part that could not be written about another city. */}
      <section aria-label={`Choosing bridal jewellery for a ${CITY} wedding`} className="shell pb-8">
        {rentalTrichySections.map((s, i) => (
          <Reveal key={s.heading} delay={(i % 2) * 90}>
            <div className="measure mb-14">
              <h2 className="font-display text-2xl text-ivory sm:text-3xl">{s.heading}</h2>
              <div className="mt-5 space-y-5">
                {s.body.map((p, j) => (
                  <p key={j} className="body-lg">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ── HOW RENTING ACTUALLY WORKS ─────────────────────────────────────
          Four steps, none of them invented. Step three is deliberately
          "terms come back", not a figure. */}
      <section aria-labelledby="how" className="shell pb-20">
        <Reveal>
          <h2 id="how" className="eyebrow mb-8">
            How it works
          </h2>
        </Reveal>
        <ol className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {rentalTrichySteps.map((s, i) => (
            <li key={s.step}>
              <Reveal delay={(i % 2) * 100}>
                <p className="text-[0.7rem] uppercase tracking-[0.24em] text-champagne/70">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 font-display text-xl text-ivory">{s.step}</h3>
                <p className="body-base mt-3 max-w-md">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* ── THE MAKEUP, WHICH IS THE OTHER HALF ────────────────────────────
          A descriptive anchor, not "click here", and the one internal link
          on this page that most needs to exist: the two lines of business
          are the same morning. */}
      <section className="shell pb-20">
        <Reveal>
          <div className="measure border-l border-champagne/30 pl-5">
            <p className="body-lg">
              The jewellery and the face are chosen against each other. If the wedding is also in
              the home city, start with the{" "}
              <Link href={locationHref("trichy")} className="link-wipe text-champagne">
                bridal makeup artist in Trichy
              </Link>{" "}
              page — the morning is planned once, for both.
            </p>
            <p className="body-base mt-4">
              {settings.travelNote} Based in {siteSettings.location}.
            </p>
            <Link href="/contact" className="btn mt-8">
              {settings.bookingCta}
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Native <details>, same as the city pages: keyboard-operable and
          screen-reader-announced with no ARIA, and — the reason it beats a
          div accordion on an SEO page — every answer stays in the DOM, so it
          is indexed whether or not anyone opens it. */}
      <section aria-labelledby="faq" className="section-dark py-20 sm:py-24">
        <div className="shell">
          <Reveal>
            <p className="eyebrow mb-6">Renting in {CITY}</p>
            <h2 id="faq" className="display-sm max-w-[18ch] text-ivory">
              Before you
              <br />
              <span className="italic-serif text-champagne">enquire.</span>
            </h2>
          </Reveal>

          <div className="measure mt-10 divide-y divide-ivory/10 border-y border-ivory/10">
            {rentalTrichyFaqs.map((f) => (
              <details key={f.question} className="group [&>summary]:list-none">
                <summary className="flex min-h-11 cursor-pointer list-none items-start justify-between gap-6 py-6 text-ivory transition-colors duration-[var(--d-base)] hover:text-champagne [&::-webkit-details-marker]:hidden">
                  <h3 className="font-display text-lg">{f.question}</h3>
                  <span
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-champagne/70 transition-transform duration-[var(--d-base)] group-open:rotate-45"
                  >
                    <svg width="13" height="13" viewBox="0 0 14 14">
                      <path d="M7 0v14M0 7h14" stroke="currentColor" strokeWidth="1" fill="none" />
                    </svg>
                  </span>
                </summary>
                <p className="body-base max-w-2xl pb-7 pr-10">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <ClosingCTA settings={settings} />
    </>
  );
}
