import Link from "next/link";
import { sectionEyebrow } from "@/lib/utils";
import type { BrideStory, SiteSettings } from "@/lib/types";
import EditorialImage from "@/components/ui/EditorialImage";
import ParallaxFrame from "@/components/ui/ParallaxFrame";
import Reveal from "@/components/ui/Reveal";
import SplitLines from "@/components/ui/SplitLines";
import StoryLink from "./StoryLink";

/** ACT V — THE WOMEN (§17) */
export default function BrideStories({
  index,
  brides,
  settings,
}: {
  index: number;
  brides: BrideStory[];
  settings: SiteSettings;
}) {
  if (brides.length === 0) return null;

  return (
    <section className="section-dark relative py-[var(--s-12)] sm:py-[var(--s-16)]" aria-labelledby="brides-title">
      <div className="shell">
        <Reveal>
          <p className="eyebrow mb-8">{sectionEyebrow(index, "Lana brides")}</p>
        </Reveal>
        <SplitLines
          as="h2"
          id="brides-title"
          className="display-md max-w-[18ch] text-ivory"
          lines={["The women we’ve had", "the honour to create."]}
        />

        {settings.showPlaceholderBadges && (
          <Reveal delay={200}>
            <p className="body-base mt-8 max-w-xl border-l border-champagne/30 pl-5">
              The entries below demonstrate the story format. Real bride stories, with permission
              and photography, replace them without any change to this page.
            </p>
          </Reveal>
        )}

        <ul className="mt-20 space-y-24 sm:space-y-32">
          {brides.map((b, i) => (
            <li key={b.slug}>
              <article
                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-20 ${
                  i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <ParallaxFrame strength={0.6}>
                  <Reveal blur>
                    <StoryLink slug={b.slug} name={b.name}>
                      <div
                        className="relative aspect-[4/5] w-full overflow-hidden"
                        style={{ transform: "translate3d(0, calc(var(--sy) * 26px), 0)" }}
                      >
                        <div className="absolute inset-[-4%] transition-transform duration-[var(--d-slow)] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
                          <EditorialImage
                            image={b.hero}
                            className="h-full w-full"
                            sizes="(max-width: 1024px) 92vw, 46vw"
                            badgeLabel="Sample story"
                          />
                        </div>
                      </div>
                    </StoryLink>
                  </Reveal>
                </ParallaxFrame>

                <div>
                  <Reveal delay={140}>
                    <p className="eyebrow mb-6">
                      {b.weddingType} · {b.location}
                    </p>
                    <h3 className="display-sm text-ivory">
                      <Link href={`/brides/${b.slug}`} className="link-wipe">
                        {b.name}
                      </Link>
                    </h3>
                    <p className="body-lg mt-7 max-w-md">{b.excerpt}</p>

                    <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-4 border-t border-ivory/12 pt-7">
                      <div>
                        <dt className="eyebrow mb-2">Look</dt>
                        <dd className="text-sm text-ivory/80">{b.look}</dd>
                      </div>
                      <div>
                        <dt className="eyebrow mb-2">Date</dt>
                        <dd className="text-sm text-ivory/80">{b.date}</dd>
                      </div>
                    </dl>

                    <Link href={`/brides/${b.slug}`} className="btn btn-ghost mt-10">
                      Read her story
                    </Link>
                  </Reveal>
                </div>
              </article>
            </li>
          ))}
        </ul>

        <Reveal>
          <div className="mt-24 text-center">
            <Link href="/brides" className="btn">
              All bride stories
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
