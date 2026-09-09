import type { Metadata } from "next";
import Link from "next/link";
import { content, currentContentSource } from "@/lib/content/provider";
import { pageMetadata } from "@/lib/seo";
import { readCredentials } from "@/lib/instagram/client";
import { readStore, storeIsDurable } from "@/lib/instagram/store";
import { countEnquiries, listEnquiries, storeIsConfigured } from "@/lib/enquiries";
import EnquiryList from "@/components/admin/EnquiryList";

export const metadata: Metadata = pageMetadata({
  title: "Admin",
  path: "/admin",
  noIndex: true,
});

export const dynamic = "force-dynamic";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  /admin — CMS PREPARATION SURFACE (§41)
 * ═══════════════════════════════════════════════════════════════════════════
 *  Deliberately READ-ONLY. It shows the shape of the eventual dashboard, the
 *  live state of the content pipeline, and the enquiries the studio has
 *  received. It exposes no editing capability and no credentials.
 *
 *  Gated by src/proxy.ts behind a single shared password (ADMIN_PASSWORD),
 *  and disallowed in robots.txt. With no password configured the route is a
 *  404 — an unconfigured secret must never mean an open door.
 *
 *  ⚠ THIS PAGE NOW HOLDS PERSONAL DATA. The enquiry list carries brides'
 *    names, phone numbers and email addresses, which is a materially
 *    different thing to guard than a pipeline status table. Two consequences:
 *
 *      · ADMIN_PASSWORD must be a real generated secret, not a memorable
 *        word. `openssl rand -base64 24`, as .env.example says.
 *      · The day more than one person needs access — or /admin can WRITE
 *        anything — a single shared password stops being adequate and this
 *        needs real per-user authentication.
 *
 *    The route is a 404 until that password is set, so an unconfigured site
 *    exposes nothing at all.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const PANELS = [
  { name: "Portfolio", note: "Curate, categorise, feature and publish imported media.", href: "/portfolio" },
  { name: "Brides", note: "Bride stories — hero, gallery, narrative, services.", href: "/brides" },
  { name: "Journal", note: "Articles, categories, tags and per-post SEO.", href: "/journal" },
  { name: "Services", note: "The bridal worlds, ordering and inclusions.", href: "/services" },
  { name: "Testimonials", note: "Hidden site-wide until real testimonials exist.", href: "/about" },
  { name: "FAQs", note: "Questions, answers and ordering.", href: "/faq" },
  { name: "SEO", note: "Titles, descriptions, canonicals, OG images, schema.", href: "/sitemap.xml" },
  { name: "Settings", note: "Brand, contact, location, social, CTA copy.", href: "/contact" },
];

