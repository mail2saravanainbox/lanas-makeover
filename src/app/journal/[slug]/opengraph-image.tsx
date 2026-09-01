import { ImageResponse } from "next/og";
import { content } from "@/lib/content/provider";
import { siteSettings } from "@/content/site";

export const alt = "The Lana Journal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const posts = await content().getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

/** Per-article Open Graph card (§48). */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await content().getPost(slug);
  const title = post?.title ?? "The Lana Journal";

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
            "radial-gradient(70% 55% at 72% 24%, #33291c 0%, #1a1510 50%, #0a0806 100%)",
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
          {post ? `${post.category} · ${post.readingMinutes} min read` : "Journal"}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: title.length > 52 ? 56 : 68,
            lineHeight: 1.12,
            letterSpacing: -1,
            maxWidth: 980,
          }}
        >
          {title}
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
          <span>The Lana Journal</span>
          <span>{siteSettings.brandName}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
