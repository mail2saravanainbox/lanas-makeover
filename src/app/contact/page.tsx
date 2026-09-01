import type { Metadata } from "next";
import { content } from "@/lib/content/provider";
import { whatsappLink, telLink } from "@/content/site";
import { breadcrumbSchema, localBusinessSchema, pageMetadata } from "@/lib/seo";
import PageHeader from "@/components/ui/PageHeader";
import ContactForm from "@/components/ui/ContactForm";
import Reveal from "@/components/ui/Reveal";
import JsonLd from "@/components/ui/JsonLd";
import InstagramLink from "@/components/ui/InstagramLink";

export const metadata: Metadata = pageMetadata({
  title: "Check Your Date — Enquire",
  description:
    "Send your wedding date, city and events to Lana's Makeover and find out plainly whether the date is open. Based in Trichy, travel available.",
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await content().getSiteSettings();
  const whatsapp = whatsappLink();
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
        intro="Send the date, the city and the events. You will be told plainly whether it is open."
        breadcrumb={[
          { name: "Home", href: "/" },
          { name: "Contact", href: "/contact" },
        ]}
      />

      <div className="shell grid gap-16 pb-28 lg:grid-cols-[1.4fr_1fr] lg:gap-24 sm:pb-40">
        <Reveal className="lg:col-start-1 lg:row-start-1">
          <ContactForm />
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
              Ask on WhatsApp
            </a>
            <p className="body-base mt-4">
              Fastest for a date check. The form below is better for the full brief.
            </p>
          </div>
        )}

        <Reveal delay={200} className="lg:col-start-2 lg:row-start-2">
          <aside className="space-y-10 border-t border-ivory/12 pt-10 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <div>
              <h2 className="eyebrow mb-4">Direct</h2>
              <ul className="space-y-3 text-sm text-ivory/80">
                <li>
                  <InstagramLink
                    href={settings.instagram}
                    placement="contact"
                    className="link-wipe hover:text-champagne"
                  >
                    {settings.instagramHandle} — message on Instagram
                  </InstagramLink>
                </li>
                {settings.email && (
                  <li>
                    <a href={`mailto:${settings.email}`} className="link-wipe hover:text-champagne">
                      {settings.email}
                    </a>
                  </li>
                )}
                {tel && (
                  <li>
                    <a href={tel} className="link-wipe hover:text-champagne">
                      {settings.phone}
                    </a>
                  </li>
                )}
                {whatsapp && (
                  <li>
                    <a
                      href={whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-wipe hover:text-champagne"
                    >
                      WhatsApp
                    </a>
                  </li>
                )}
              </ul>

              {!settings.email && !tel && (
                <p className="body-base mt-5">
                  Instagram direct message is the fastest route until a business number and
                  enquiry inbox are published here.
                </p>
              )}
            </div>

            <div>
              <h2 className="eyebrow mb-4">Based in</h2>
              <p className="font-display text-2xl text-ivory">{settings.location}</p>
              <p className="body-base mt-3">
                Travel available. Share the venue and city in your enquiry.
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
