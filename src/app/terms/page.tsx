import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = pageMetadata({
  title: "Terms",
  description: "Terms of use for the Lana's Makeover website.",
  path: "/terms",
});

/**
 * ⚠ TODO(client): booking terms — deposits, cancellation, travel charges,
 * rescheduling — are commercial facts that only Lana can state. They are
 * deliberately absent rather than invented. Add them here before launch.
 */
export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        titleLines={["Terms."]}
        breadcrumb={[
          { name: "Home", href: "/" },
          { name: "Terms", href: "/terms" },
        ]}
      />

      <div className="shell-narrow space-y-8 pb-[var(--s-12)] sm:pb-[var(--s-16)]">
        <h2 className="display-sm text-ivory">Use of this website</h2>
        <p className="body-base">
          This website presents the work and services of Lana&apos;s Makeover. Its content is
          provided for information. Availability, scope and terms for any specific date are
          confirmed directly in writing and not through this website.
        </p>

        <h2 className="display-sm !mt-14 text-ivory">Images and copyright</h2>
        <p className="body-base">
          Photographs, text and design on this site belong to Lana&apos;s Makeover or to the
          photographers who created them, and may not be reproduced without permission.
        </p>

        <h2 className="display-sm !mt-14 text-ivory">Enquiries are not bookings</h2>
        <p className="body-base">
          Submitting the enquiry form does not reserve a date. A date is held only once it has
          been confirmed directly.
        </p>

        <h2 className="display-sm !mt-14 text-ivory">Booking terms</h2>
        <p className="body-base">
          Deposits, cancellation, rescheduling and travel arrangements are agreed in writing at
          the time of booking. They are not published here because they are set per commission.
        </p>
      </div>
    </>
  );
}
