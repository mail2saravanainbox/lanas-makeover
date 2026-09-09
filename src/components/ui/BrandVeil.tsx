import JasmineMark from "./JasmineMark";
import BrandVeilRunner from "./BrandVeilRunner";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE BRAND VEIL
 * ═══════════════════════════════════════════════════════════════════════════
 *  A field of Kanchipuram silk holding the mark and the wordmark while the
 *  page actually becomes ready, then lifting upward to reveal it — the way a
 *  drape is lifted rather than a curtain dropped.
 *
 *  The silk is drawn in CSS (see globals.css), not photographed. A
 *  full-viewport silk JPEG would be a download sitting in front of the page it
 *  is supposed to be covering; this paints on the first frame at no network
 *  cost at all.
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

export default function BrandVeil({ brand }: { brand: string }) {
  return (
    <>
      <div id="lm-veil" aria-hidden="true" data-veil="in">
        <div className="lm-veil__mark">
          <JasmineMark className="h-8 w-8" />
        </div>
        <p className="lm-veil__word">{brand.replace(/'s/i, "\u2019s")}</p>
        <span className="lm-veil__rail">
          <span className="lm-veil__line" />
        </span>
      </div>
      <script dangerouslySetInnerHTML={{ __html: GUARD }} />
      <BrandVeilRunner />
    </>
  );
}
