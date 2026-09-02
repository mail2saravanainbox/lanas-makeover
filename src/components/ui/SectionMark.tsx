import JasmineMark from "./JasmineMark";

/**
 * The ornament between sections. Replaces a bare 1px rule with something that
 * belongs to this brand — a hairline that pauses for the flower and resumes.
 */
export default function SectionMark({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`shell flex items-center gap-6 py-[var(--s-8)] ${className ?? ""}`}
    >
      <span className="h-px flex-1 bg-[var(--rule)]" />
      <JasmineMark className="h-6 w-6 shrink-0 text-champagne/40" />
      <span className="h-px flex-1 bg-[var(--rule)]" />
    </div>
  );
}
