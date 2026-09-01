import { ImageResponse } from "next/og";
import { content } from "@/lib/content/provider";
import { siteSettings } from "@/content/site";

export const alt = "Bridal world — Lana's Makeover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const services = await content().getServices();
  return services.map((s) => ({ slug: s.slug }));
}

/** Per-world Open Graph card (§48). */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await content().getService(slug);

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
          {service?.eyebrow ?? "Bridal world"}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 82, lineHeight: 1.05, letterSpacing: -1.5 }}>
            {service?.name ?? "Bridal services"}
          </div>
          {service?.summary && (
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
              {service.summary.length > 110
                ? `${service.summary.slice(0, 107)}…`
                : service.summary}
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
