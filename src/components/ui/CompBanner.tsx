import { COMP_NOTICE } from "@/content/comp";

/**
 * The one thing that makes a comp honest.
 *
 * Fixed, undismissable, on every page. The per-image "Placeholder" badges are
 * off in a comp — that is the point of a comp, the client needs to see the
 * design carrying photography — so this replaces them as the statement that
 * the imagery is not Lana's work.
 *
 * If you are reading this on the production domain, something has gone wrong:
 * see src/content/comp.ts.
 */
export default function CompBanner() {
  return (
    <div
      role="note"
      className="fixed inset-x-0 top-0 z-[95] flex items-center justify-center gap-3 bg-silk-red px-4 py-2 text-center text-[0.75rem] font-medium uppercase tracking-[0.18em] text-ivory"
    >
      <span aria-hidden="true">●</span>
      {COMP_NOTICE}
    </div>
  );
}
