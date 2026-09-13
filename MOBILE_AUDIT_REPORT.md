# Mobile audit — what changed

Written after Phases 0–6. Every number here was measured on the live site at
390 × 844, and every claim is checked by a test in `tests/smoke.spec.ts` unless
it says otherwise.

---

## The finding

> a desktop editorial layout linearised onto phones

That was the diagnosis, and it was right. Nothing on the site was *wrong* on a
phone — it was the desktop page, stacked. The costs were length, repetition,
and controls sized for a cursor.

| | before | after |
|---|---|---|
| Homepage | 33.3 screens | **12.3** |
| Ritual section (§02) | ~6 screens | **1.21** |
| /services | 13.2 screens | **9.3** |
| /services/`<slug>` | 11 screens | **8** |
| /about | 9.6 screens | **9.2** |
| /portfolio | 8.9 screens | **8.7** |
| Enquiry | 6 steps | **3** |
| Inline "Check Your Date" on the homepage | 8 | **3** |
| Inline "Check Your Date" on /services | 6 | **0** |
| Controls under 44 px | 39 | **0** |
| Text under 4.5 : 1 | — | **0** |
| Horizontal overflow | — | **0 px on every page** |

---

## Phase by phase

### 0 · Inventory
`content-inventory.json` — every string on the site, with where it appears.
This is the artefact that made the repetition visible: some copy was rendered
in seven places.

### 1 · Copy
Placeholder copy that was live in production removed. `⟨confirm⟩` markers in
the FAQ render nothing unless placeholder badges are on. An internal note to
the client — rendered on the client's own website, where every bride could read
it — taken out of /about.

### 2 · The homepage
Twelve sections to eight; 33.3 screens to 16.8. Sections the client asked to
remove (The Lana Look, the Journal teaser, Silk · Gold · Jasmine, the
silhouette framing) removed, keeping the photographs.

### 3 · The sticky bar and WhatsApp
`MobileActionBar` extended rather than duplicated: hero-gated by
IntersectionObserver, hides on scroll down, `inert` + `aria-hidden` when down
so it is not a trap in the tab order.

`src/lib/whatsapp.ts` is the single implementation. It rejects the
`91XXXXXXXXXX` placeholder — a number that strips to `91` — so **no WhatsApp
control renders at all until a real number is configured.** Nothing on the site
currently links to `wa.me`, and a test asserts that.

### 4 · The ritual on a phone
`StagesMobile.tsx`. One sticky 4 : 5 frame, an eight-segment progress rail, a
caption, and 56 px thumbnails on native scroll-snap. Swipe, tap and ←/→ all
move it. Autoplay runs at 3.5 s until the first deliberate input and never
after; reduced motion turns it off entirely. Without JavaScript the first frame
renders and the eight stages print as a list.

Two things this turned up, both worth remembering:

- **`lg:hidden` lays two renderings out; it does not stop one running.** The
  hidden desktop scrub kept observing scroll, and because a `display:none`
  container has no layout box to defer against, the browser fetched its lazy
  images anyway — six photographs down a phone connection to show one, and
  sixteen "Stage n" buttons in the accessibility tree. `useIsWide()`
  (`src/lib/motion/useBreakpoint.ts`) mounts only the half that is real, and
  returns `null` until hydration so no-JS keeps both.
- **An observer asking "which thumbnails can I see" is wrong on a rail five
  thumbnails wide.** Every one reported in on mount and the last callback won,
  so the carousel opened on stage three. The root is now inset 49 % either side
  — a centre line only one thumbnail can occupy — and the rail's own
  `padding-inline` is half its width, so `scrollLeft: 0` *is* stage one centred.

### 5 · The inner pages
- **/services** rendered every service's full prose and Includes list inline,
  six times, with a booking button each. All of it is the canonical content of
  `/services/<slug>`, one tap away. Below `lg` the index is an index.
- **/services/`<slug>`** showed twelve archive photographs under "Selected
  work" — and the same twelve on the other five service pages and again on
  /portfolio, so the archive was being shown seven times over. Six is a
  selection, and the heading names the full archive.
- **/portfolio** had four labelled axes of chips between a bride and the first
  photograph on a page she came to look at photographs on. The primary axis
  stays as a rail; the rest go behind one button that says how many are on. The
  sheet is a native `<dialog>` opened with `showModal()`, so the focus trap,
  Escape, the inert background and the top layer are the browser's.
- **/about** said the service area twice: the Locations section, then the same
  two facts word for word in the trust section a screen and a half later.
  `TrustSignals` takes an `omit` so one page can withhold what it has already
  made a section of. `trust.ts` is untouched.
- **/contact** — six steps to three. **Every field name is unchanged**; this is
  the payload the API, the store and the CRM mapping agree on. A wedding date
  and the city it is in are one question asked twice, and so are "which events"
  and "what do you need". The review now sits under the details it summarises.
  `PANELS[]` groups the six panels; validation stays keyed to the panel, so
  `GUARDED`, the submit re-check and the review's Edit links all still speak in
  panels.

