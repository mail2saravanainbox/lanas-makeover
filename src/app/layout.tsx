import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

import "./globals.css";

import { content } from "@/lib/content/provider";
import { whatsappLink } from "@/content/site";
import { localBusinessSchema, pageMetadata, seoConfig } from "@/lib/seo";

import SmoothScroll from "@/components/ui/SmoothScroll";
import Cursor from "@/components/ui/Cursor";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import PageTransition from "@/components/ui/PageTransition";
import AnalyticsScripts from "@/components/ui/Analytics";
import JsonLd from "@/components/ui/JsonLd";
import StoryCanvas from "@/components/3d/StoryCanvas";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-inter",
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

  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable}`}>
      <body className="grain antialiased">
        <JsonLd data={localBusinessSchema()} />

        <SmoothScroll />
        <StoryCanvas />
        <Cursor />
        <PageTransition brand={settings.brandName} />

        <Nav brand={settings.brandName} cta={settings.bookingCta} hasBrides={hasBrides} />

        <div className="page-content flex min-h-dvh flex-col">
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer settings={settings} />
        </div>

        <WhatsAppButton href={whatsappLink()} />

        <AnalyticsScripts />
        <VercelAnalytics />
      </body>
    </html>
  );
}
