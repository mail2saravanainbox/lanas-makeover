import JasmineMark from "./JasmineMark";
import BrandVeilRunner from "./BrandVeilRunner";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE BRAND VEIL
 * ═══════════════════════════════════════════════════════════════════════════
 *  An ivory field holding the mark and the wordmark while the page actually
 *  becomes ready, then wiping upward to reveal it.
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
 *  Rendered server-side, on `/` only, so it is painted with the first frame
 *  rather than flashing in after hydration. The inline script below runs
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
 *  The guard's last line is a dead man's switch: if the runner never hydrates
 *  — a chunk fails, an error boundary trips — the class comes off after 2.5s
 *  regardless. It must never be possible for this to trap a page.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const GUARD = `(function(){
  var d = document.documentElement;
  try {
    if (sessionStorage.getItem('lm:veil') === '1'
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
          <JasmineMark className="h-8 w-8 text-bronze" />
        </div>
        <p className="lm-veil__word">{brand}</p>
        <span className="lm-veil__rail">
          <span className="lm-veil__line" />
        </span>
      </div>
      <script dangerouslySetInnerHTML={{ __html: GUARD }} />
      <BrandVeilRunner />
    </>
  );
}
