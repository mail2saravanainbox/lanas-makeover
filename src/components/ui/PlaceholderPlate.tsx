import type { CSSProperties } from "react";
import type { MediaTone } from "@/lib/types";
import { seeded } from "@/lib/utils";

/**
 * PLACEHOLDER PLATE
 *
 * A deterministic, procedurally-composed tonal study used wherever a real
 * photograph has not been supplied yet.
 *
 * Why not stock photography? Because §44 of the brief is right: a stock bride
 * presented in Lana's portfolio is a lie about her clientele. A plate is
 * honest, it is not ugly, and it disappears the instant `src` is set.
 *
 * Fully deterministic from `seed`, so server and client render identically.
 */

type Ramp = { deep: string; mid: string; light: string };

const TONES: Record<MediaTone, Ramp> = {
  ivory: { deep: "#2a241c", mid: "#6d6154", light: "#e8dfd0" },
  champagne: { deep: "#2b2117", mid: "#8a6f4d", light: "#e0cdb2" },
  bronze: { deep: "#241a10", mid: "#8a5f2f", light: "#c99a5e" },
  ink: { deep: "#0a0806", mid: "#312a21", light: "#6f6455" },
  rose: { deep: "#2a1a17", mid: "#8d5e56", light: "#cfa79c" },
  olive: { deep: "#1d2016", mid: "#5c6146", light: "#a8ac86" },
  indigo: { deep: "#14161f", mid: "#444964", light: "#8f96b3" },
};

export interface PlaceholderPlateProps {
  tone?: MediaTone;
  seed?: number;
  className?: string;
  /** Shows the small honesty tag. Off for decorative/background usage. */
  badge?: boolean;
  badgeLabel?: string;
}

export default function PlaceholderPlate({
  tone = "champagne",
  seed = 1,
  className,
  badge = false,
  badgeLabel = "Placeholder",
}: PlaceholderPlateProps) {
  const ramp = TONES[tone] ?? TONES.champagne;
  const rand = seeded(seed * 2654435761);

  const hx = 22 + rand() * 56;
  const hy = 14 + rand() * 44;
  const sx = 20 + rand() * 60;
  const sy = 50 + rand() * 44;
  const angle = 140 + rand() * 70;
  const striation = 82 + rand() * 26;
  const blobRotation = -22 + rand() * 44;
  const blobScale = 0.86 + rand() * 0.4;
  const blobY = 34 + rand() * 26;

  const style: CSSProperties = {
    backgroundColor: ramp.deep,
    backgroundImage: [
      // primary light source — the "key light"
      `radial-gradient(78% 62% at ${hx}% ${hy}%, ${ramp.light}55 0%, ${ramp.light}18 34%, transparent 68%)`,
      // secondary fill, lower and cooler
      `radial-gradient(62% 70% at ${sx}% ${sy}%, ${ramp.mid}66 0%, transparent 62%)`,
      // silk striations
      `repeating-linear-gradient(${striation}deg, rgba(255,255,255,0.028) 0px, rgba(255,255,255,0.028) 1px, transparent 1px, transparent 7px)`,
      // body gradient
      `linear-gradient(${angle}deg, ${ramp.deep} 0%, ${ramp.mid}cc 52%, ${ramp.deep} 100%)`,
    ].join(","),
  };

  return (
    <div
      className={`relative isolate overflow-hidden ${className ?? ""}`}
      style={style}
      aria-hidden="true"
      data-placeholder="true"
    >
      {/* Soft organic form — reads as fabric or a turned shoulder, never a face */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 140"
        preserveAspectRatio="xMidYMid slice"
        role="presentation"
      >
        <defs>
          <linearGradient id={`pg-${seed}`} x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor={ramp.light} stopOpacity="0.5" />
            <stop offset="55%" stopColor={ramp.mid} stopOpacity="0.22" />
            <stop offset="100%" stopColor={ramp.deep} stopOpacity="0" />
          </linearGradient>
          <filter id={`pb-${seed}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <g
          filter={`url(#pb-${seed})`}
          transform={`translate(50 ${blobY}) rotate(${blobRotation}) scale(${blobScale}) translate(-50 -${blobY})`}
        >
          <path
            d={`M 50 ${blobY - 26}
                C ${68 + rand() * 10} ${blobY - 20}, ${74 + rand() * 8} ${blobY + 12}, 62 ${blobY + 40}
                C 56 ${blobY + 58}, 44 ${blobY + 58}, 38 ${blobY + 40}
                C ${26 - rand() * 8} ${blobY + 12}, ${32 - rand() * 10} ${blobY - 20}, 50 ${blobY - 26} Z`}
            fill={`url(#pg-${seed})`}
          />
        </g>
      </svg>

      {/* Vignette — the thing that makes a flat gradient read as photographic */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 42%, transparent 30%, rgba(0,0,0,0.28) 68%, rgba(0,0,0,0.62) 100%)",
        }}
      />

      {badge && (
        <span
          className="absolute bottom-3 left-3 z-10 rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[0.55rem] font-medium uppercase tracking-[0.22em] text-ivory/70 backdrop-blur-sm"
          style={{ fontFeatureSettings: "'tnum'" }}
        >
          {badgeLabel}
        </span>
      )}
    </div>
  );
}
