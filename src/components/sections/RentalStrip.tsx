import Link from "next/link";
import Image from "next/image";
import { rentalCategories } from "@/content/rental-categories";
import { rentalItems, rentalItemsFor } from "@/content/rental";
import { sectionEyebrow } from "@/lib/utils";
import Reveal from "@/components/ui/Reveal";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE JEWELLERY, ON THE HOMEPAGE — SIDEWAYS
 * ═══════════════════════════════════════════════════════════════════════════
 *  The homepage came down from 33.3 screens to 12.3 over the mobile audit, and
 *  a second line of business still had to appear on it. Those two things are
 *  only compatible in one direction: sideways.
 *
 *  A horizontal rail costs the height of one row of thumbnails — about
 *  three-quarters of a screen including its heading — no matter how many sets
 *  are in it. The vertical version of this section, twelve photographs in a
 *  grid, would have been three screens on a phone and would have undone a
 *  quarter of the audit on its own.
 *
 *  ── WHAT IT IS NOT ────────────────────────────────────────────────────────
 *  It is not a fifth room. It is a window into four that already exist, and it
 *  ends in the one link that opens them. There is no "Check Your Date" here:
 *  the homepage carries three inline booking controls and the sticky bar, and
 *  a fourth would be the eight-button mistake starting again.
 *
 *  ── AND IT COSTS TWELVE THUMBNAILS ────────────────────────────────────────
 *  Twelve, from the 640px thumbnail files, not the full frames — one row's
 *  worth. `loading="lazy"` is real here because the rail genuinely scrolls off
 *  the right edge, so only the four or five on screen are fetched up front.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** One row. More would not fit on screen at once and would only cost bytes. */
const SHOWN = 12;

export default function RentalStrip({ index }: { index?: number }) {
  const total = rentalItems().length;
  if (total === 0) return null;

  /**
   * Take from each room in turn rather than from the top of the catalogue, so
   * the rail shows what the collection actually spans — gold, white stone,
   * choker, worn — instead of twelve variations on whichever room happens to
   * sort first.
   */
  const perRoom = rentalCategories.map((c) => rentalItemsFor(c.key));
  const picks = [];
  for (let i = 0; picks.length < SHOWN; i++) {
    const before = picks.length;
    for (const room of perRoom) {
      if (room[i] && picks.length < SHOWN) picks.push(room[i]);
    }
    if (picks.length === before) break;
  }

  return (
    <section aria-labelledby="rental-strip-title" className="section-dark py-16 sm:py-20">
      <div className="shell">
        <Reveal>
          <p className="eyebrow mb-6">{sectionEyebrow(index, "Also to rent")}</p>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <h2 id="rental-strip-title" className="display-sm max-w-[16ch] text-balance text-ivory">
              The jewellery,{" "}
              <span className="italic-serif text-champagne">on rent.</span>
            </h2>
            {/* Counted, never typed. */}
            <Link
              href="/rental-jewellery"
              className="tap link-wipe eyebrow !text-champagne"
              data-cursor="view"
            >
              All {total} sets
            </Link>
          </div>
          <p className="body-base measure mt-5">
            Temple jewellery, American diamond, chokers and haram — the makeup and the jewellery
            from the same morning, planned together.
          </p>
        </Reveal>
      </div>

      {/* ── The rail ──────────────────────────────────────────────────────
          Full-bleed rather than stopping at the text margin — a rail that ends
          where the paragraph ends reads as a grid that failed to fit.

          The pattern is a negative margin equal to `.shell`'s own padding,
          with that padding added back INSIDE the scroll container. So the
          first thumbnail lines up with the heading, the last one runs off the
          right edge as it should, and there is no calc() reaching for the
          viewport width. An earlier version did the arithmetic by hand and
          silently produced no padding at all, which put the first set half
          off the left of a phone.

          NO SCROLL SNAP. With snap-start on the children the browser aligns
          the first one to the snapport — the PADDING box — and lands the rail
          at scrollLeft 20, which put the first thumbnail flush against the
          left edge again with the padding still correctly applied. This is a
          browse rail, not a carousel: free scrolling is what a thumb expects
          here, and it does not fight the gutter. */}
      <div className="shell mt-10">
        <div className="-mx-[clamp(1.25rem,5vw,5rem)] flex gap-3 overflow-x-auto px-[clamp(1.25rem,5vw,5rem)] pb-2 sm:gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {picks.map((item) => (
            <Link
              key={item.id}
              href="/rental-jewellery"
              data-cursor="view"
              aria-label={`${item.title} — see the rental collection`}
              className="group relative aspect-[3/4] w-[38vw] shrink-0 overflow-hidden bg-ink-2 sm:w-[26vw] lg:w-[15rem]"
            >
              <Image
                src={item.thumbnailUrl}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 38vw, (max-width: 1024px) 26vw, 15rem"
                placeholder={item.blurDataURL ? "blur" : undefined}
                blurDataURL={item.blurDataURL}
                className="object-cover transition-transform duration-[var(--d-slow)] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 motion-reduce:transition-none"
              />
            </Link>
          ))}
        </div>
      </div>

    </section>
  );
}
