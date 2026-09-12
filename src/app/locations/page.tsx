import type { Metadata } from "next";
import Link from "next/link";
import { content } from "@/lib/content/provider";
import { locationHref, locations } from "@/content/locations";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { citiesProse, siteSettings } from "@/content/site";
import PageHeader from "@/components/ui/PageHeader";
import Reveal from "@/components/ui/Reveal";
import JsonLd from "@/components/ui/JsonLd";
import ClosingCTA from "@/components/sections/ClosingCTA";

export const metadata: Metadata = pageMetadata({
  title: "Where Lana Works",
  description: `Bridal makeup and hair across ${citiesProse()}. One artist, four cities — what a wedding in each of them means for the morning.`,
  path: "/locations",
});

export const revalidate = 3600;

/**
 * The index the four city pages hang from.
 *
 * Without it they are four orphans reachable only from the footer, and a
 * crawler that lands on one has nowhere lateral to go. It is also the honest
 * place to say the thing the individual pages should not each repeat: this is
 * one artist travelling, not four studios.
 */
export default async function Page() {
  const settings = await content().getSiteSettings();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Locations", path: "/locations" },
        ])}
      />

      <PageHeader
        eyebrow="Where she works"
        titleLines={["One artist,", "four cities."]}
        intro="Not four studios — the same hands, the same kit and the same approach, wherever your wedding is. What changes is the morning, and each of these pages is about how."
        breadcrumb={[
          { name: "Home", href: "/" },
          { name: "Locations", href: "/locations" },
        ]}
      />

      <div className="shell pb-20">
        <ul className="divide-y divide-ivory/10 border-y border-ivory/10">
          {locations.map((l, i) => (
            <li key={l.slug}>
              <Reveal delay={(i % 4) * 90}>
                <Link
                  href={locationHref(l.slug)}
                  className="group grid gap-3 py-9 lg:grid-cols-[14rem_1fr] lg:gap-10"
                >
                  <div className="flex items-baseline gap-4">
                    <h2 className="font-display text-3xl text-ivory transition-colors duration-[var(--d-base)] group-hover:text-champagne">
                      {l.city}
                    </h2>
                    {/* Geography, stated once, where it is useful for
                        choosing — never on the city page as a claim about
                        what travel costs. */}
                    {l.distanceKm !== null && (
                      <span className="text-[0.75rem] uppercase tracking-[0.2em] text-muted">
                        ~{l.distanceKm} km
                      </span>
                    )}
                    {l.distanceKm === null && (
                      <span className="text-[0.75rem] uppercase tracking-[0.2em] text-champagne/70">
                        Base
                      </span>
                    )}
                  </div>
                  <p className="body-base max-w-2xl">{l.intro}</p>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal delay={300}>
          <p className="body-lg measure mt-14">
            {settings.travelNote} Based in {siteSettings.location} — send the venue with your
            date and the logistics are confirmed with you directly.
          </p>
        </Reveal>
      </div>

      <ClosingCTA settings={settings} />
    </>
  );
}
