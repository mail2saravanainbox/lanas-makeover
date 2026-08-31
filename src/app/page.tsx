import type { Metadata } from "next";
import { content } from "@/lib/content/provider";
import { pageMetadata, personSchema } from "@/lib/seo";
import JsonLd from "@/components/ui/JsonLd";

import HeroCinematic from "@/components/sections/HeroCinematic";
import ActBefore from "@/components/sections/ActBefore";
import ActArtist from "@/components/sections/ActArtist";
import SilkTransition from "@/components/sections/SilkTransition";
import ActRitual from "@/components/sections/ActRitual";
import ActHeritage from "@/components/sections/ActHeritage";
import BridalWorlds from "@/components/sections/BridalWorlds";
import BrideStories from "@/components/sections/BrideStories";
import MorningTimeline from "@/components/sections/MorningTimeline";
import DetailArt from "@/components/sections/DetailArt";
import HairSilhouette from "@/components/sections/HairSilhouette";
import Atelier from "@/components/sections/Atelier";
import JournalTeaser from "@/components/sections/JournalTeaser";
import Testimonials from "@/components/sections/Testimonials";
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

  const [settings, services, brides, posts, testimonials, timeline] = await Promise.all([
    provider.getSiteSettings(),
    provider.getServices(),
    provider.getBrides(),
    provider.getPosts(),
    provider.getTestimonials(),
    provider.getTimeline(),
  ]);

  return (
    <>
      <JsonLd data={personSchema()} />

      {/* ACT 0 — the opening */}
      <HeroCinematic
        brand={settings.brandName}
        tagline={settings.tagline}
        cta={settings.bookingCta}
      />

      {/* ACT I — before the bride */}
      <ActBefore />

      {/* ACT II — the artist */}
      <ActArtist settings={settings} />

      {/* Silk — the camera passes through the cloth */}
      <SilkTransition line="Then the silk. Then the gold. Then the morning." />

      {/* ACT III — the ritual */}
      <ActRitual />

      {/* ACT IV — the heritage */}
      <ActHeritage />

      {/* The worlds */}
      <BridalWorlds services={services.slice(0, 6)} />

      {/* ACT V — the women */}
      <BrideStories brides={brides.slice(0, 3)} settings={settings} />

      {/* Her morning */}
      <MorningTimeline entries={timeline} />

      {/* The detail */}
      <DetailArt />

      {/* The silhouette */}
      <HairSilhouette />

      {/* The atelier */}
      <Atelier />

      {/* ACT VII — the journal */}
      <JournalTeaser posts={posts} />

      {/* Hidden entirely until real testimonials exist */}
      <Testimonials items={testimonials} />

      {/* ACT VIII — the final mirror */}
      <FinalMirror brand={settings.brandName} cta={settings.bookingCta} />

      {/* ACT IX — your story */}
      <ClosingCTA settings={settings} />
    </>
  );
}
