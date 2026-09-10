import type { Metadata } from "next";
import { content } from "@/lib/content/provider";
import { getImageSlots, serviceImage } from "@/lib/content/slots";
import { pageMetadata, personSchema } from "@/lib/seo";
import JsonLd from "@/components/ui/JsonLd";

import Hero from "@/components/sections/Hero";
import ActBefore from "@/components/sections/ActBefore";
import ActRitual from "@/components/sections/ActRitual";
import BrideStories from "@/components/sections/BrideStories";
import BridalWorlds from "@/components/sections/BridalWorlds";
import RentalStrip from "@/components/sections/RentalStrip";
import { rentalItems } from "@/content/rental";
import ActArtist from "@/components/sections/ActArtist";
import Testimonials from "@/components/sections/Testimonials";
import InstagramStrip from "@/components/sections/InstagramStrip";
import FinalMirror from "@/components/sections/FinalMirror";
import ClosingCTA from "@/components/sections/ClosingCTA";
import Pricing from "@/components/sections/Pricing";
import Transformation from "@/components/sections/Transformation";
import SectionMark from "@/components/ui/SectionMark";

export const metadata: Metadata = pageMetadata({ path: "/" });

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE HOMEPAGE IS A FILM, NOT A BROCHURE
 * ═══════════════════════════════════════════════════════════════════════════
 *  Eleven numbered sections, in narrative order — not hero → about →
 *  services → gallery. The numbers are COMPUTED from the composition below,
 *  never written into the components, so re-ordering the page cannot leave
 *  the eyebrows lying.
 *
 *  Every act is a self-contained component reading from the ContentProvider.
 *  There is no WebGL behind any of them — see Task 2.4.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export default async function HomePage() {
  const provider = content();

  // Lana's photographs where they exist, plates where they don't (§31).
  const slots = getImageSlots();

  const [settings, services, brides, testimonials, timeline] = await Promise.all([
    provider.getSiteSettings(),
    provider.getServices(),
    provider.getBrides(),
    provider.getTestimonials(),
    provider.getTimeline(),
  ]);

  // The strip reads the store through the provider — never a live Meta call at
  // render time. Renders nothing until there are six curated posts.
  const latest = await provider.getPortfolio({ limit: 6 });

  /**
   * The before/after pair is searched across the WHOLE archive, not the six
   * items the Instagram strip happens to show. Tying it to `latest` meant the
   * section appeared or vanished depending on the sort order of unrelated
   * photographs — it was there only if a genuine pair landed in the first six.
   */
  const allWork = await provider.getPortfolio();
  const transformation = allWork.filter(
    (i) => i.beforeAfter?.before && i.beforeAfter?.after,
  );

  /**
   * THE NUMBERS ARE COMPUTED FROM WHAT ACTUALLY RENDERS.
   *
   * Several sections return null on empty content — no bride stories, no
   * published looks, no testimonials — so numbering them by position gave a
   * homepage that read 01, 02, 04, 05, 06, 07, 08, 10, 11. A visitor cannot
   * see the sections that are missing; they can only see that two numbers
   * are. This assigns the sequence over the sections that survive.
   */
  /**
   * THE ORDER CHANGED IN ONE PLACE, AND FOR ONE REASON (§7, §50).
   *
   * The proof — bride stories where they exist, the featured looks where they
   * do not — now runs SECOND, immediately after the hero, ahead of the two
   * opening acts. A bride arriving from Instagram asks "is the work good"
   * before she will read anything, and the film used to make her scroll
   * through two acts to find out. Everything else keeps its sequence; this is
   * a re-ordering of the first two minutes, not a rewrite of the film.
   */
  const renders = {
    brides: brides.length > 0,
    before: true,
    ritual: true,
    // §9 — present only when a genuine, permissioned pair exists. The section
    // returns null otherwise, so the number is never orphaned.
    transformation: transformation.length > 0,
    ceremonies: services.length > 0,
    // A second line of business, so it is numbered like one — but it is a
    // sideways rail, not a section, and costs about three quarters of a
    // screen on a phone. See RentalStrip.
    rental: rentalItems().length > 0,
    artist: true,
    investment: true,
    voices: testimonials.length > 0,
    mirror: true,
    cta: true,
  };

  let counter = 0;
  const n = Object.fromEntries(
    Object.entries(renders).map(([key, shown]) => [key, shown ? ++counter : undefined]),
  ) as Record<keyof typeof renders, number | undefined>;

  // Each world shows work from its own category.
  const worlds = services.map((s) => ({ ...s, image: serviceImage(s.category, s.image) }));

  return (
    <>
      <JsonLd data={personSchema()} />

      {/* The opening — one screen, not four */}
      <Hero
        brand={settings.brandName}
        cta={settings.bookingCta}
        poster={settings.hero.poster ?? slots.heroPoster}
        posterPortrait={settings.hero.posterPortrait ?? slots.heroPosterPortrait}
        video={settings.hero.video}
      />

      {/* ── THE PROOF ──────────────────────────────────────────────────────
          Bride stories only. The featured-work teaser that used to stand in
          for them here has been removed: it was three photographs from the
          archive, and the archive already has a page of its own that does the
          job better. On a phone it was a screen and a half of scrolling to
          reach a link to /portfolio that the nav, the hero and the footer all
          offer anyway.

          Bride stories are NOT that. They are narrative — a named bride, her
          ceremony, her words — and when real ones exist they earn a place on
          the homepage that a gallery excerpt never did. Renders null while
          there are none, so the section numbering closes over the gap. */}
      {brides.length > 0 && (
        <>
          <BrideStories index={n.brides!} brides={brides.slice(0, 3)} settings={settings} />
          <SectionMark />
        </>
      )}

      <ActBefore index={n.before!} images={slots.beforeLayers} />

      <ActRitual index={n.ritual!} images={slots.transformation} />

      <Transformation index={n.transformation} items={transformation} />

      <SectionMark />

      <BridalWorlds index={n.ceremonies!} services={worlds} />

      {/* ── THE JEWELLERY ────────────────────────────────────────────────
          Placed after the worlds because it is the same question one step on:
          she has just read what the morning is, and this is what she will be
          wearing through it. A rail rather than a grid — the homepage came
          down from 33 screens to 12 and is not going back up. */}
      {renders.rental && <RentalStrip index={n.rental} />}

      <SectionMark />

      <ActArtist
        index={n.artist!}
        settings={settings}
        portrait={slots.artistPortrait}
        working={slots.atelier[2] ?? null}
        entries={timeline}
      />

      <SectionMark />

      {/* "What you can count on" used to sit here as well as on /about —
          the same four signals, the same words, twice on one site.

          TODO(client): replace with testimonials / a proof block. That is the
          thing this slot actually wants and the thing there is nothing to
          fill it with yet: there are zero published testimonials. */}
      <Pricing index={n.investment} />

      <Testimonials index={n.voices} items={testimonials} />

      <InstagramStrip items={latest} settings={settings} />

      <SectionMark />

      <FinalMirror
        index={n.mirror!}
        brand={settings.brandName}
        cta={settings.bookingCta}
        image={slots.finalMirror}
      />

      <ClosingCTA index={n.cta!} settings={settings} />
    </>
  );
}
