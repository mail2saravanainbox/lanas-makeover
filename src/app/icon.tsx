import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * The jasmine mark as the tab icon. Drawn inline rather than importing
 * JasmineMark: ImageResponse renders a Satori subset of SVG/CSS, not React DOM,
 * so the component's attributes would not all survive the trip.
 *
 * TODO(design): follows the commissioned mark when it lands.
 */
export default function Icon() {
  const petals = [0, 1, 2, 3, 4];

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
        }}
      >
        <svg width="46" height="46" viewBox="-50 -50 100 100">
          {petals.map((i) => (
            <path
              key={i}
              transform={`rotate(${(i * 360) / 5})`}
              d="M0 -9 C 9 -19, 11 -33, 0 -43 C -11 -33, -9 -19, 0 -9 Z"
              fill="none"
              stroke="#e0cdb2"
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
          ))}
          <circle r="5.2" fill="none" stroke="#e0cdb2" strokeWidth="3.2" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
