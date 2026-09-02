import type { Metadata } from "next";
import { content } from "@/lib/content/provider";
import { getImageSlots, journalCover, serviceImage } from "@/lib/content/slots";
import { pageMetadata, personSchema } from "@/lib/seo";
import JsonLd from "@/components/ui/JsonLd";
import BrandVeil from "@/components/ui/BrandVeil";

import Hero from "@/components/sections/Hero";
import ActBefore from "@/components/sections/ActBefore";
import ActArtist from "@/components/sections/ActArtist";
import SilkTransition from "@/components/sections/SilkTransition";
import ActRitual from "@/components/sections/ActRitual";
import ActHeritage from "@/components/sections/ActHeritage";
import BridalWorlds from "@/components/sections/BridalWorlds";
import BrideStories from "@/components/sections/BrideStories";
import FeaturedLooks from "@/components/sections/FeaturedLooks";
import MorningTimeline from "@/components/sections/MorningTimeline";
import DetailArt from "@/components/sections/DetailArt";
import HairSilhouette from "@/components/sections/HairSilhouette";
import Atelier from "@/components/sections/Atelier";
import JournalTeaser from "@/components/sections/JournalTeaser";
import Testimonials from "@/components/sections/Testimonials";
import InstagramStrip from "@/components/sections/InstagramStrip";
import FinalMirror from "@/components/sections/FinalMirror";
import ClosingCTA from "@/components/sections/ClosingCTA";

export const metadata: Metadata = pageMetadata({ path: "/" });

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE HOMEPAGE IS A FILM, NOT A BROCHURE
 * ═══════════════════════════════════════════════════════════════════════════
 *  Nine acts, in narrative order. Not hero → about → services → gallery.
 *
 *  Every act is a self-contained component reading from the ContentProvider,
 *  and every act is complete without WebGL. The canvas behind the page adds
 *  depth to three of them; it never carries the story on its own.
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
    provider.getPortfolio({ featured: true, limit: 6 }),
  ]);

  // The strip reads the store through the provider — never a live Meta call at
  // render time. Renders nothing until there are six curated posts.
  const latest = await provider.getPortfolio({ limit: 6 });

  // Each world shows work from its own category; each article a different image.
  const worlds = services.slice(0, 6).map((s) => ({ ...s, image: serviceImage(s.category, s.image) }));
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

      {/* ACT I — before the bride */}
      <ActBefore images={slots.beforeLayers} />

      {/* ACT II — the artist */}
      <ActArtist settings={settings} portrait={slots.artistPortrait} />

      {/* Silk — the camera passes through the cloth */}
      <SilkTransition line="Then the silk. Then the gold. Then the morning." />

      {/* ACT III — the ritual */}
      <ActRitual images={slots.transformation} />

      {/* ACT IV — the heritage */}
      <ActHeritage images={slots.heritage} />

      {/* The worlds */}
      <BridalWorlds services={worlds} />

      {/* ACT V — the women. Real stories when they exist (§17); until then,
          featured bridal looks — genuine work, no invented identity (§16). */}
      {brides.length > 0 ? (
        <BrideStories brides={brides.slice(0, 3)} settings={settings} />
      ) : (
        <FeaturedLooks items={featured} />
      )}

      {/* Her morning */}
      <MorningTimeline entries={timeline} />

      {/* The detail */}
      <DetailArt images={slots.detail} />

      {/* The silhouette */}
      <HairSilhouette images={slots.hair} />

      {/* The atelier */}
      <Atelier images={slots.atelier} />

      {/* ACT VII — the journal */}
      <JournalTeaser posts={journal} />

      {/* Hidden entirely until real testimonials exist */}
      <Testimonials items={testimonials} />

      {/* Placed with Testimonials, which is where Task 2.6's section 09 lands.
          When the homepage is renumbered, these two move together. */}
      <InstagramStrip items={latest} settings={settings} />

      {/* ACT VIII — the final mirror */}
      <FinalMirror brand={settings.brandName} cta={settings.bookingCta} image={slots.finalMirror} />

      {/* ACT IX — your story */}
      <ClosingCTA settings={settings} />
    </>
  );
}
