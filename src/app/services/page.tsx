import type { Metadata } from "next";
import Link from "next/link";
import { content } from "@/lib/content/provider";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import PageHeader from "@/components/ui/PageHeader";
import EditorialImage from "@/components/ui/EditorialImage";
import ParallaxFrame from "@/components/ui/ParallaxFrame";
import Reveal from "@/components/ui/Reveal";
import JsonLd from "@/components/ui/JsonLd";
import ClosingCTA from "@/components/sections/ClosingCTA";

export const metadata: Metadata = pageMetadata({
  title: "Services — Bridal, Reception, Engagement & Hair",
  description:
    "Bridal worlds offered by Lana's Makeover: muhurtham, reception, engagement, party transformation, bridal hair and the signature natural / HD register.",
  path: "/services",
});

export default async function ServicesPage() {
  const provider = content();
  const [services, settings] = await Promise.all([
    provider.getServices(),
    provider.getSiteSettings(),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ])}
      />

      <PageHeader
        eyebrow="The worlds"
        titleLines={["Choose your", "bridal world."]}
        intro="Six registers, each built for a different light and a different hour of the day."
        breadcrumb={[
          { name: "Home", href: "/" },
          { name: "Services", href: "/services" },
        ]}
      />

      <div className="shell pb-28 sm:pb-40">
        <ul className="space-y-28 sm:space-y-40">
          {services.map((s, i) => (
            <li key={s.slug} id={s.slug} className="scroll-mt-32">
              <article
                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-20 ${
                  i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <ParallaxFrame strength={0.5}>
                  <Reveal blur>
                    <div
                      className="relative aspect-[4/5] w-full overflow-hidden"
                      style={{ transform: "translate3d(0, calc(var(--sy) * 22px), 0)" }}
                    >
                      <EditorialImage
                        image={s.image}
                        className="h-full w-full"
                        sizes="(max-width: 1024px) 92vw, 46vw"
                        decorative
                      />
                    </div>
                  </Reveal>
                </ParallaxFrame>

                <div>
                  <Reveal>
                    <p className="eyebrow mb-5">
                      {String(i + 1).padStart(2, "0")} — {s.eyebrow}
                    </p>
                    <h2 className="display-md text-ivory">
                      <Link href={`/services/${s.slug}`} className="link-wipe">
                        {s.name}
                      </Link>
                    </h2>
                    <p className="body-lg mt-7 max-w-lg">{s.summary}</p>
                  </Reveal>

                  <div className="mt-8 space-y-5">
                    {s.description.map((p, j) => (
                      <Reveal key={j} delay={100 + j * 90}>
                        <p className="body-base max-w-lg">{p}</p>
                      </Reveal>
                    ))}
                  </div>

                  <Reveal delay={340}>
                    <h3 className="eyebrow mb-5 mt-12">Includes</h3>
                    <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                      {s.includes.map((inc) => (
                        <li key={inc} className="relative pl-6 text-sm text-ivory/75">
                          <span
                            aria-hidden="true"
                            className="absolute left-0 top-[0.7em] h-px w-3 bg-champagne/60"
                          />
                          {inc}
                        </li>
                      ))}
                    </ul>
                  </Reveal>

                  <Reveal delay={440}>
                    <div className="mt-10 flex flex-wrap gap-4">
                      <Link href="/contact" className="btn">
                        {settings.bookingCta}
                      </Link>
                      <Link href={`/services/${s.slug}`} className="btn btn-ghost">
                        Enter this world
                      </Link>
                    </div>
                  </Reveal>
                </div>
              </article>
            </li>
          ))}
        </ul>

        <Reveal>
          <p className="body-base mt-24 max-w-2xl border-l border-champagne/30 pl-5">
            Pricing, packages and travel terms are confirmed directly, per date and per city.
            Nothing is quoted on this page because nothing has been quoted to us.
          </p>
        </Reveal>
      </div>

      <ClosingCTA settings={settings} />
    </>
  );
}
