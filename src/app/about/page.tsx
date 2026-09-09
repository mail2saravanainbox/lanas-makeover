import type { Metadata } from "next";
import { content } from "@/lib/content/provider";
import { getImageSlots } from "@/lib/content/slots";
import { breadcrumbSchema, pageMetadata, personSchema } from "@/lib/seo";
import PageHeader from "@/components/ui/PageHeader";
import EditorialImage from "@/components/ui/EditorialImage";
import ParallaxFrame from "@/components/ui/ParallaxFrame";
import Reveal from "@/components/ui/Reveal";
import JsonLd from "@/components/ui/JsonLd";
import Testimonials from "@/components/sections/Testimonials";
import ClosingCTA from "@/components/sections/ClosingCTA";
import KolamGrid from "@/components/sections/KolamGrid";
import TrustSignals from "@/components/sections/TrustSignals";
import Link from "next/link";
import { citiesProse } from "@/content/site";

export const metadata: Metadata = pageMetadata({
  title: "About Lana",
  description:
    `Lana is a bridal and party transformation makeup artist based in Trichy, Tamil Nadu, serving ${citiesProse()} in natural, HD and South Indian bridal registers.`,
  path: "/about",
});

export default async function AboutPage() {
  const provider = content();
  const [settings, testimonials, services] = await Promise.all([
    provider.getSiteSettings(),
    provider.getTestimonials(),
    provider.getServices(),
  ]);
  const slots = getImageSlots();

  return (
    <>
      <JsonLd
        data={[
          personSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
        ]}
      />

      <PageHeader
        eyebrow="The artist"
        titleLines={["The hands behind", "the transformation."]}
        breadcrumb={[
          { name: "Home", href: "/" },
          { name: "About", href: "/about" },
        ]}
      />

      {/* overflow-hidden: the kolam is 34rem wide and offset -right-[6%],
          which pushed the DOCUMENT 24px wider than the viewport at 390 and
          61px at 1024 — a decorative element causing a horizontal scroll. */}
      <section className="shell relative overflow-hidden pb-24">
        <KolamGrid
          className="pointer-events-none absolute -right-[6%] top-0 h-[34rem] w-[34rem] text-champagne/[0.05]"
          cells={6}
        />

        <div className="relative grid gap-14 lg:grid-cols-[0.9fr_1fr] lg:gap-20">
          <ParallaxFrame strength={0.5}>
            <Reveal blur>
              {/* §21 — type, not a stand-in, until a real portrait of Lana exists. */}
              {slots.artistPortrait ? (
                <div
                  className="relative aspect-[4/5] w-full overflow-hidden"
                  style={{ transform: "translate3d(0, calc(var(--sy) * 22px), 0)" }}
                >
                  <EditorialImage
                    image={slots.artistPortrait}
                    className="h-full w-full"
                    sizes="(max-width: 1024px) 92vw, 42vw"
                    priority
                  />
                </div>
              ) : (
                <div
                  className="flex aspect-[4/5] w-full flex-col justify-between border border-ivory/12 bg-ink-2 p-9"
                  style={{ transform: "translate3d(0, calc(var(--sy) * 22px), 0)" }}
                >
                  <p className="eyebrow">{settings.tagline}</p>
                  <div>
                    <p className="font-display text-[clamp(2.2rem,4.5vw,3.8rem)] uppercase leading-[0.95] tracking-[0.06em] text-ivory/90">
                      {settings.artistName}
                    </p>
                    <p className="body-base mt-4 max-w-xs">
                      An artist portrait has not been supplied yet.
                    </p>
                  </div>
                  <p className="text-[0.75rem] uppercase tracking-[0.24em] text-muted">
                    {settings.location}
                  </p>
                </div>
              )}
            </Reveal>
          </ParallaxFrame>

          <div>
            <div className="space-y-6">
              {settings.biography.map((p, i) => (
                <Reveal key={i} delay={i * 110}>
                  <p className={i === 0 ? "body-lg" : "body-base"}>{p}</p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={360}>
              <figure className="mt-12 border-l border-champagne/40 pl-7">
                <blockquote className="font-display text-[clamp(1.3rem,2.4vw,2rem)] font-light italic leading-snug text-champagne">
                  “{settings.philosophy}”
                </blockquote>
              </figure>
            </Reveal>

            <Reveal delay={460}>
              <dl className="mt-14 grid gap-x-10 gap-y-8 border-t border-ivory/12 pt-10 sm:grid-cols-2">
                <div>
                  <dt className="eyebrow mb-3">Based in</dt>
                  <dd className="font-display text-2xl text-ivory">{settings.location}</dd>
                </div>
                <div>
                  <dt className="eyebrow mb-3">Serves</dt>
                  <dd className="body-base !text-ivory/80">
                    {settings.serviceAreas.join(" · ")}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow mb-3">Registers</dt>
                  <dd className="body-base !text-ivory/80">
                    Natural · HD · South Indian bridal
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow mb-3">Instagram</dt>
                  <dd>
                    <a
                      href={settings.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-wipe body-base !text-ivory/80 hover:!text-champagne"
                    >
                      {settings.instagramHandle}
                    </a>
                  </dd>
                </div>
              </dl>
            </Reveal>

            {settings.contentIsPlaceholder && (
              <Reveal delay={560}>
                <p className="body-base mt-12 border-l border-champagne/30 pl-5">
                  This biography is written strictly from what the public profile states. No
                  years of experience, training, award or client list is claimed here because
                  none has been supplied.
                </p>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ── Locations served (§17, §3) ────────────────────────────────────
          A section of its own rather than a line in a definition list. It is
          the second question a bride asks after "is the work good", and on
          this page it was previously four words inside a table. */}
      <section className="section-dark py-24 sm:py-32" aria-labelledby="locations-title">
        <div className="shell">
          <Reveal>
            <p className="eyebrow mb-8">Locations served</p>
            <h2 id="locations-title" className="display-md max-w-[20ch] text-ivory">
              {/* Counted from the list, never typed — the heading cannot
                  outlive the number of cities under it. */}
              One artist,
              <br />
              <span className="italic-serif text-champagne">
                {settings.serviceAreas.length === 4 ? "four" : settings.serviceAreas.length} cities.
              </span>
            </h2>
          </Reveal>

          <ul className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {settings.serviceAreas.map((city, i) => (
              <li key={city}>
                <Reveal delay={(i % 4) * 110}>
                  <p className="border-t border-champagne/30 pt-5 font-display text-3xl text-ivory">
                    {city}
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>

          <Reveal delay={460}>
            <p className="body-lg measure mt-12">
              {settings.travelNote} Based in {settings.location} — the same hands, the same kit
              and the same approach wherever your wedding is.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Her services (§17) ─────────────────────────────────────────────
          Named here and linked, rather than described again. The service pages
          are the canonical account of the work; this is a signpost. */}
      {services.length > 0 && (
        <section className="shell py-24 sm:py-28" aria-labelledby="her-services-title">
          <Reveal>
            <p className="eyebrow mb-8">Her services</p>
            <h2 id="her-services-title" className="display-md max-w-[16ch] text-ivory">
              What she is
              <br />
              <span className="italic-serif text-champagne">asked for.</span>
            </h2>
          </Reveal>

          <ul className="mt-12 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <li key={s.slug}>
                <Reveal delay={(i % 3) * 90}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="group flex items-baseline justify-between gap-4 border-b border-ivory/10 py-4"
                  >
                    <span className="font-display text-xl text-ivory transition-colors duration-[var(--d-base)] group-hover:text-champagne">
                      {s.name}
                    </span>
                    <span className="shrink-0 text-[0.7rem] uppercase tracking-[0.2em] text-champagne/70">
                      View
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>

          <Reveal delay={320}>
            <Link href="/contact" className="btn mt-12">
              {settings.bookingCta}
            </Link>
          </Reveal>
        </section>
      )}

      {/* Why brides choose Lana — verified signals only (§19). */}
      <TrustSignals />

      <Testimonials items={testimonials} />
      <ClosingCTA settings={settings} />
    </>
  );
}
