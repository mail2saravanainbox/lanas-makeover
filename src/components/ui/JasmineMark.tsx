/**
 * THE JASMINE MARK
 *
 * A single-stroke malligai: five lanceolate petals around a small core, drawn
 * as one continuous weight so it survives at 16px in a browser tab and at
 * 200px on a page. Currentcolor throughout, so it takes the colour of
 * whatever it sits in.
 *
 * TODO(design): replace with the commissioned mark. This is a competent
 * placeholder drawn to the right proportions, not an identity. It exists so
 * the nav, the favicon and the section ornament are all reading from one
 * component the day the real one arrives — swap the paths, change nothing else.
 */
export default function JasmineMark({
  className,
  title,
}: {
  className?: string;
  /** Supply only where the mark is the sole content of a link or button. */
  title?: string;
}) {
  const petals = [0, 1, 2, 3, 4];

  return (
    <svg
      viewBox="-50 -50 100 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : "true"}
      aria-label={title}
    >
      {petals.map((i) => (
        <path
          key={i}
          transform={`rotate(${(i * 360) / 5})`}
          // Narrow and lanceolate — jasmine, not a daisy and not a lotus.
          d="M0 -9 C 9 -19, 11 -33, 0 -43 C -11 -33, -9 -19, 0 -9 Z"
        />
      ))}
      <circle r="5.2" />
    </svg>
  );
}
