import Link from "next/link";
import type { PortfolioItem } from "@/lib/types";
import EditorialImage from "@/components/ui/EditorialImage";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  REAL WORK, BEFORE THE PHILOSOPHY  (§14, §67, §74)
 * ═══════════════════════════════════════════════════════════════════════════
 *  The homepage opened on the hero and went straight into "We don't change
 *  her. We reveal her." — a page and a half of what Lana believes before a
 *  single photograph of what she does. A bride arriving from Instagram has
 *  one question first, and it is not what the artist believes: it is whether
 *  she can actually do this.
 *
 *  ── A RAIL, NOT A SECTION ─────────────────────────────────────────────────
 *  A featured-work grid used to sit roughly here and was removed for good
 *  reason: it cost a screen and a half to arrive at a link to /portfolio that
 *  the nav, the hero and the footer all already offer.
 *
 *  This is not that. It is one screen-width of real photographs at about six
 *  tenths of a viewport, scrolled sideways with the thumb — proof at a glance,
 *  at a fraction of the vertical cost. The vertical scroll of the page is
 *  never touched, and the link at the end goes where the grid went.
 *
 *  ── MOBILE ONLY ───────────────────────────────────────────────────────────
 *  On a desktop the hero, the philosophy and the ritual are all in view within
 *  a scroll or two and the argument reads in its intended order. The problem
 *  this solves is a phone's.
 * ═══════════════════════════════════════════════════════════════════════════
 */
/**
 * What counts as proof, in preference order.
 *
 * "Behind the scenes" is not proof. The archive's first eight items were a
 * hand holding a comb and a groom tying a thaali — real photographs, genuinely
 * hers, and not one of them an answer to "can she do my face". Finished looks
 * first; BTS, before/after pairs and the ritual sequence are excluded outright
 * rather than ranked low, because eight slots fill quickly.
 */
const PROOF: PortfolioItem["category"][] = [
  "tamil-bridal",
  "muhurtham",
  "bridal",
  "reception",
  "engagement",
  "jadai",
  "hair",
  "editorial",
];

export function proofItems(all: PortfolioItem[], limit = 8): PortfolioItem[] {
  const rank = (c: PortfolioItem["category"]) => PROOF.indexOf(c);
  return all
    .filter((i) => rank(i.category) !== -1)
    .sort((a, b) => rank(a.category) - rank(b.category))
    .slice(0, limit);
}

export default function ProofRail({ items }: { items: PortfolioItem[] }) {
  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="proof-head"
      className="pt-[var(--s-10)] lg:hidden"
    >
      <div className="shell flex items-baseline justify-between gap-4">
        <h2 id="proof-head" className="eyebrow">
          Real brides
        </h2>
        <Link
          href="/portfolio"
          className="tap link-wipe shrink-0 text-[0.72rem] uppercase tracking-[0.2em] text-champagne"
        >
          See all work →
        </Link>
      </div>

      {/* Full-bleed rail. `snap-x` so a flick settles on a photograph rather
          than halfway across two, and the page keeps vertical panning. */}
      <ul
        // The gutter matches .shell so the first photograph lines up with the
        // heading above it. Set inline: the arbitrary clamp utility was not
        // landing on an overflow container and the rail sat flush at x=0.
        style={{
          paddingInline: "clamp(1.25rem, 5vw, 5rem)",
          // Without this the mandatory snap aligns the first photograph to the
          // scrollport edge, which is INSIDE the padding — so the rail opened
          // scrolled past its own gutter and the first frame sat flush at x=0,
          // clipped against the edge of the screen.
          scrollPaddingInline: "clamp(1.25rem, 5vw, 5rem)",
        }}
        className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <li key={item.id} className="w-[62vw] shrink-0 snap-start">
            <Link
              href="/portfolio"
              className="block"
              aria-label={`${item.title} — see the work`}
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-ink-2">
                <EditorialImage
                  image={{
                    src: item.imageUrl,
                    alt: item.alt,
                    width: item.width,
                    height: item.height,
                    blurDataURL: item.blurDataURL,
                    focus: item.focus,
                  }}
                  className="h-full w-full"
                  sizes="62vw"
                  // The first is beside the fold on arrival; the rest are a
                  // flick away and lazy-load as she gets to them.
                  priority={i === 0}
                />
              </div>
              <p className="mt-2.5 truncate text-[0.75rem] uppercase tracking-[0.16em] text-ivory/55">
                {item.title}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
