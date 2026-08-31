import type { Metadata } from "next";
import { content } from "@/lib/content/provider";
import { pageMetadata } from "@/lib/seo";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description: "How enquiry information and analytics data are handled on this website.",
  path: "/privacy",
});

/**
 * ⚠ TODO(client): this is a plain-language description of what the site
 * technically does. It is NOT legal advice and it is NOT a compliance
 * document. Have it reviewed before the site goes to production, and add the
 * registered business name and address once available.
 */
export default async function PrivacyPage() {
  const settings = await content().getSiteSettings();

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        titleLines={["Privacy."]}
        breadcrumb={[
          { name: "Home", href: "/" },
          { name: "Privacy", href: "/privacy" },
        ]}
      />

      <div className="shell-narrow space-y-8 pb-28 sm:pb-40">
        <p className="body-base">
          Last updated when this site was built. This page describes what the website does with
          information. It is written in plain language and is not a substitute for legal advice.
        </p>

        <h2 className="display-sm !mt-14 text-ivory">What is collected</h2>
        <p className="body-base">
          When you send an enquiry, the form collects the name, phone number, email address,
          wedding date, city, event type, services required, number of people and message that you
          type into it. That information is used only to respond to your enquiry about
          availability and services.
        </p>

        <h2 className="display-sm !mt-14 text-ivory">Analytics</h2>
        <p className="body-base">
          If analytics is enabled, aggregate usage data — pages viewed, approximate region,
          device type — may be collected to understand how the site is used. Analytics is
          configured through environment variables and is disabled unless a measurement ID is
          supplied. No advertising profile is built and no personal data is sold.
        </p>

        <h2 className="display-sm !mt-14 text-ivory">Instagram</h2>
        <p className="body-base">
          Portfolio media may be retrieved from the official Instagram Graph API using credentials
          held on the server. No Instagram credentials are exposed to your browser, and nothing on
          your Instagram account is accessed by visiting this website.
        </p>

        <h2 className="display-sm !mt-14 text-ivory">Photography</h2>
        <p className="body-base">
          Client photographs are published only with the client&apos;s permission. If you are
          featured on this site and would like an image removed, write to{" "}
          {settings.email ? (
            <a href={`mailto:${settings.email}`} className="link-wipe text-champagne">
              {settings.email}
            </a>
          ) : (
            <a
              href={settings.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="link-wipe text-champagne"
            >
              {settings.instagramHandle}
            </a>
          )}{" "}
          and it will be taken down.
        </p>

        <h2 className="display-sm !mt-14 text-ivory">Contact</h2>
        <p className="body-base">
          Questions about this page can be sent through the{" "}
          <a href="/contact" className="link-wipe text-champagne">
            enquiry form
          </a>
          .
        </p>
      </div>
    </>
  );
}
