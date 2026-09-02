import type { PortfolioItem, SiteSettings } from "@/lib/types";
import EditorialImage from "@/components/ui/EditorialImage";
import Reveal from "@/components/ui/Reveal";
import InstagramLink from "@/components/ui/InstagramLink";

/**
 * THE INSTAGRAM STRIP
 *
 * Six squares of Lana's most recent CURATED work, linking out to the posts.
 *
 * Read from the content provider — never a live fetch at render. The site
 * talks to the store; only /api/instagram/sync ever talks to Meta. That is
 * what keeps a Meta outage, a rate limit or an expired token from becoming a
 * slow homepage.
 *
 * Renders nothing below six items. A strip of two is not a strip, it is an
 * admission, and this section only exists to say "there is more, and it is
 * recent".
 */
export default function InstagramStrip({
  items,
  settings,
}: {
  items: PortfolioItem[];
  settings: SiteSettings;
}) {
  const strip = items.filter((i) => i.published && i.permalink).slice(0, 6);
  if (strip.length < 6) return null;

  return (
    <div className="shell mt-[var(--s-12)]">
      <Reveal>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <p className="eyebrow">Latest</p>
          <InstagramLink
            href={settings.instagram}
            placement="strip"
            className="link-wipe text-[0.8rem] uppercase tracking-[0.26em] text-ivory/70 transition-colors duration-[var(--d-base)] hover:text-ivory"
          >
            {settings.instagramHandle}
          </InstagramLink>
        </div>
      </Reveal>

      <ul className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
        {strip.map((item, i) => (
          <li key={item.id}>
            <Reveal delay={i * 70}>
              <a
                href={item.permalink}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="open"
                className="group relative block aspect-square overflow-hidden"
              >
                <div className="absolute inset-0 transition-transform duration-[var(--d-slow)] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]">
                  <EditorialImage
                    image={{
                      src: item.thumbnailUrl ?? item.imageUrl,
                      alt: item.alt,
                      tone: item.tone,
                      seed: item.seed,
                      blurDataURL: item.blurDataURL,
                    }}
                    className="h-full w-full"
                    sizes="(max-width: 1024px) 31vw, 16vw"
                    decorative
                  />
                </div>
                <span className="sr-only">{item.title} — open on Instagram</span>
              </a>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}
