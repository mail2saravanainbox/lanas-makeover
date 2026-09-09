import type { Metadata } from "next";
import { content } from "@/lib/content/provider";
import { breadcrumbSchema, faqSchema, pageMetadata } from "@/lib/seo";
import PageHeader from "@/components/ui/PageHeader";
import JsonLd from "@/components/ui/JsonLd";
import ClosingCTA from "@/components/sections/ClosingCTA";
import FaqList from "@/components/ui/FaqList";
import { citiesProse } from "@/content/site";

export const metadata: Metadata = pageMetadata({
  title: "Frequently Asked Questions",
  description:
    `Booking windows, travel across ${citiesProse()}, trials, natural versus HD makeup, bridal hair, draping and skin preparation — answered for South Indian brides.`,
  path: "/faq",
});

export default async function FaqPage() {
  const provider = content();
  const [faqs, settings] = await Promise.all([
    provider.getFaqs(),
    provider.getSiteSettings(),
  ]);

  return (
    <>
      <JsonLd
        data={[
          faqSchema(
            faqs.map((f) => ({ question: f.question, answer: f.answer })),
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
        ]}
      />

      <PageHeader
        eyebrow="Questions"
        titleLines={["Frequently", "asked."]}
        breadcrumb={[
          { name: "Home", href: "/" },
          { name: "FAQ", href: "/faq" },
        ]}
      />

      <div className="shell pb-[var(--s-12)] sm:pb-[var(--s-16)]">
        <FaqList items={faqs} showBadges={settings.showPlaceholderBadges} />
      </div>

      <ClosingCTA settings={settings} />
    </>
  );
}
