/**
 * Kolam-inspired geometry (§8).
 *
 * A pulli kolam is a dot grid with a single continuous line looped around it.
 * That is the whole motif — a grid and a line. No mandalas, no elephants, no
 * clip-art. Used at very low opacity as a structural background rule.
 */
export default function KolamGrid({
  className,
  cells = 6,
}: {
  className?: string;
  cells?: number;
}) {
  const step = 100 / cells;
  const dots: Array<{ x: number; y: number }> = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      dots.push({ x: step * (c + 0.5), y: step * (r + 0.5) });
    }
  }

  const loops: string[] = [];
  for (let r = 0; r < cells - 1; r++) {
    for (let c = 0; c < cells - 1; c++) {
      if ((r + c) % 2 !== 0) continue;
      const x = step * (c + 1);
      const y = step * (r + 1);
      const k = step * 0.5;
      loops.push(
        `M ${x - k} ${y} Q ${x} ${y - k * 1.35} ${x + k} ${y} Q ${x} ${y + k * 1.35} ${x - k} ${y} Z`,
      );
    }
  }

  return (
    <svg viewBox="0 0 100 100" className={className} role="presentation" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="0.28" strokeLinejoin="round">
        {loops.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g fill="currentColor">
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="0.42" />
        ))}
      </g>
    </svg>
  );
}
