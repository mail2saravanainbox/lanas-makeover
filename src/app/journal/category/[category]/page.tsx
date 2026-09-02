import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { content } from "@/lib/content/provider";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import EditorialImage from "@/components/ui/EditorialImage";
import PageHeader from "@/components/ui/PageHeader";
import Reveal from "@/components/ui/Reveal";
import JsonLd from "@/components/ui/JsonLd";
import { slugify } from "@/lib/utils";

/**
 * JOURNAL CATEGORY ARCHIVES
 *
 * Gated on volume, deliberately. A category page listing two articles is a
 * worse page than no page: it dilutes the journal index in search, gives a
 * reader a dead end, and advertises how little has been written.
 *
 * Below the threshold this route generates NO paths and returns notFound(),
 * so the archives switch themselves on the day the writing justifies them —
 * no code change, no deploy, just the twelfth article.
 */
const THRESHOLD = 12;

export const dynamicParams = false;

async function categories() {
  const posts = await content().getPosts();
  if (posts.length < THRESHOLD) return [];
  return Array.from(new Set(posts.map((p) => p.category)));
}

export async function generateStaticParams() {
  return (await categories()).map((c) => ({ category: slugify(c) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const name = (await categories()).find((c) => slugify(c) === category);
  if (!name) {
    return pageMetadata({ title: "Not found", path: `/journal/category/${category}`, noIndex: true });
  }
  return pageMetadata({
    title: `${name} — Journal`,
    description: `Articles on ${name.toLowerCase()} from Lana's Makeover — Tamil bridal makeup and hair, Trichy.`,
    path: `/journal/category/${category}`,
  });
}

export default async function JournalCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const name = (await categories()).find((c) => slugify(c) === category);
  if (!name) notFound();

  const posts = (await content().getPosts()).filter((p) => p.category === name);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Journal", path: "/journal" },
          { name, path: `/journal/category/${category}` },
        ])}
      />

      <PageHeader
        eyebrow="Journal"
        titleLines={[name]}
        intro={`Everything written on ${name.toLowerCase()}.`}
        breadcrumb={[
          { name: "Home", href: "/" },
          { name: "Journal", href: "/journal" },
          { name, href: `/journal/category/${category}` },
        ]}
      />

      <div className="shell pb-[var(--s-12)] sm:pb-[var(--s-16)]">
        <ul className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <li key={p.slug}>
              <Reveal delay={i * 80}>
                <Link href={`/journal/${p.slug}`} data-cursor="read" className="group block">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <div className="absolute inset-0 transition-transform duration-[var(--d-slow)] group-hover:scale-105">
                      <EditorialImage
                        image={p.cover}
                        className="h-full w-full"
                        sizes="(max-width: 640px) 92vw, 31vw"
                        decorative
                      />
                    </div>
                  </div>
                  <p className="mt-5 font-display text-xl leading-snug text-ivory group-hover:text-champagne">
                    {p.title}
                  </p>
                  <p className="body-base mt-2">{p.excerpt}</p>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
