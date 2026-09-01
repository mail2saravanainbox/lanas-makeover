"use client";

/**
 * Last-resort boundary — catches failures in the root layout itself, so it must
 * render its own <html>/<body> and cannot rely on the design system stylesheet.
 * Styles are inline for that reason.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-IN">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0806",
          color: "#f2ede4",
          fontFamily: "Georgia, 'Times New Roman', serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: "34rem" }}>
          <p
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.34em",
              textTransform: "uppercase",
              color: "#8b8177",
              fontFamily: "system-ui, sans-serif",
              marginBottom: "2rem",
            }}
          >
            Lana&rsquo;s Makeover
          </p>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 300, lineHeight: 1.1, margin: 0 }}>
            Something went wrong.
          </h1>
          <p style={{ color: "rgba(242,237,228,0.7)", lineHeight: 1.7, marginTop: "1.5rem" }}>
            Please try again. If it keeps happening, reach the studio on Instagram.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2.5rem",
              padding: "1rem 2rem",
              borderRadius: "999px",
              border: "1px solid #f2ede4",
              background: "#f2ede4",
              color: "#0a0806",
              fontSize: "0.7rem",
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ marginTop: "2rem", fontSize: "0.6rem", letterSpacing: "0.2em", color: "#8b8177" }}>
              Reference {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
