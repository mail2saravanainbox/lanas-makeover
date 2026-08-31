import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Monogram favicon, generated so it always matches the brand palette. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0806",
          color: "#e0cdb2",
          fontSize: 40,
          fontFamily: "serif",
          letterSpacing: -1,
        }}
      >
        L
      </div>
    ),
    { ...size },
  );
}
