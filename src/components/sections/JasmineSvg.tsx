/**
 * 2D jasmine — the WebGL bloom's understudy.
 * Rendered when the canvas is unavailable, refused, or not worth the battery.
 * Same silhouette, same restraint, zero GPU cost.
 */
export default function JasmineSvg({ className }: { className?: string }) {
  const petals = Array.from({ length: 6 }, (_, i) => i);
  return (
    <svg
      viewBox="-100 -100 200 200"
      className={className}
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="jasmine-core" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#e8d9b8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#e8d9b8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="jasmine-petal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6f1e8" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#c9a96a" stopOpacity="0.05" />
        </linearGradient>
        <filter id="jasmine-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
      </defs>

      <circle r="34" fill="url(#jasmine-core)" />

      <g filter="url(#jasmine-soft)">
        {petals.map((i) => (
          <g key={i} transform={`rotate(${(i * 360) / 6})`}>
            <path
              d="M0 -6 C 16 -18, 24 -48, 0 -76 C -24 -48, -16 -18, 0 -6 Z"
              fill="url(#jasmine-petal)"
              stroke="#e0cdb2"
              strokeOpacity="0.26"
              strokeWidth="0.6"
            />
          </g>
        ))}
        {petals.map((i) => (
          <g key={`inner-${i}`} transform={`rotate(${(i * 360) / 6 + 30}) scale(0.66)`}>
            <path
              d="M0 -6 C 16 -18, 24 -48, 0 -76 C -24 -48, -16 -18, 0 -6 Z"
              fill="url(#jasmine-petal)"
              stroke="#e0cdb2"
              strokeOpacity="0.18"
              strokeWidth="0.7"
            />
          </g>
        ))}
      </g>

      <circle r="5.5" fill="#e8d9b8" fillOpacity="0.5" />
    </svg>
  );
}
