import { ImageResponse } from "next/og";
import { collections, findCollection } from "@/content/collections";
import { siteSettings } from "@/content/site";

export const alt = "Portfolio collection — Lana's Makeover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return collections.map((c) => ({ collection: c.slug }));
}

/** Per-collection Open Graph card, so a shared room looks like a room. */
export default async function Image({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;
  const c = findCollection(collection);

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
            "radial-gradient(72% 58% at 24% 26%, #3d2c19 0%, #1b1510 48%, #0a0806 100%)",
          color: "#f2ede4",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 19,
            letterSpacing: 9,
            textTransform: "uppercase",
            color: "#a08a6a",
          }}
        >
          {c?.eyebrow ?? "Portfolio"}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 82, lineHeight: 1.05, letterSpacing: -1.5 }}>
            {c?.title ?? "The portfolio"}
          </div>
          {c?.intro && (
            <div
              style={{
                display: "flex",
                fontSize: 25,
                fontStyle: "italic",
                color: "#e0cdb2",
                maxWidth: 940,
                lineHeight: 1.35,
              }}
            >
              {c.intro.length > 110 ? `${c.intro.slice(0, 107)}…` : c.intro}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 18,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#8b8177",
            borderTop: "1px solid rgba(242,237,228,0.16)",
            paddingTop: 24,
          }}
        >
          <div style={{ display: "flex" }}>{siteSettings.brandName}</div>
          <div style={{ display: "flex" }}>{siteSettings.location}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
