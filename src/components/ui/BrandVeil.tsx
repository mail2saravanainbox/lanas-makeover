import veil from "@/content/veil-blur.json";
import BrandVeilRunner from "./BrandVeilRunner";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE BRAND VEIL
 * ═══════════════════════════════════════════════════════════════════════════
 *  A field of Kanchipuram silk drawn across the page while it actually becomes
 *  ready, then lifted off it — the way a drape is lifted rather than a curtain
 *  dropped.
 *
 *  NOTHING IS WRITTEN ON IT. No mark, no wordmark, no progress line: it is
 *  fabric and then it is gone. That is a deliberate choice and it has a cost —
 *  a first-time visitor is shown a red screen with no explanation and no
 *  indication that anything is loading — which is affordable only because it
 *  is brief, it is skippable by any input, and it is capped at 1,200ms.
 *
 *  The silk is a PHOTOGRAPH — see scripts/build-veil.mjs for why the CSS
 *  version was abandoned. It cannot be a thing the visitor waits for, though,
 *  because waiting is precisely what it exists to cover: so a 20px blur of the
 *  same photograph is inlined as a data URI and painted underneath it. The
 *  first frame is silk at zero network cost; the real fabric resolves on top
 *  whenever it lands, and on a fast connection the blur is never seen.
 *
 *  Three things make this a veil rather than a fake loading screen:
 *
 *   1. The progress line is bound to REAL readiness — document.fonts.ready
 *      and the hero image's decode() — never to a timer pretending to be one.
 *   2. It has a hard ceiling of 1,200ms. Whatever is still pending, it goes.
 *   3. It is skipped far more often than it is shown: on a repeat visit in
 *      the same session, under prefers-reduced-motion, and whenever the
 *      document had already finished loading before the script even ran.
 *
 *  Rendered server-side from the ROOT LAYOUT, as a sibling of `.page-content`
 *  rather than inside it — see the note below on stacking — and painted with
 *  the first frame rather than flashing in after hydration. It is an opening
 *  for the homepage only, and the guard enforces that by checking the path;
 *  on every other route the markup is inert and never displayed. The inline script below runs
 *  synchronously during parse — before the first paint — and removes the
 *  markup outright when a skip rule applies, so a visitor who should never
 *  see the veil never sees a frame of it.
 *
 *  The veil is `display: none` in CSS and shown ONLY while the guard has put
 *  `lm-veiled` on <html>. That inversion is the whole safety model: with
 *  JavaScript disabled the guard never runs, so the veil never displays at
 *  all. The node is never removed either, so React always hydrates against
 *  the markup it server-rendered.
 *
 *  ── WHY THIS IS NOT RENDERED FROM THE PAGE ────────────────────────────────
 *  It used to be, and it was quietly broken. `.page-content` carries
 *  `position: relative; z-index: 10`, which makes it a STACKING CONTEXT, and
 *  a fixed child of a stacking context cannot escape it however high its own
 *  z-index goes. The veil's z-90 was therefore competing inside a layer
 *  pinned at 10 — and losing to the header at 50, which sat on top of the
 *  veil the whole time. On an ivory field with ivory-ish nav text nobody
 *  noticed; on silk it is unmissable.
 *
 *  The guard's last line is a dead man's switch: if the runner never hydrates
 *  — a chunk fails, an error boundary trips — the class comes off after 2.5s
 *  regardless. It must never be possible for this to trap a page.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const GUARD = `(function(){
  var d = document.documentElement;
  try {
    if (location.pathname !== '/'
      || sessionStorage.getItem('lm:veil') === '1'
      || matchMedia('(prefers-reduced-motion: reduce)').matches
      || document.readyState === 'complete') return;
  } catch (e) { return; }
  d.classList.add('lm-veiled');
  setTimeout(function(){ d.classList.remove('lm-veiled'); }, 2500);
})();`;

export default function BrandVeil() {
  return (
    <>
      {/* Fetched at the highest priority the browser will give an image, so
          it is in flight from the first bytes of the document rather than
          from whenever the stylesheet resolves. */}
      <link rel="preload" as="image" href={veil.src} fetchPriority="high" />

      <div
        id="lm-veil"
        aria-hidden="true"
        data-veil="in"
        style={
          {
            "--veil-img": `url(${veil.src})`,
            "--veil-blur": `url(${veil.blurDataURL})`,
          } as React.CSSProperties
        }
      >
        {/* ── A KALEIDOSCOPE, NOT A MIRROR ────────────────────────────────
            Read off the reference at full resolution: the fabric is mirrored
            on BOTH axes and radiates from the centre, the way a kolam or a
            loom repeat does. A single left-right mirror — which is what this
            was — gets the seam right and the structure wrong.

            Four quadrants of the same brocade: top-left as shot, top-right
            flipped in X, bottom-left in Y, bottom-right in both. They all run
            the same pan, so the weave moves without the axes ever drifting. */}
        <span className="lm-veil__silk">
          <span className="lm-veil__quad" />
          <span className="lm-veil__quad" />
          <span className="lm-veil__quad" />
          <span className="lm-veil__quad" />
        </span>
      </div>
      <script dangerouslySetInnerHTML={{ __html: GUARD }} />
      <BrandVeilRunner />
    </>
  );
}
