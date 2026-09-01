import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { content } from "@/lib/content/provider";
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

  const all = await provider.getPosts();
  const related = all.filter((p) => p.slug !== post.slug).slice(0, 3);

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
              <ol className="flex flex-wrap gap-2 text-[0.6rem] uppercase tracking-[0.24em] text-muted">
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
            <p className="eyebrow mt-10">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> ·{" "}
              {post.readingMinutes} min read · {post.author}
            </p>
          </Reveal>
        </header>

        <div className="shell">
          <Reveal blur>
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <EditorialImage
                image={post.cover}
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
                  className="rounded-full border border-ivory/15 px-4 py-1.5 text-[0.6rem] uppercase tracking-[0.2em] text-muted"
                >
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-articles" className="shell pb-28 sm:pb-40">
          <h2 id="related-articles" className="display-sm mb-10 text-ivory">
            Keep reading
          </h2>
          <ul className="grid gap-10 sm:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug}>
                <Link href={`/journal/${p.slug}`} data-cursor="read" className="group block">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <div className="absolute inset-0 transition-transform duration-[1300ms] group-hover:scale-105">
                      <EditorialImage
                        image={p.cover}
                        className="h-full w-full"
                        sizes="(max-width: 640px) 92vw, 31vw"
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
    </>
  );
}
