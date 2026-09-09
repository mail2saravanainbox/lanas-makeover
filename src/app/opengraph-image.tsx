import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { citiesDotted, siteSettings } from "@/content/site";

export const alt = "Lana's Makeover — Bridal Makeup & Hair Artist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default Open Graph card. Generated, not a static asset, so it always matches
 * the brand configuration.
 *
 * TODO(client): once Lana approves a hero photograph, replace this route with
 * a static /public/og/home.jpg and point `seoConfig` at it (§48).
 */
/**
 * The logo, inlined as a data URI.
 *
 * ImageResponse renders through Satori in an isolated runtime — it cannot
 * reach the site over the network to fetch /brand/logo.webp, and a relative
 * path means nothing to it. Reading the file off disk at render time is the
 * one route that works, and it fails soft: no logo, no crash, just the
 * typographic card this had before.
 */
async function logoDataUri(): Promise<string | null> {
  try {
    // PNG, not the WebP the site serves: Satori cannot decode WebP.
    const file = await readFile(path.join(process.cwd(), "public/brand/logo-og.png"));
    return `data:image/png;base64,${file.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image() {
  const logo = await logoDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          background:
            "radial-gradient(80% 60% at 30% 25%, #3a2a1a 0%, #1a1410 45%, #0a0806 100%)",
          color: "#f2ede4",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 20,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: "#a08a6a",
          }}
        >
          {citiesDotted()}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* The real logo where there is room for it to read, and the
              typographic wordmark when the file is unreadable for any reason.
              A share card is one of the few places on the site big enough for
              a script lockup. */}
          {logo ? (
            <img src={logo} alt="" width={430} height={294} />
          ) : (
            <div style={{ display: "flex", fontSize: 96, lineHeight: 1, letterSpacing: -2 }}>
              {siteSettings.brandName}
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#e0cdb2",
              fontStyle: "italic",
            }}
          >
            Every bride has a moment before she becomes the bride.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 19,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#8b8177",
            borderTop: "1px solid rgba(242,237,228,0.16)",
            paddingTop: 26,
          }}
        >
          <span>{siteSettings.tagline}</span>
          <span>{siteSettings.instagramHandle}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
