import type { Metadata } from "next";
import { content } from "@/lib/content/provider";
import { breadcrumbSchema, faqSchema, pageMetadata } from "@/lib/seo";
import PageHeader from "@/components/ui/PageHeader";
import Reveal from "@/components/ui/Reveal";
import JsonLd from "@/components/ui/JsonLd";
import ClosingCTA from "@/components/sections/ClosingCTA";

export const metadata: Metadata = pageMetadata({
  title: "Frequently Asked Questions",
  description:
    "Booking windows, travel, trials, natural versus HD makeup, bridal hair and skin preparation — answered for South Indian brides.",
  path: "/faq",
});

export default async function FaqPage() {
  const provider = content();
  const [faqs, settings] = await Promise.all([provider.getFaqs(), provider.getSiteSettings()]);

  return (
    <>
      <JsonLd
        data={[
          faqSchema(faqs.map((f) => ({ question: f.question, answer: f.answer }))),
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

      <div className="shell pb-28 sm:pb-40">
        <dl className="max-w-3xl divide-y divide-ivory/10 border-y border-ivory/10">
          {faqs.map((f, i) => (
            <div key={f.id} className="py-9">
              <Reveal delay={i * 60}>
                <dt className="display-sm text-ivory">{f.question}</dt>
                <dd className="body-base mt-4 max-w-2xl">
                  {/* ⟨…⟩ marks an answer awaiting Lana's confirmation. */}
                  {f.answer.split(/(⟨[^⟩]*⟩)/).map((part, j) =>
                    part.startsWith("⟨") ? (
                      settings.showPlaceholderBadges ? (
                        <span
                          key={j}
                          className="ml-2 rounded-full border border-champagne/25 px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.18em] text-champagne/70"
                        >
                          To confirm
                        </span>
                      ) : null
                    ) : (
                      <span key={j}>{part}</span>
                    ),
                  )}
                </dd>
              </Reveal>
            </div>
          ))}
        </dl>
      </div>

      <ClosingCTA settings={settings} />
    </>
  );
}
