import Link from "next/link";
import type { LocationConfig } from "@/content/locations";
import { locationHref, locations } from "@/content/locations";
import type { PortfolioItem, Service, SiteSettings } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";
import Reveal from "@/components/ui/Reveal";
import ClosingCTA from "@/components/sections/ClosingCTA";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ONE CITY
 * ═══════════════════════════════════════════════════════════════════════════
 *  Shared layout, four genuinely different pages — the code is common, the
 *  words are not. See the header of src/content/locations.ts for why that
 *  distinction is the whole point of these pages existing.
 *
 *  The gallery is capped at four and drawn from that city's own categories,
 *  because the mobile audit's finding was that the archive was already being
 *  shown seven times over. Four more pages must not make it eleven.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export default function LocationPage({
  config,
  items,
  services,
  settings,
}: {
  config: LocationConfig;
  items: PortfolioItem[];
  services: Service[];
  settings: SiteSettings;
}) {
  const others = locations.filter((l) => l.slug !== config.slug);
  /**
   * The base city is the one with no journey in it — `distanceKm: null` is
   * already how locations.ts says so, and reading it here means the jewellery
   * link below cannot point at a Trichy page from a Madurai bride if the base
   * ever moves.
   */
  const isBase = config.distanceKm === null;

  return (
    <>
      <PageHeader
        eyebrow={`Serving ${config.city}`}
        titleLines={config.titleLines}
        intro={config.intro}
        breadcrumb={[
          { name: "Home", href: "/" },
          { name: "Locations", href: "/locations" },
          { name: config.city, href: locationHref(config.slug) },
        ]}
      />

      {/* ── The city itself ─────────────────────────────────────────────── */}
      <div className="shell pb-20">
        <div className="measure space-y-20">
          {config.sections.map((s, i) => (
            <section key={s.heading} aria-labelledby={`loc-${i}`}>
              <Reveal>
                <h2 id={`loc-${i}`} className="display-sm max-w-[20ch] text-ivory">
                  {s.heading}
                </h2>
              </Reveal>
              <div className="mt-7 space-y-5">
                {s.body.map((p, j) => (
                  <Reveal key={j} delay={80 + j * 80}>
                    <p className="body-lg">{p}</p>
                  </Reveal>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* ── The work ────────────────────────────────────────────────────────
          Four, from this city's own rooms of the archive, and the archive is
          named rather than duplicated. */}
      {items.length > 0 && (
        <section aria-labelledby="loc-work" className="pb-20">
          <div className="shell mb-10 flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="loc-work" className="display-sm text-ivory">
              Selected work
            </h2>
            <Link href="/portfolio" className="tap link-wipe eyebrow !text-champagne">
              The full archive
            </Link>
          </div>
          <PortfolioGrid items={items} showFilters={false} />
        </section>
      )}

      {/* ── What she is asked for ──────────────────────────────────────────
          Named and linked, never re-described: the service pages are the
          canonical account of the work. */}
      {services.length > 0 && (
        <section aria-labelledby="loc-services" className="shell pb-20">
          <Reveal>
            <p className="eyebrow mb-6">In {config.city}</p>
            <h2 id="loc-services" className="display-sm max-w-[18ch] text-ivory">
              What she is
              <br />
              <span className="italic-serif text-champagne">asked for.</span>
            </h2>
          </Reveal>

          <ul className="mt-10 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <li key={s.slug}>
                <Reveal delay={(i % 3) * 90}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="group flex min-h-11 items-baseline justify-between gap-4 border-b border-ivory/10 py-4"
                  >
                    <span className="font-display text-xl text-ivory transition-colors duration-[var(--d-base)] group-hover:text-champagne">
                      {s.name}
                    </span>
                    <span className="shrink-0 text-[0.75rem] uppercase tracking-[0.2em] text-champagne/70">
                      View
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Questions from this city ────────────────────────────────────────
          Native <details>, matching /faq — and the same items feed the
          FAQPage schema on the route, so what a rich result shows is exactly
          what the page says. */}
      {config.faqs.length > 0 && (
        <section aria-labelledby="loc-faq" className="section-dark py-20 sm:py-24">
          <div className="shell">
            <Reveal>
              <p className="eyebrow mb-6">Asked about {config.city}</p>
              <h2 id="loc-faq" className="display-sm max-w-[18ch] text-ivory">
                Before you
                <br />
                <span className="italic-serif text-champagne">enquire.</span>
              </h2>
            </Reveal>

            <div className="measure mt-10 divide-y divide-ivory/10 border-y border-ivory/10">
              {config.faqs.map((f) => (
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

            <Reveal delay={200}>
              <p className="body-base mt-10">
                More in the{" "}
                <Link href="/faq" className="link-wipe text-champagne">
                  full FAQ
                </Link>
                .
              </p>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── The jewellery, which is the other half of the morning ───────────
          Four city pages linked to no jewellery page at all, which left the
          second line of business with nothing pointing at it from the pages
          brides actually land on. The Trichy page gets its own city URL; the
          other three get the catalogue, because a Chennai-specific jewellery
          page does not exist and inventing one would be a doorway. */}
      <section className="shell pt-4">
        <Reveal>
          <div className="measure border-l border-champagne/30 pl-5">
            <p className="body-lg">
              {isBase ? (
                <>
                  Lana also rents bridal jewellery. If the wedding is here, the sets and the face
                  are settled in one conversation —{" "}
                  <Link href="/rental-jewellery-trichy" className="link-wipe text-champagne">
                    bridal jewellery on rent in {config.city}
                  </Link>
                  .
                </>
              ) : (
                <>
                  Lana also rents bridal jewellery — temple gold, American diamond, chokers and
                  haram. Browse the{" "}
                  <Link href="/rental-jewellery" className="link-wipe text-champagne">
                    jewellery available to rent
                  </Link>{" "}
                  and send it with your date; how a set reaches {config.city} is confirmed
                  directly.
                </>
              )}
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── The other cities ────────────────────────────────────────────────
          Four pages that never link to each other are four orphans. This is
          the lateral path — for a bride whose venue turns out to be somewhere
          else, and for a crawler that arrived on one of them from search. */}
      <section aria-labelledby="loc-others" className="shell py-16">
        <h2 id="loc-others" className="eyebrow mb-6">
          Also serving
        </h2>
        <ul className="flex flex-wrap gap-x-10 gap-y-0 lg:gap-y-4">
          {others.map((l) => (
            <li key={l.slug}>
              <Link
                href={locationHref(l.slug)}
                className="tap link-wipe font-display text-2xl text-ivory transition-colors duration-[var(--d-base)] hover:text-champagne"
              >
                {l.city}
              </Link>
            </li>
          ))}
        </ul>
        <p className="body-base mt-8 max-w-xl">{settings.travelNote}</p>
      </section>

      <ClosingCTA settings={settings} />
    </>
  );
}
