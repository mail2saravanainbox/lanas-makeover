import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import InstagramLink from "./InstagramLink";
import JasmineMark from "./JasmineMark";

const COLUMNS: Array<{ title: string; links: Array<{ href: string; label: string }> }> = [
  {
    title: "The Work",
    links: [
      { href: "/portfolio", label: "Portfolio" },
      { href: "/brides", label: "Bride Stories" },
      { href: "/bridal", label: "Bridal" },
      { href: "/hair", label: "Bridal Hair" },
      { href: "/makeup", label: "Makeup" },
    ],
  },
  {
    title: "The Studio",
    links: [
      { href: "/about", label: "About Lana" },
      { href: "/services", label: "Services" },
      { href: "/journal", label: "Journal" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Enquire" },
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
            <p className="eyebrow mb-6">{settings.tagline}</p>
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
            <p className="font-display text-2xl uppercase tracking-[0.3em] text-ivory">
              {settings.brandName}
            </p>

            {/* The mark and the one word of Tamil on the site. A signature,
                not a translation — see settings.signatureTamil. */}
            <p className="mt-4 flex items-center gap-3 text-champagne/70">
              <JasmineMark className="h-5 w-5 shrink-0" />
              <span lang="ta" className="signature-tamil">
                {settings.signatureTamil}
              </span>
            </p>

            <p className="body-base mt-3 max-w-sm">{settings.location} · Travel available</p>
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
          <p>Designed as a bridal editorial experience</p>
        </div>

        {settings.contentIsPlaceholder && (
          <p className="mt-8 rounded-lg border border-ivory/10 bg-ink-2 px-5 py-4 text-[0.75rem] leading-relaxed tracking-wide text-muted">
            <strong className="font-medium text-ivory/70">Preview build.</strong> Imagery on this
            site is procedurally-generated placeholder artwork, not client photography, and copy
            marked in the content files is awaiting Lana&apos;s confirmation. No testimonial,
            price, credential or client is represented here.
          </p>
        )}
      </div>
    </footer>
  );
}
