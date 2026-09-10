import { sectionEyebrow } from "@/lib/utils";
import { waLink } from "@/lib/whatsapp";
import type { SiteSettings } from "@/lib/types";
import Reveal from "@/components/ui/Reveal";
import SplitLines from "@/components/ui/SplitLines";
import KolamGrid from "./KolamGrid";
import BookingLink from "./BookingLink";

/** YOUR STORY STARTS HERE (§27) */
export default function ClosingCTA({
  index,
  settings,
}: {
  /**
   * Only the homepage numbers its sections. This used to default to eleven,
   * so every inner page — services, about, faq, portfolio, each collection,
   * each service, the disciplines — announced itself as the eleventh section
   * of eleven, on pages that have four.
   *
   * Undefined now means "no number", which `sectionEyebrow` already handles.
   */
  index?: number;
  settings: SiteSettings;
}) {
  const whatsapp = waLink();
  return (
    <section className="relative overflow-hidden bg-ivory py-28 text-ink sm:py-40 surface-ivory" aria-labelledby="cta-title">
      <KolamGrid
        className="pointer-events-none absolute -left-[8%] -top-[10%] h-[38rem] w-[38rem] text-ink/[0.045]"
        cells={6}
      />

      <div className="shell relative grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div>
          <Reveal>
            <p className="eyebrow mb-8 !text-muted-ivory">{sectionEyebrow(index, "Check your date")}</p>
          </Reveal>
          <SplitLines
            as="h2"
            id="cta-title"
            className="display-lg text-ink"
            lines={["Your story", "starts here."]}
          />
          <Reveal delay={280}>
            <p className="mt-10 max-w-lg text-lg leading-relaxed text-ink/70">
              Send the date, the city and the events. You will be told plainly whether it is open.
            </p>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-12 flex flex-wrap gap-4">
              <BookingLink
                href="/contact"
                placement="closing"
                className="btn !bg-ink !text-ivory !border-ink"
              >
                {settings.bookingCta}
              </BookingLink>
              {/* The second button used to be "Start Your Story" → /portfolio,
                  which is neither starting anything nor a story. One primary
                  door, and the real alternative when a number exists. */}
              {whatsapp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost !border-ink/25 !text-ink hover:!text-ink"
                >
                  WhatsApp Lana
                </a>
              )}
            </div>
          </Reveal>
        </div>

        <Reveal delay={220}>
          {/* ── DESKTOP ONLY ──────────────────────────────────────────────
              Based in / Travel / Instagram — all three are in the footer, one
              section below this. On a phone that is the same three facts twice
              inside a single screen of scrolling; on desktop the list is the
              right-hand rail of a two-column closing spread. */}
          <dl className="hidden space-y-8 border-t border-ink/15 pt-10 lg:block lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <div>
              <dt className="eyebrow !text-muted-ivory mb-3">Based in</dt>
              <dd className="font-display text-2xl">{settings.location}</dd>
            </div>
            <div>
              <dt className="eyebrow !text-muted-ivory mb-3">Travel</dt>
              <dd className="text-sm text-ink/70">
                Available — share your venue and city in the enquiry.
              </dd>
            </div>
            <div>
              <dt className="eyebrow !text-muted-ivory mb-3">Instagram</dt>
              <dd>
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-wipe text-sm text-ink/70"
                >
                  {settings.instagramHandle}
                </a>
              </dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
