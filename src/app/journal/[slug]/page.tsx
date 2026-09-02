import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { content } from "@/lib/content/provider";
import { getImageSlots, journalCover } from "@/lib/content/slots";
import { absoluteUrl, articleSchema, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import EditorialImage from "@/components/ui/EditorialImage";
import ArticleBody from "@/components/journal/ArticleBody";
import Reveal from "@/components/ui/Reveal";
import SplitLines from "@/components/ui/SplitLines";
import JsonLd from "@/components/ui/JsonLd";
import JournalViewTracker from "@/components/journal/JournalViewTracker";
import { formatDate } from "@/lib/utils";

/**
 * Only published slugs get a page; anything else is a real 404 rather than a
 * soft-404. See src/app/README-loading.md.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await content().getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await content().getPost(slug);
  if (!post) return pageMetadata({ title: "Not found", path: `/journal/${slug}`, noIndex: true });

  return pageMetadata({
    title: post.seo?.title ?? post.title,
    description: post.seo?.description ?? post.excerpt,
    path: post.seo?.canonical ?? `/journal/${post.slug}`,
    image:
      post.seo?.ogImage ??
      post.cover.src ??
      absoluteUrl(`/journal/${post.slug}/opengraph-image`),
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    tags: post.tags,
  });
}

export default async function JournalArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const provider = content();
  const post = await provider.getPost(slug);
  if (!post) notFound();

  const [all, settings] = await Promise.all([provider.getPosts(), provider.getSiteSettings()]);
  const slots = getImageSlots();

  /**
   * Resolve the cover from the archive, exactly as /journal does. Without
   * this the index shows a photograph and the article you click through to
   * shows a placeholder plate — the same post, two different covers.
   * journalCover is index-based, so it must be the post's index in the same
   * ordered list the index page uses.
   */
  const cover = journalCover(
    all.findIndex((x) => x.slug === post.slug),
    post.cover,
  );

  /**
   * A person, not a masthead. The content files record the author as the brand
   * ("Lana's Makeover"); a byline reading "By Lana's Makeover" is a business
   * writing about itself. Where the recorded author IS the brand, credit the
   * artist. A genuinely different author is printed as given.
   */
  const byline =
    post.author === settings.brandName || post.author === settings.artistName
      ? settings.artistName
      : post.author;

  /**
   * Related by SHARED TAG, most tags in common first — not simply "the next
   * three posts". A reader who just finished a piece on jadai should be
   * offered the other hair writing, not whatever published most recently.
   * Falls back to recency only when nothing shares a tag.
   */
  const tags = new Set(post.tags);
  const others = all.filter((p) => p.slug !== post.slug);
  const related = others
    .map((p) => ({ post: p, shared: p.tags.filter((t) => tags.has(t)).length }))
    // Most tags in common wins; recency only breaks ties. Always two, so the
    // block never looks half-built when nothing happens to share a tag.
    .sort((a, b) => b.shared - a.shared || (a.post.publishedAt < b.post.publishedAt ? 1 : -1))
    .slice(0, 2)
    // Resolve their covers as well — the "Keep reading" cards were showing
    // placeholder plates next to a cover that had resolved to a photograph.
    .map((x) => ({
      ...x.post,
      cover: journalCover(all.findIndex((y) => y.slug === x.post.slug), x.post.cover),
    }));

  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            title: post.seo?.title ?? post.title,
            description: post.seo?.description ?? post.excerpt,
            slug: post.slug,
            publishedAt: post.publishedAt,
            updatedAt: post.updatedAt,
            image: post.cover.src ? absoluteUrl(post.cover.src) : undefined,
            tags: post.tags,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Journal", path: "/journal" },
            { name: post.title, path: `/journal/${post.slug}` },
          ]),
        ]}
      />
      <JournalViewTracker slug={post.slug} category={post.category} />

      <article>
        <header className="shell pb-14 pt-[calc(var(--nav-h)+5rem)] sm:pt-[calc(var(--nav-h)+7rem)]">
          <Reveal>
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex flex-wrap gap-2 text-[0.75rem] uppercase tracking-[0.24em] text-muted">
                <li>
                  <Link href="/" className="link-wipe hover:text-ivory">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">·</li>
                <li>
                  <Link href="/journal" className="link-wipe hover:text-ivory">
                    Journal
                  </Link>
                </li>
                <li aria-hidden="true">·</li>
                <li className="text-ivory/60">{post.category}</li>
              </ol>
            </nav>
          </Reveal>

          <SplitLines
            as="h1"
            className="display-md max-w-[20ch] text-balance text-ivory"
            lines={[post.title]}
          />

          <Reveal delay={280}>
            <p className="body-lg mt-8 max-w-2xl">{post.excerpt}</p>
          </Reveal>

          <Reveal delay={380}>
            {/* A byline with a face when there is a real photograph of Lana,
                and a byline without one until then — never a stock portrait
                standing in for the author. */}
            <div className="mt-10 flex items-center gap-4">
              {slots.artistPortrait && (
                <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-full">
                  <EditorialImage
                    image={slots.artistPortrait}
                    className="h-full w-full"
                    sizes="48px"
                    decorative
                  />
                </span>
              )}
              <p className="eyebrow">
                By {byline} ·{" "}
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> ·{" "}
                {post.readingMinutes} min read
              </p>
            </div>
          </Reveal>
        </header>

        <div className="shell">
          <Reveal blur>
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <EditorialImage
                image={cover}
                className="h-full w-full"
                sizes="(max-width: 1280px) 96vw, 90vw"
                priority
                decorative
              />
            </div>
          </Reveal>
        </div>

        <div className="shell-narrow py-16 sm:py-24">
          <ArticleBody body={post.body} />

          {post.tags.length > 0 && (
            <ul className="mt-16 flex flex-wrap gap-3 border-t border-ivory/12 pt-8">
              {post.tags.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-ivory/15 px-4 py-1.5 text-[0.75rem] uppercase tracking-[0.2em] text-muted"
                >
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-articles" className="shell pb-[var(--s-12)] sm:pb-[var(--s-16)]">
          <h2 id="related-articles" className="display-sm mb-10 text-ivory">
            Keep reading
          </h2>
          <ul className="grid gap-10 sm:grid-cols-2">
            {related.map((p) => (
              <li key={p.slug}>
                <Link href={`/journal/${p.slug}`} data-cursor="read" className="group block">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <div className="absolute inset-0 transition-transform duration-[var(--d-slow)] group-hover:scale-105">
                      <EditorialImage
                        image={p.cover}
                        className="h-full w-full"
                        sizes="(max-width: 640px) 92vw, 46vw"
                        decorative
                      />
                    </div>
                  </div>
                  <p className="eyebrow mt-5">{p.category}</p>
                  <p className="mt-2 font-display text-xl leading-snug text-ivory group-hover:text-champagne">
                    {p.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* The article ends, and the one thing a reader might want to do next is
          right there rather than a scroll away in the footer. */}
      <section aria-labelledby="journal-cta" className="shell pb-[var(--s-12)] sm:pb-[var(--s-16)]">
        <Reveal>
          <div className="flex flex-col gap-8 border-t border-ivory/12 pt-12 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow mb-4">Enquiries</p>
              <p id="journal-cta" className="display-sm max-w-[18ch] text-balance text-ivory">
                Have a date in mind?
              </p>
            </div>
            <Link href="/contact" className="btn shrink-0">
              {settings.bookingCta}
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
