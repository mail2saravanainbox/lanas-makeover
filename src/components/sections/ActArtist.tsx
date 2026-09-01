import Link from "next/link";
import type { ImageRef, SiteSettings } from "@/lib/types";
import EditorialImage from "@/components/ui/EditorialImage";
import ParallaxFrame from "@/components/ui/ParallaxFrame";
import Reveal from "@/components/ui/Reveal";
import SplitLines from "@/components/ui/SplitLines";

/**
 * ACT II — THE ARTIST (§6)
 * Every word here comes from `content/site.ts`. Nothing is invented in markup.
 */
/**
 * §21 — when there is no genuine photograph OF LANA, this renders type rather
 * than a stand-in. A bridal portrait from the portfolio is a photograph of a
 * client, not of the artist, and presenting one here would misrepresent her.
 */
export default function ActArtist({
  settings,
  portrait = null,
}: {
  settings: SiteSettings;
  portrait?: ImageRef | null;
}) {
  return (
    <section className="section-dark relative overflow-hidden py-28 sm:py-40" aria-labelledby="artist-title">
      <div className="shell grid items-start gap-16 lg:grid-cols-[0.85fr_1fr] lg:gap-24">
        <ParallaxFrame className="relative order-2 lg:order-1" strength={0.7}>
          <Reveal blur>
            <div
              className="relative aspect-[4/5] w-full"
              style={{ transform: "translate3d(0, calc(var(--sy) * 24px), 0)" }}
            >
              {portrait ? (
                <EditorialImage
                  image={portrait}
                  className="h-full w-full"
                  sizes="(max-width: 1024px) 90vw, 38vw"
                />
              ) : (
                <div className="flex h-full w-full flex-col justify-between border border-ivory/12 bg-ink-2 p-8">
                  <p className="eyebrow">{settings.tagline}</p>
                  <p className="font-display text-[clamp(2rem,4vw,3.4rem)] uppercase leading-[0.95] tracking-[0.06em] text-ivory/90">
                    {settings.artistName}
                  </p>
                  <p className="text-[0.75rem] uppercase tracking-[0.24em] text-muted">
                    {settings.location}
                  </p>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={240}>
            <figure className="mt-8 border-l border-ivory/15 pl-6">
              <blockquote className="italic-serif text-xl leading-relaxed text-champagne">
                “{settings.philosophy}”
              </blockquote>
              <figcaption className="eyebrow mt-4">{settings.artistName}</figcaption>
            </figure>
          </Reveal>
        </ParallaxFrame>

        <div className="order-1 lg:order-2 lg:pt-10">
          <Reveal>
            <p className="eyebrow mb-10">02 — The artist</p>
          </Reveal>

          <SplitLines
            as="h2"
            id="artist-title"
            className="display-md text-ivory"
            lines={["The hands behind", "the transformation."]}
          />

          <div className="mt-12 space-y-6">
            {settings.biography.map((para, i) => (
              <Reveal key={i} delay={200 + i * 120}>
                <p className={i === 0 ? "body-lg" : "body-base"}>{para}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={640}>
            <dl className="mt-14 grid gap-x-10 gap-y-8 border-t border-ivory/12 pt-10 sm:grid-cols-2">
              <div>
                <dt className="eyebrow mb-3">Based in</dt>
                <dd className="font-display text-2xl text-ivory">{settings.location}</dd>
              </div>
              <div>
                <dt className="eyebrow mb-3">Discipline</dt>
                <dd className="body-base !text-ivory/80">{settings.experience}</dd>
              </div>
              <div>
                <dt className="eyebrow mb-3">Travel</dt>
                <dd className="body-base !text-ivory/80">
                  Available across Tamil Nadu and beyond
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

          <Reveal delay={780}>
            <Link href="/about" className="btn btn-ghost mt-12">
              Read her story
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
