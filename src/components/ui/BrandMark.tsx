import JasmineMark from "./JasmineMark";

/**
 * THE MONOGRAM — the jasmine mark with Lana's initials beside it.
 *
 * One component rather than the two pieces assembled at each call site, so the
 * flower and the letters keep the same relationship and the same optical
 * weight wherever the mark appears.
 *
 * The initials are set in the display face the rest of the site uses
 * (Cormorant Garamond) at weight 400 rather than the 300 the headings take:
 * two letters at 15px need the extra stroke to hold against the flower's
 * 2.4-unit line, where 300 goes thin and reads as a caption.
 *
 * `aria-hidden` throughout. This sits inside a link that already carries the
 * brand name as its accessible text, and a screen reader announcing
 * "L S Lana's Makeover" would be reading the logo out twice.
 */
export default function BrandMark({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`flex items-center gap-1.5 ${className ?? ""}`}>
      <JasmineMark className="h-5 w-5 shrink-0" />
      <span
        className="font-display text-[0.95rem] leading-none"
        style={{ fontWeight: 400, letterSpacing: "0.06em" }}
      >
        LS
      </span>
    </span>
  );
}
