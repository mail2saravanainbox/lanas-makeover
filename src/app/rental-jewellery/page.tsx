import type { Metadata } from "next";
import Link from "next/link";
import { content } from "@/lib/content/provider";
import { rentalCategories } from "@/content/rental-categories";
import { rentalItems } from "@/content/rental";
import { citiesProse, siteSettings } from "@/content/site";
import { breadcrumbSchema, pageMetadata, rentalServiceSchema } from "@/lib/seo";
import PageHeader from "@/components/ui/PageHeader";
import Reveal from "@/components/ui/Reveal";
import JsonLd from "@/components/ui/JsonLd";
import ClosingCTA from "@/components/sections/ClosingCTA";
import RentalCollection from "@/components/rental/RentalCollection";

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
        intro={`Temple jewellery, American diamond, chokers and haram — to rent across ${citiesProse()}. The makeup and the jewellery from the same morning, planned together.`}
        breadcrumb={[
          { name: "Home", href: "/" },
          { name: "Jewellery Rental", href: "/rental-jewellery" },
        ]}
      />

      {/* ── THE COLLECTION, NOT A MENU OF ROOMS (§28) ────────────────────
          Four category cards meant a bride had to choose a room before she
          saw a single necklace. The chips do the same job in one row, and the
          jewellery is the first thing on the page. The four category pages
          are untouched and still linked — see RentalCollection. */}
      <RentalCollection categories={rentalCategories} items={rentalItems()} />

      <div className="shell pb-20">
        {/* ── WHAT THIS PAGE CANNOT TELL HER ──────────────────────────────
            Rental terms, deposit, how long a set is held, whether it travels
            with the artist. Every one of those is a commercial fact only Lana
            can state, so the page says plainly that they are settled directly
            rather than implying an answer. */}
        <Reveal delay={280}>
          <div className="measure mt-16 border-l border-champagne/30 pl-5">
            <p className="body-lg">
              Availability, rental terms and the deposit are confirmed directly,
              per date and per city — send your date with the sets you are drawn
              to.
            </p>
            <p className="body-lg mt-5">
              Renting in the home city has its own page —{" "}
              <Link
                href="/rental-jewellery-trichy"
                className="link-wipe text-champagne"
              >
                bridal jewellery on rent in Trichy
              </Link>{" "}
              — with the whole collection on one screen and what a Trichy
              muhurtham asks of a set.
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
