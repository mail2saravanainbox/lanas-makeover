import Link from "next/link";
import type { BlogPost } from "@/lib/types";
import EditorialImage from "@/components/ui/EditorialImage";
import Reveal from "@/components/ui/Reveal";
import SplitLines from "@/components/ui/SplitLines";
import { formatDate, sectionEyebrow } from "@/lib/utils";

/** THE LANA JOURNAL (§23) — homepage teaser */
export default function JournalTeaser({
  index,
  posts,
}: {
  index: number;
  posts: BlogPost[];
}) {
  if (posts.length === 0) return null;
  const featured = posts.slice(0, 3);

  return (
    <section className="section-dark relative py-[var(--s-12)] sm:py-[var(--s-16)]" aria-labelledby="journal-title">
      <div className="shell">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal>
              <p className="eyebrow mb-8">{sectionEyebrow(index, "The journal")}</p>
            </Reveal>
            <SplitLines
              as="h2"
              id="journal-title"
              className="display-md text-ivory"
              lines={["The Lana Journal."]}
            />
          </div>
          <Reveal delay={220}>
            <Link href="/journal" className="btn btn-ghost shrink-0">
              All articles
            </Link>
          </Reveal>
        </div>

        <ul className="mt-16 grid gap-10 md:grid-cols-3">
          {featured.map((p, i) => (
            <li key={p.slug}>
              <Reveal delay={i * 130}>
                <Link href={`/journal/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <div className="absolute inset-0 transition-transform duration-[var(--d-slow)] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]">
                      <EditorialImage
                        image={p.cover}
                        className="h-full w-full"
                        sizes="(max-width: 768px) 92vw, 30vw"
                        decorative
                      />
                    </div>
                  </div>
                  <p className="eyebrow mt-6">
                    {p.category} · {formatDate(p.publishedAt)}
                  </p>
                  <h3 className="mt-4 font-display text-2xl leading-snug text-ivory transition-colors duration-[var(--d-base)] group-hover:text-champagne">
                    {p.title}
                  </h3>
                  <p className="body-base mt-3 line-clamp-3">{p.excerpt}</p>
                  <span className="mt-5 inline-block text-[0.75rem] uppercase tracking-[0.24em] text-muted">
                    {p.readingMinutes} min read
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