function Row({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-ivory/10 py-4">
      <dt className="text-sm text-ivory/60">{label}</dt>
      <dd
        className={`text-right font-mono text-xs tracking-wide ${
          good === undefined ? "text-ivory/80" : good ? "text-champagne" : "text-rose"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

export default async function AdminPage() {
  const provider = content();
  const [items, brides, posts, services, testimonials, settings] = await Promise.all([
    provider.getPortfolio(),
    provider.getBrides(),
    provider.getPosts(),
    provider.getServices(),
    provider.getTestimonials(),
    provider.getSiteSettings(),
  ]);

  const igConfigured = Boolean(readCredentials());
  const store = await readStore();
  const durable = storeIsDurable();
  const source = currentContentSource();

  // The enquiry record. Empty and harmless when no store is configured.
  const enquiriesConfigured = storeIsConfigured();
  const [enquiries, enquiryCount] = await Promise.all([listEnquiries(100), countEnquiries()]);
  const emailConfigured = Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL);

  return (
    <div className="shell pb-28 pt-[calc(var(--nav-h)+5rem)]">
      <p className="eyebrow mb-6">Internal</p>
      <h1 className="display-md text-ivory">Content dashboard</h1>
      <p className="body-base mt-5 max-w-2xl">
        Read-only preview of the content pipeline. No editing is exposed here — this route exists
        so a CMS can be dropped in behind the same <code className="text-champagne">ContentProvider</code>{" "}
        interface the whole site already consumes.
      </p>

      {/* ── ENQUIRIES ────────────────────────────────────────────────────
          First on the page, because it is the only thing here with a bride
          waiting at the other end of it. */}
      <section aria-labelledby="enquiries" className="mt-14">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="enquiries" className="eyebrow">
            Enquiries
          </h2>
          <p className="font-mono text-[0.7rem] tracking-wide text-muted">
            {enquiriesConfigured
              ? `${enquiryCount < 0 ? "?" : enquiryCount} held · showing ${enquiries.length}`
              : "no durable store connected"}
          </p>
        </div>

        {!enquiriesConfigured && (
          <p className="body-base mb-6 rounded-lg border border-rose/30 bg-ink-2 px-5 py-4 text-sm">
            <strong className="font-medium text-rose">Nothing is being kept.</strong> Enquiries are
            validated and {emailConfigured ? "emailed" : "written to the server log"}, but no
            durable copy is stored — a failed send or a deleted email loses it for good. Connect a
            Redis store and set <code className="text-champagne">KV_REST_API_URL</code> and{" "}
            <code className="text-champagne">KV_REST_API_TOKEN</code>.
          </p>
        )}

        <EnquiryList enquiries={enquiries} />
      </section>

      <div className="mt-14 grid gap-14 lg:grid-cols-2">
        <section aria-labelledby="pipeline">
          <h2 id="pipeline" className="eyebrow mb-6">
            Pipeline status
          </h2>
          <dl className="border-t border-ivory/10">
            <Row label="CONTENT_SOURCE" value={source} good />
            <Row
              label="Instagram credentials"
              value={igConfigured ? "configured" : "not configured"}
              good={igConfigured}
            />
            <Row
              label="Sync secret"
              value={process.env.INSTAGRAM_SYNC_SECRET ? "set" : "not set"}
              good={Boolean(process.env.INSTAGRAM_SYNC_SECRET)}
            />
            <Row
              label="Synced media store"
              value={durable ? "Vercel KV (durable)" : "memory only — lost on redeploy"}
              good={durable}
            />
            <Row label="Last Instagram sync" value={store.syncedAt ?? "never"} />
            <Row label="Media in store" value={String(store.items.length)} />
            <Row
              label="Media published"
              value={String(store.items.filter((i) => i.published).length)}
            />
            <Row
              label="Enquiry email (Resend)"
              value={emailConfigured ? "configured" : "not configured"}
              good={emailConfigured}
            />
            <Row
              label="Enquiry record (KV)"
              value={enquiriesConfigured ? "durable" : "none — enquiries not kept"}
              good={enquiriesConfigured}
            />
            <Row label="Portfolio items live" value={String(items.length)} />
            <Row label="Bride stories" value={String(brides.length)} />
            <Row label="Journal articles" value={String(posts.length)} />
            <Row label="Services" value={String(services.length)} />
            <Row
              label="Testimonials"
              value={testimonials.length === 0 ? "none — section hidden" : String(testimonials.length)}
              good={testimonials.length > 0}
            />
            <Row
              label="Demo content flag"
              value={settings.contentIsPlaceholder ? "on" : "off"}
              good={!settings.contentIsPlaceholder}
            />
          </dl>

          <div className="mt-10 rounded-lg border border-ivory/12 bg-ink-2 p-6">
            <h3 className="eyebrow mb-4">Run an Instagram sync</h3>
            <pre className="overflow-x-auto text-xs leading-relaxed text-ivory/70">
{`curl -X POST /api/instagram/sync \\
  -H "Authorization: Bearer $INSTAGRAM_SYNC_SECRET"`}
            </pre>
            <p className="body-base mt-4 !text-xs">
              Imported media arrives <strong className="text-ivory/80">unpublished</strong>. Nothing
              reaches the public site until it is explicitly published.
            </p>
          </div>
        </section>

        <section aria-labelledby="panels">
          <h2 id="panels" className="eyebrow mb-6">
            Planned panels
          </h2>
          <ul className="divide-y divide-ivory/10 border-y border-ivory/10">
            {PANELS.map((p) => (
              <li key={p.name} className="flex items-start justify-between gap-6 py-5">
                <div>
                  <p className="font-display text-xl text-ivory">{p.name}</p>
                  <p className="body-base mt-1 !text-xs">{p.note}</p>
                </div>
                <Link
                  href={p.href}
                  className="link-wipe shrink-0 text-[0.75rem] uppercase tracking-[0.2em] text-muted"
                >
                  View live
                </Link>
              </li>
            ))}
          </ul>

          <p className="body-base mt-10 border-l border-champagne/30 pl-5 !text-xs">
            Before adding any write capability here, put real authentication in front of this
            route. It is already excluded from robots.txt and from the sitemap.
          </p>
        </section>
      </div>
    </div>
  );
}
