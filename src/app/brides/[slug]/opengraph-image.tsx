import { ImageResponse } from "next/og";
import { content } from "@/lib/content/provider";
import { siteSettings } from "@/content/site";

export const alt = "Bride story — Lana's Makeover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const brides = await content().getBrides();
  return brides.map((b) => ({ slug: b.slug }));
}

/**
 * Per-story Open Graph card (§48).
 *
 * Once real photography is attached, point this at `bride.hero.src` instead of
 * the generated composition — the metadata already prefers the real image when
 * one exists.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bride = await content().getBride(slug);

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
            "radial-gradient(75% 60% at 28% 30%, #402c17 0%, #1c1510 48%, #0a0806 100%)",
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
          {bride ? `${bride.weddingType} · ${bride.location}` : "Bride story"}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 78, lineHeight: 1.05, letterSpacing: -1.5 }}>
            {bride?.name ?? "A bride story"}
          </div>
          {bride?.look && (
            <div style={{ display: "flex", fontSize: 27, fontStyle: "italic", color: "#e0cdb2" }}>
              {bride.look}
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
          <span>{siteSettings.brandName}</span>
          <span>{siteSettings.location}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
