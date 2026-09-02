import type { Metadata } from "next";
import Link from "next/link";
import { content } from "@/lib/content/provider";
import { journalCover } from "@/lib/content/slots";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import PageHeader from "@/components/ui/PageHeader";
import EditorialImage from "@/components/ui/EditorialImage";
import Reveal from "@/components/ui/Reveal";
import JsonLd from "@/components/ui/JsonLd";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "The Lana Journal",
  description:
    "Practical writing on South Indian bridal beauty — natural and HD makeup, bridal hair, skin preparation and wedding-morning planning.",
  path: "/journal",
});

export default async function JournalPage() {
  const all = await content().getPosts();
  // A different photograph per article — never one bridal image for all (§20).
  const posts = all.map((p, i) => ({ ...p, cover: journalCover(i, p.cover) }));
  const [lead, ...rest] = posts;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Journal", path: "/journal" },
        ])}
      />

      <PageHeader
        eyebrow="The journal"
        titleLines={["The Lana Journal."]}
        intro="Bridal beauty, hair and wedding preparation — written to be genuinely useful rather than to fill a page."
        breadcrumb={[
          { name: "Home", href: "/" },
          { name: "Journal", href: "/journal" },
        ]}
      />

      {posts.length === 0 ? (
        <p className="shell body-lg pb-40 text-center">The first articles are being written.</p>
      ) : (
        <div className="shell pb-[var(--s-12)] sm:pb-[var(--s-16)]">
          {/* Lead article */}
          <Reveal blur>
            <Link href={`/journal/${lead.slug}`} className="group block">
              <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <div className="absolute inset-0 transition-transform duration-[var(--d-slow)] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]">
                    <EditorialImage
                      image={lead.cover}
                      className="h-full w-full"
                      sizes="(max-width: 1024px) 92vw, 48vw"
                      priority
                      decorative
                    />
                  </div>
                </div>
                <div>
                  <p className="eyebrow mb-5">
                    {lead.category} · {formatDate(lead.publishedAt)} · {lead.readingMinutes} min
                  </p>
                  <h2 className="display-sm text-ivory transition-colors duration-[var(--d-base)] group-hover:text-champagne">
                    {lead.title}
                  </h2>
                  <p className="body-lg mt-6 max-w-xl">{lead.excerpt}</p>
                  <span className="mt-8 inline-block text-[0.75rem] uppercase tracking-[0.24em] text-muted">
                    Read the article
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>

          {rest.length > 0 && (
            <ul className="mt-24 grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p, i) => (
                <li key={p.slug} className={i % 3 === 1 ? "lg:mt-14" : ""}>
                  <Reveal delay={(i % 3) * 120}>
                    <Link href={`/journal/${p.slug}`} className="group block">
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <div className="absolute inset-0 transition-transform duration-[var(--d-slow)] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]">
                          <EditorialImage
                            image={p.cover}
                            className="h-full w-full"
                            sizes="(max-width: 640px) 92vw, 31vw"
                            decorative
                          />
                        </div>
                      </div>
                      <p className="eyebrow mt-6">
                        {p.category} · {formatDate(p.publishedAt)}
                      </p>
                      <h2 className="mt-3 font-display text-2xl leading-snug text-ivory transition-colors duration-[var(--d-base)] group-hover:text-champagne">
                        {p.title}
                      </h2>
                      <p className="body-base mt-3 line-clamp-3">{p.excerpt}</p>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