### 6 · Tap targets, contrast, type, motion, weight
- **39 controls under 44 px → 0.** `.tap` gives a text link a 44 × 44 hit area
  without changing how it looks, below `lg` only.
- **Contrast: nothing under 4.5 : 1** that a screen reader can reach.
- **Type:** nothing over 56 px or past 75 ch at 390 px.
- **Motion:** zero running animations under `prefers-reduced-motion`, and the
  carousel does not autoplay.
- **Weight:** 187 KB of JavaScript over the wire on the homepage. Normal for
  React 19 and Next 16; nothing to strip.

---

## Still waiting on you

Each of these is gated behind an environment variable and renders **nothing**
until it is set. None of them is faked in the meantime.

| | what it turns on |
|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | the WhatsApp control in the sticky bar, the enquiry and the footer |
| `RESEND_API_KEY` + `ENQUIRY_INBOX` | enquiries reaching an inbox — they are recorded either way, and the form says plainly that no inbox is connected |
| a credential line | one factual line on /about: years working, brides, training. Nothing renders until there is one, because the alternative is inventing it. |
| FAQ policies | the `⟨confirm⟩` answers — travel radius and charges, typical durations, whether draping is included, trial availability, the advance amount, the rescheduling policy |

---

## What the tests hold

`npx playwright test` — 77 passing, 25 skipped (project-scoped), across
`desktop` 1280 × 800 and `mobile` 390 × 844.

The ones that guard this work specifically:

- the ritual is ≤ 1.3 screens, and fetches at most three frames
- the services index carries no Includes list and at most one inline booking link
- a service page shows at most six photographs and names the archive
- the archive filter is a rail plus a sheet, and Escape closes it
- /about states the service area once
- the enquiry is three steps, refuses an empty required field, and keeps what
  was entered when you go back
- **no control under 44 px on seven pages**
- **no text under the contrast minimum**
- no page scrolls horizontally at 390 px
- no `wa.me` link exists while no number is configured

---

# Phase 7 — the mobile reconstruction brief

A second pass against a written brief (header, hamburger, menu, sticky CTA,
ritual, filters, jewellery, services, FAQ, footer, type, motion, a11y,
performance). Phases 0–6 above had already taken the length out; this phase was
about the controls themselves.

Measured at 320 / 360 / 375 / 390 / 414 / 430 unless stated.

## What was actually wrong

| | before | after |
|---|---|---|
| Hamburger bars in the markup | **2** | **3** |
| Hamburger target | 44 × 44 | **48 × 48** |
| `aria-controls` on the toggle | absent | present |
| Controls in the mobile header | 4 | **2** |
| WhatsApp controls on screen at once (phone) | 2 | **1** |
| Ritual controls | 8 thumbnails | **2 arrows + counter + dots** |
| Ritual autoplay | 3.5s | **none** |
| /services | 9.5 screens | **4.7** |
| Jewellery hub | 4 room cards | **the collection, 133 sets** |
| Footer | 1.62 screens | **1.50** |
| Menu links reachable in landscape | 7 of 10 | **10 of 10** |
| Smallest informational type | 11.5px @ 2.81:1 | **13px, ≥ 4.5:1** |

## The three that were real defects, not preferences

- **The hamburger had two bars.** Not clipped, not transformed away, not an
  opacity bug — the markup drew a top rule and a bottom rule at 1px each in an
  18 × 9px box, and there was never a middle one.

- **`hidden lg:flex` is not "not rendered".** Removing WhatsApp and Instagram
  from the phone's header by hiding them left both anchors in the DOM and in
  the accessibility tree, so a screen reader on a phone still met a WhatsApp
  link in the header — the same control the sticky bar was already carrying.
  `WideOnly` (new, `src/components/ui/WideOnly.tsx`) unmounts the half that is
  not on screen. Same lesson as `useIsWide`, one component further on.

- **266 rental image URLs were answering 404.** Pre-existing, found by the
  suite, unrelated to this brief. `next.config.ts` builds its redirect map from
  `rental.json.legacyImageUrls`, and the naming script never wrote that key —
  so every path that existed before the photographs were renamed was dead. For
  a catalogue whose front door is Google Images, that is the indexed surface.
  Recovered by deriving the old path from the item's `slug`, which still *is*
  the supplier's stock code; the explicit map wins the moment the script starts
  emitting one.

## What a test run is worth

`npx playwright test` — the suite runs with **no env vars**, which is the state
the repo ships in. Nine tests encoded Phase 0–6 behaviour that this brief
deliberately supersedes (eight ritual thumbnails, four jewellery room cards,
"Filters", the channels in the phone's header, a six-card services index).
Those were rewritten to assert the new behaviour, not deleted — each one still
guards the thing it was written to guard:

- the ritual test still checks the live region, the caption and that exactly
  one frame is opaque; it now also checks 48px targets and the disabled ends
- the jewellery test still checks that no count is ever typed; it now reads the
  total the hub opens with and asserts it is the sum of the four rooms
- `no control is rendered twice` was keyed by scope **tag name**, so a site
  header's "Locations" nav link and a page header's breadcrumb "Locations"
  collided as one key. Keyed by element identity now — it was reporting two
  different controls in two different places as a duplicate.
