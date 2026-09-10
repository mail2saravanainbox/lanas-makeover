import Link from "next/link";
import Image from "next/image";
import type { SiteSettings } from "@/lib/types";
import InstagramLink from "./InstagramLink";
import JasmineMark from "./JasmineMark";

/**
 * SIMPLIFIED (§34).
 *
 * Was five columns' worth of links across three headings, including three
 * discipline routes that duplicate what /portfolio and /services already
 * cover. A footer is a map, not an index: navigation, locations, contact,
 * legal — and the same one booking CTA the rest of the site uses.
 */
const COLUMNS: Array<{ title: string; links: Array<{ href: string; label: string }> }> = [
  {
    title: "Navigation",
    links: [
      { href: "/portfolio", label: "Work" },
      { href: "/services", label: "Services" },
      { href: "/about", label: "About" },
      { href: "/journal", label: "Journal" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Check Your Date" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export default function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-ivory/10 bg-ink text-ivory">
      <div className="shell py-20 sm:py-28">
        <div className="grid gap-16 lg:grid-cols-[1.4fr_2fr]">
          <div>
            {/* The positioning line, verbatim, in the same words as the hero. */}
            <p className="eyebrow mb-6">Bridal Makeup &amp; Hair Artist</p>
            <p className="display-md max-w-md text-ivory">
              Your story
              <br />
              <span className="italic-serif text-champagne">starts here.</span>
            </p>
            <Link href="/contact" className="btn mt-10">
              {settings.bookingCta}
            </Link>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {/* §3 — the four service locations, stated on every page of the
                site. One business, four areas served: the heading says so, so
                the list cannot be read as four branches. */}
            <div>
              <h2 className="eyebrow mb-5">Serving</h2>
              <ul className="space-y-3">
                {settings.serviceAreas.map((city) => (
                  <li key={city} className="text-sm text-ivory/65">
                    {city}
                  </li>
                ))}
              </ul>
            </div>

            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="eyebrow mb-5">{col.title}</h2>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="link-wipe text-sm text-ivory/65 transition-colors duration-[var(--d-base)] hover:text-ivory"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <hr className="hairline my-14" />

        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            {/* Lana's own logo, at a size it can actually be read at. The
                artwork carries its own black ground, which sits on the site's
                warm black as the swatch floating rather than as a box — the
                reason it is here and not on an ivory surface. */}
            {settings.logo?.src ? (
              <Image
                src={settings.logo.src}
                alt={settings.logo.alt}
                width={settings.logo.width ?? 900}
                height={settings.logo.height ?? 616}
                sizes="(max-width: 640px) 60vw, 220px"
                placeholder={settings.logo.blurDataURL ? "blur" : undefined}
                blurDataURL={settings.logo.blurDataURL}
                className="h-auto w-[clamp(9rem,34vw,13.75rem)]"
              />
            ) : (
              <p className="font-display text-2xl uppercase tracking-[0.3em] text-ivory">
                {settings.brandName}
              </p>
            )}

            {/* The mark and the one word of Tamil on the site. A signature,
                not a translation — see settings.signatureTamil. */}
            <p className="mt-4 flex items-center gap-3 text-champagne/70">
              <JasmineMark className="h-5 w-5 shrink-0" />
              <span lang="ta" className="signature-tamil">
                {settings.signatureTamil}
              </span>
            </p>

            <p className="body-base mt-3 max-w-sm">
              Based in {settings.location}. {settings.travelNote}
            </p>
          </div>

          <ul className="space-y-2 text-sm text-ivory/65">
            <li>
              <InstagramLink
                href={settings.instagram}
                className="link-wipe transition-colors duration-[var(--d-base)] hover:text-ivory"
                placement="footer"
              >
                {settings.instagramHandle}
              </InstagramLink>
            </li>
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="link-wipe hover:text-ivory">
                  {settings.email}
                </a>
              </li>
            )}
            {settings.phone && (
              <li>
                <a
                  href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                  className="link-wipe hover:text-ivory"
                >
                  {settings.phone}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div className="mt-14 flex flex-col gap-3 text-[0.75rem] uppercase tracking-[0.22em] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.brandName}
          </p>
          {/* TODO(client): a build credit goes here if one is ever wanted. */}
        </div>

        {/* The public "Preview build" notice was removed at the client's
            request. `contentIsPlaceholder` is still live and still drives the
            /admin status panel and the note on /about, so the flag remains the
            single source of truth about what is and is not real — it is simply
            no longer announced to visitors in the footer. */}
      </div>
    </footer>
  );
}
