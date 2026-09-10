import type { Metadata } from "next";
import { content } from "@/lib/content/provider";
import { citiesProse, telLink } from "@/content/site";
import { waLink } from "@/lib/whatsapp";
import { breadcrumbSchema, localBusinessSchema, pageMetadata } from "@/lib/seo";
import PageHeader from "@/components/ui/PageHeader";
import BookingFlow from "@/components/booking/BookingFlow";
import Reveal from "@/components/ui/Reveal";
import JsonLd from "@/components/ui/JsonLd";
import InstagramLink from "@/components/ui/InstagramLink";

export const metadata: Metadata = pageMetadata({
  title: "Check Your Date — Enquire",
  description:
    `Send your wedding date, city and events and find out plainly whether the date is open. Bridal makeup and hair in ${citiesProse()}.`,
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await content().getSiteSettings();
  const whatsapp = waLink();
  const tel = telLink();

  return (
    <>
      <JsonLd
        data={[
          localBusinessSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        ]}
      />

      <PageHeader
        eyebrow="Check your date"
        titleLines={["Your story", "starts here."]}
        intro="Six short steps: the date, the city, the events, what you need, and how to reach you. You will be told plainly whether the date is open."
        breadcrumb={[
          { name: "Home", href: "/" },
          { name: "Contact", href: "/contact" },
        ]}
      />

      <div className="shell grid gap-16 pb-28 lg:grid-cols-[1.4fr_1fr] lg:gap-24 sm:pb-40">
        <Reveal className="lg:col-start-1 lg:row-start-1">
          <BookingFlow />
        </Reveal>

        {/* The second door. Rendered only when a real number is configured —
            never a dead link. On mobile it sits above the form; on desktop it
            heads the right-hand rail, beside it. */}
        {whatsapp && (
          <div className="order-first lg:order-none lg:col-start-2 lg:row-start-1">
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn w-full justify-center sm:w-auto"
            >
              WhatsApp Lana
            </a>
            <p className="body-base mt-4">
              Fastest for a straight date check. The six steps beside it are better when there
              is more than one event to plan.
            </p>
          </div>
        )}

        <Reveal delay={200} className="lg:col-start-2 lg:row-start-2">
          <aside className="space-y-10 border-t border-ivory/12 pt-10 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <div>
              <h2 className="eyebrow mb-4">Direct</h2>
              <ul className="space-y-0 text-sm text-ivory/80 lg:space-y-3">
                <li>
                  <InstagramLink
                    href={settings.instagram}
                    placement="contact"
                    className="tap link-wipe hover:text-champagne"
                  >
                    {settings.instagramHandle} — message on Instagram
                  </InstagramLink>
                </li>
                {settings.email && (
                  <li>
                    <a href={`mailto:${settings.email}`} className="tap link-wipe hover:text-champagne">
                      {settings.email}
                    </a>
                  </li>
                )}
                {tel && (
                  <li>
                    <a href={tel} className="tap link-wipe hover:text-champagne">
                      {settings.phone}
                    </a>
                  </li>
                )}
                {/* No WhatsApp entry here: the button at the head of this
                    rail is the same link, a few centimetres above, and the
                    enquiry flow beside it offers it on every step. Three
                    doors to one room. */}
              </ul>

              {!settings.email && !tel && (
                <p className="body-base mt-5">
                  Message on Instagram, or send the form below.
                </p>
              )}
            </div>

            <div>
              <h2 className="eyebrow mb-4">Where she works</h2>
              <ul className="space-y-1.5 font-display text-2xl text-ivory">
                {settings.serviceAreas.map((city) => (
                  <li key={city}>{city}</li>
                ))}
              </ul>
              <p className="body-base mt-4">
                Based in {settings.location}. {settings.travelNote}
              </p>
            </div>

            <div>
              <h2 className="eyebrow mb-4">Before you write</h2>
              <ul className="space-y-3 text-sm text-ivory/70">
                <li>Peak muhurtham dates fill first — enquire as early as you have the date.</li>
                <li>Say how many people need makeup, not only the bride.</li>
                <li>Mention any allergy or sensitivity now rather than on the morning.</li>
              </ul>
            </div>
          </aside>
        </Reveal>
      </div>
    </>
  );
}
