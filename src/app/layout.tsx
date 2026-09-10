import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Noto_Serif_Tamil } from "next/font/google";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

import "./globals.css";

import { content } from "@/lib/content/provider";
import { waLink } from "@/lib/whatsapp";
import { localBusinessSchema, pageMetadata, seoConfig } from "@/lib/seo";

import SmoothScroll from "@/components/ui/SmoothScroll";
import BrushCursor from "@/components/ui/BrushCursor";
import BrandVeil from "@/components/ui/BrandVeil";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import MobileActionBar from "@/components/ui/MobileActionBar";
import PageTransition from "@/components/ui/PageTransition";
import AnalyticsScripts from "@/components/ui/Analytics";
import JsonLd from "@/components/ui/JsonLd";

/**
 * FONT SUBSET
 *
 * Audited against actual usage rather than kept "just in case":
 *   · Cormorant 500 — no display class declares it. Dropped.
 *   · Inter 300     — every sans class declares 400 or 500. Dropped.
 * next/font takes weight × style as a cartesian product, so 300/400 × normal/
 * italic is four files; every display class currently declares 300, and 400 is
 * held only for a non-synthesised italic. See the Phase 1 report.
 *
 * 9 files → 6.
 */
const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * One weight, one subset, and deliberately NOT preloaded: this face renders a
 * single word in the footer. Preloading it would put a Tamil font on the
 * critical path of every page for an ornament below the fold.
 */
const tamil = Noto_Serif_Tamil({
  subsets: ["tamil"],
  weight: ["400"],
  display: "swap",
  preload: false,
  variable: "--font-noto-tamil",
});

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  ...pageMetadata({ path: "/" }),
  title: {
    default: seoConfig.defaultTitle,
    template: seoConfig.titleTemplate,
  },
  applicationName: seoConfig.siteName,
  authors: [{ name: seoConfig.siteName, url: seoConfig.siteUrl }],
  creator: seoConfig.siteName,
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0806",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await content().getSiteSettings();
  // "Brides" only earns a nav link once there is a bride story behind it.
  const hasBrides = (await content().getBrides()).length > 0;
  /**
   * Resolved once here rather than in four components. Null until a real
   * business number is configured — every consumer renders nothing on null.
   *
   * Now reads NEXT_PUBLIC_WHATSAPP_NUMBER first (see lib/whatsapp.ts), which
   * also rejects the `91XXXXXXXXXX` placeholder from the setup docs: it
   * survives digit-stripping as "91", and a two-digit number builds a link
   * that opens a chat with nobody.
   */
  const whatsapp = waLink();

  return (
    <html
      lang="en-IN"
      className={`${display.variable} ${sans.variable} ${tamil.variable}`}
      /**
       * The veil's guard script runs BEFORE hydration and, when it decides
       * this visitor should see the opening, adds `lm-veiled` to this element.
       * That is the whole point of it — the class has to be on the root for
       * the first painted frame, which is earlier than React exists.
       *
       * React therefore finds a className on the client that the server did
       * not send, and logs a hydration mismatch on every single page load.
       * This is the annotation for exactly that case: a pre-hydration script
       * mutating the root element. It suppresses the warning for THIS
       * element's attributes only — not for its children, and not for content.
       */
      suppressHydrationWarning
    >
      <body className="grain antialiased">
        <JsonLd data={localBusinessSchema()} />

        {/* OUTSIDE .page-content, deliberately: that element is a stacking
            context, and a fixed child of one cannot rise above a sibling of
            it — which is how the header spent its life sitting on top of the
            veil. Homepage-only is enforced by the guard, not by placement. */}
        <BrandVeil />

        <SmoothScroll />
        <BrushCursor />
        <PageTransition brand={settings.brandName} />

        <Nav
          brand={settings.brandName}
          cta={settings.bookingCta}
          hasBrides={hasBrides}
          whatsapp={whatsapp}
        />

        <div className="page-content flex min-h-dvh flex-col">
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer settings={settings} />
        </div>

        {/* ── THE FLOATING BUBBLE IS RETIRED ────────────────────────────
            It was desktop-only and appeared after 0.7 of a viewport of
            scroll. That was correct while the header carried no WhatsApp
            control that anyone could see — but the header is `fixed`, and it
            now carries WhatsApp permanently, so from the moment the bubble
            arrived there were two of the same control on screen at once.

            This only became visible the day a real number was configured:
            before that both rendered null and the duplication was invisible.

            The component is kept, not deleted — turning it back on is one
            line — and every other WhatsApp affordance is unchanged: the
            header, the sticky bar on mobile, the enquiry, the closing block
            and the footer. */}

        {/* §33 — two actions, always in reach, mobile only. */}
        <MobileActionBar cta={settings.bookingCta} whatsapp={whatsapp} />

        <AnalyticsScripts />
        <VercelAnalytics />
      </body>
    </html>
  );
}
