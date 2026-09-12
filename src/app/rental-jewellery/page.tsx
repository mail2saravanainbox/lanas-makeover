import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { content } from "@/lib/content/provider";
import { rentalCategories } from "@/content/rental-categories";
import { rentalItems, rentalItemsFor } from "@/content/rental";
import { citiesProse, siteSettings } from "@/content/site";
import { breadcrumbSchema, pageMetadata, rentalServiceSchema } from "@/lib/seo";
import PageHeader from "@/components/ui/PageHeader";
import Reveal from "@/components/ui/Reveal";
import JsonLd from "@/components/ui/JsonLd";
import ClosingCTA from "@/components/sections/ClosingCTA";

export const metadata: Metadata = pageMetadata({
  title: "Bridal Jewellery Rental",
  description: `Bridal jewellery on rent across ${citiesProse()} — temple jewellery, American diamond sets, chokers and haram. Browse the collection and send your date.`,
  path: "/rental-jewellery",
});

export const revalidate = 3600;

/**
 * The rental catalogue's front door.
 *
 * Four rooms, each with its own page, and a count so a bride can see what is
 * behind a door before she opens it. The cover image is the first set in each
 * room rather than a chosen hero — there is no editorial ranking of a rental
 * catalogue, and pretending there is would mean deciding which necklace is
 * best, which is hers to decide.
 */
export default async function Page() {
  const settings = await content().getSiteSettings();
  const total = rentalItems().length;

  return (
    <>
      <JsonLd
        data={[
          rentalServiceSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Jewellery Rental", path: "/rental-jewellery" },
          ]),
        ]}
      />

      <PageHeader
        eyebrow="Jewellery rental"
        titleLines={["The jewellery,", "on rent."]}
        intro={`${total} bridal sets to rent across ${citiesProse()} — temple jewellery, American diamond, chokers and haram. The makeup and the jewellery from the same morning, planned together.`}
        breadcrumb={[
          { name: "Home", href: "/" },
          { name: "Jewellery Rental", href: "/rental-jewellery" },
        ]}
      />

      <div className="shell pb-20">
        <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2">
          {rentalCategories.map((c, i) => {
            const items = rentalItemsFor(c.key);
            const cover = items[0];
            return (
              <li key={c.slug}>
                <Reveal delay={(i % 2) * 110} blur>
                  <Link href={`/rental-jewellery/${c.slug}`} data-cursor="view" className="group block">
                    {/* 5:8 and contain, for the same reason as the grid:
                        a 1:2 frame in a 4:5 box loses a third of the necklace. */}
                    <div className="relative aspect-[5/8] w-full overflow-hidden bg-ink-2">
                      {cover && (
                        <Image
                          src={cover.thumbnailUrl}
                          alt={cover.alt}
                          fill
                          sizes="(max-width: 640px) 92vw, 46vw"
                          placeholder={cover.blurDataURL ? "blur" : undefined}
                          blurDataURL={cover.blurDataURL}
                          className="object-contain transition-transform duration-[var(--d-slow)] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 motion-reduce:transition-none"
                        />
                      )}
                    </div>

                    <div className="mt-5 flex items-baseline justify-between gap-4">
                      <h2 className="font-display text-2xl text-ivory transition-colors duration-[var(--d-base)] group-hover:text-champagne">
                        {c.name}
                      </h2>
                      {/* Counted from the catalogue, never typed — the number
                          cannot outlive the photographs behind it. */}
                      <span className="shrink-0 text-[0.75rem] uppercase tracking-[0.2em] text-champagne/70">
                        {items.length} sets
                      </span>
                    </div>
                    <p className="body-base mt-3 max-w-md">{c.intro}</p>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>

        {/* ── WHAT THIS PAGE CANNOT TELL HER ──────────────────────────────
            Rental terms, deposit, how long a set is held, whether it travels
            with the artist. Every one of those is a commercial fact only Lana
            can state, so the page says plainly that they are settled directly
            rather than implying an answer. */}
        <Reveal delay={280}>
          <div className="measure mt-16 border-l border-champagne/30 pl-5">
            <p className="body-lg">
              Availability, rental terms and the deposit are confirmed directly, per date and
              per city — send your date with the sets you are drawn to.
            </p>
            <p className="body-lg mt-5">
              Renting in the home city has its own page —{" "}
              <Link href="/rental-jewellery-trichy" className="link-wipe text-champagne">
                bridal jewellery on rent in Trichy
              </Link>{" "}
              — with the whole collection on one screen and what a Trichy muhurtham asks of a set.
            </p>
            <p className="body-base mt-4">
              {settings.travelNote} Based in {siteSettings.location}.
            </p>
            <Link href="/contact" className="btn mt-8">
              {settings.bookingCta}
            </Link>
          </div>
        </Reveal>
      </div>

      <ClosingCTA settings={settings} />
    </>
  );
}
