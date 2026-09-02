import type { Metadata } from "next";
import { content } from "@/lib/content/provider";
import { getImageSlots, journalCover, serviceImage } from "@/lib/content/slots";
import { pageMetadata, personSchema } from "@/lib/seo";
import JsonLd from "@/components/ui/JsonLd";
import BrandVeil from "@/components/ui/BrandVeil";

import Hero from "@/components/sections/Hero";
import ActBefore from "@/components/sections/ActBefore";
import ActRitual from "@/components/sections/ActRitual";
import BrideStories from "@/components/sections/BrideStories";
import FeaturedLooks from "@/components/sections/FeaturedLooks";
import ActHeritage from "@/components/sections/ActHeritage";
import BridalWorlds from "@/components/sections/BridalWorlds";
import ActArtist from "@/components/sections/ActArtist";
import HairSilhouette from "@/components/sections/HairSilhouette";
import JournalTeaser from "@/components/sections/JournalTeaser";
import Testimonials from "@/components/sections/Testimonials";
import InstagramStrip from "@/components/sections/InstagramStrip";
import FinalMirror from "@/components/sections/FinalMirror";
import ClosingCTA from "@/components/sections/ClosingCTA";
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

  const [settings, services, brides, posts, testimonials, timeline, featured] = await Promise.all([
    provider.getSiteSettings(),
    provider.getServices(),
    provider.getBrides(),
    provider.getPosts(),
    provider.getTestimonials(),
    provider.getTimeline(),
    provider.getPortfolio({ featured: true, limit: 3 }),
  ]);

  // The strip reads the store through the provider — never a live Meta call at
  // render time. Renders nothing until there are six curated posts.
  const latest = await provider.getPortfolio({ limit: 6 });

  /**
   * THE NUMBERS ARE COMPUTED FROM WHAT ACTUALLY RENDERS.
   *
   * Several sections return null on empty content — no bride stories, no
   * published looks, no testimonials — so numbering them by position gave a
   * homepage that read 01, 02, 04, 05, 06, 07, 08, 10, 11. A visitor cannot
   * see the sections that are missing; they can only see that two numbers
   * are. This assigns the sequence over the sections that survive.
   */
  const renders = {
    before: true,
    ritual: true,
    brides: brides.length > 0 || featured.length > 0,
    heritage: true,
    ceremonies: services.length > 0,
    artist: true,
    silhouette: true,
    journal: posts.length > 0,
    voices: testimonials.length > 0,
    mirror: true,
    cta: true,
  };

  let counter = 0;
  const n = Object.fromEntries(
    Object.entries(renders).map(([key, shown]) => [key, shown ? ++counter : undefined]),
  ) as Record<keyof typeof renders, number | undefined>;

  // Each world shows work from its own category; each article a different image.
  const worlds = services.map((s) => ({ ...s, image: serviceImage(s.category, s.image) }));
  const journal = posts.map((p, i) => ({ ...p, cover: journalCover(i, p.cover) }));

  return (
    <>
      <JsonLd data={personSchema()} />

      {/* Server-rendered so it is painted with the first frame, and removed
          before that frame by its own guard script when it should be skipped.
          Homepage only — it is an opening, not a loader. */}
      <BrandVeil brand={settings.brandName} />

      {/* The opening — one screen, not four */}
      <Hero
        brand={settings.brandName}
        cta={settings.bookingCta}
        poster={settings.hero.poster ?? slots.heroPoster}
        posterPortrait={settings.hero.posterPortrait ?? slots.heroPosterPortrait}
        video={settings.hero.video}
      />

      <ActBefore index={n.before!} images={slots.beforeLayers} />

      <ActRitual index={n.ritual!} images={slots.transformation} />

      <SectionMark />

      {/* 03 — whichever of the two the archive can actually fill. Bride
          stories when they exist; the featured work when they do not; and
          nothing at all when neither does. Both render null when empty, so
          the number is never orphaned. */}
      {brides.length > 0 ? (
        <BrideStories index={n.brides!} brides={brides.slice(0, 3)} settings={settings} />
      ) : (
        <FeaturedLooks index={n.brides!} items={featured} />
      )}

      <ActHeritage index={n.heritage!} images={slots.heritage} details={slots.detail} />

      <BridalWorlds index={n.ceremonies!} services={worlds} />

      <SectionMark />

      <ActArtist
        index={n.artist!}
        settings={settings}
        portrait={slots.artistPortrait}
        working={slots.atelier[2] ?? null}
        entries={timeline}
      />

      <HairSilhouette index={n.silhouette!} images={slots.hair} clip={settings.hair?.clip} />

      <JournalTeaser index={n.journal!} posts={journal} />

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
