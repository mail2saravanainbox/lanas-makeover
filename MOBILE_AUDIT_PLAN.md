# Mobile audit — discovery & plan

Phase 0 output. No source file was modified to produce this.

## 1. Repo map

| | |
|---|---|
| Framework | Next.js **16.3.3**, React 19.2.8, **App Router** (`src/app`) |
| Styling | **Tailwind v4** via `@tailwindcss/postcss`; one `@theme` block in `src/app/globals.css` holding every colour, font, duration, spacing and display-scale token |
| Breakpoints | Tailwind defaults. The codebase uses **`sm:` (640) and `lg:` (1024)** far more than `md:`. The mobile/desktop split for navigation and the action bar is **`lg`**, not `md`. |
| Content | Hard-coded TS in `src/content/*` behind a `ContentProvider` interface (`src/lib/content/provider.ts`). No CMS. |
| Images | One component only — `src/components/ui/EditorialImage.tsx` → `next/image`. `next.config.ts` sets AVIF/WebP, `deviceSizes` 360–2560. |
| Animation | No library. `IntersectionObserver` + a shared rAF scheduler (`src/lib/motion/scheduler.ts`); Lenis for smooth scroll. |
| Existing mobile components | `MobileNav.tsx` (drawer), **`MobileActionBar.tsx` (sticky CTA — already exists)** |
| Commands | `npm run lint` · `npx tsc --noEmit` · `npm run build` · `npm test` (Playwright, 62 tests, projects `desktop` 1280 and `mobile` 390) |

### Breakpoint decision
The brief says "desktop ≥ md/768". **This codebase splits at `lg` (1024)**, because the nav drawer and the action bar do. Using `md` would leave a 768–1023px band with a mobile action bar *and* a desktop layout. **I will scope to `lg:` to match the existing system** (operating rule 2 — detect, don't assume) and note any place this differs from the brief.

## 2. Audit item → file map

| Audit item | File | Lines | Approach |
|---|---|---|---|
| Pre-header location strip | **does not exist** | — | See §4 conflict 2 |
| Header / desktop nav / drawer / floating CTA | `components/ui/Nav.tsx`, `MobileNav.tsx`, `MobileActionBar.tsx`, `WhatsAppButton.tsx` | — | `inert`+`aria-hidden` on the inactive one |
| Hero | `components/sections/Hero.tsx` | 68–114 | Hide wordmark line, italic line, scroll cue below `lg` |
| §01 Before the bride | `components/sections/ActBefore.tsx` | whole | Show 1 of 3 images below `lg` |
| §02 The ritual (8 stages) | `components/sections/ActRitual.tsx` | 369 lines | New `StagesMobile.tsx`; stage data from `content/timeline.ts`? — **verify source** |
| §03 The ceremonies | `BridalWorlds.tsx` + `WorldCard.tsx` | WorldCard 77–79 | 2×2 tiles; `aria-hidden` the index |
| §04 Artist + facts + Her morning | `ActArtist.tsx` | 96 eyebrow, 153+ timeline | Move timeline to `/about#her-morning` |
| §05 What you can count on | `TrustSignals.tsx` | rendered `page.tsx:166` **and** `about/page.tsx:248` | Remove from home (global) |
| §06 The investment | `Pricing.tsx` | 76 placeholder string | `<details>` for "What moves the number" |
| §07 The mirror | `FinalMirror.tsx` | — | Hide its CTA below `lg`; fix duplicated poem |
| §08 Closing + footer | `ClosingCTA.tsx`, `Footer.tsx` | ClosingCTA 11 (`index = 11`), Footer 164 | Merge; drop credit line |
| Shared inner-page CTA | `ClosingCTA.tsx` | **line 11: `index = 11`** | Make the number opt-in |
| Services list | `app/services/page.tsx` | 150 placeholder | Trim card body below `lg` |
| About | `app/about/page.tsx` | 157 placeholder | Add `#her-morning`; de-duplicate cities |
| Portfolio | `app/portfolio/page.tsx`, `PortfolioGrid.tsx`, `PortfolioFilter.tsx` | — | Chip rail + filter sheet |
| Contact | `app/contact/page.tsx`, `booking/BookingFlow.tsx` | 115 placeholder | 6 steps → 3, same payload |

## 3. String grep results

| String | Found |
|---|---|
| `not yet published` | `sections/Pricing.tsx:76` |
| `none has been supplied` | `app/about/page.tsx:157` |
| `quoted to us` | `app/services/page.tsx:150` |
| `published here` | `app/contact/page.tsx:115` — also `app/terms/page.tsx:51` (**legitimate legal copy, leave alone**) |
| `Designed as a bridal editorial experience` | `ui/Footer.tsx:164` |
| `11 — Check` | **No literal match** — it is computed by `sectionEyebrow(11, …)` from `ClosingCTA.tsx:11`. The audit is right; the grep was the wrong instrument. |
| `telephone=no` | `app/layout.tsx:72` `formatDetection: { telephone: false }` |
| `w=2560` | **No source match.** See §4 conflict 3. |

## 4. Conflicts, corrections and risks

**1. `WHATSAPP_NUMBER` is the unfilled template placeholder `91XXXXXXXXXX`.** Not a real number. Treated as `UNKNOWN` per operating rule 4: everything goes behind `NEXT_PUBLIC_WHATSAPP_NUMBER` and renders nothing while unset.

**2. The pre-header location strip does not exist.** Measured DOM order at 390px is: brand → skip-link → LS → brand → brand → nav → CTA. The `@lanasmakeover · Chennai · …` line the audit describes is inside the **mobile drawer**, which is off-screen. Nothing to remove; the real bug is the third brand repetition (drawer + page-transition overlay both in the DOM).

**3. "Every `next/image` resolves to `w=2560`" is not reproducible.** Measured on the live page at 390px: 7 image requests, widths `{480×2, 1080×1, 1280×4}`, **zero at 2560**. `sizes` is already set at 35 call sites plus a default in `EditorialImage`. `w=2560` appears only in the `src` *fallback* attribute, which browsers ignore when a `srcset` is present. I will **audit per component and fix only where `sizes` is genuinely wrong**, rather than blanket-editing 35 correct call sites.

**4. A sticky CTA already exists.** `MobileActionBar.tsx` is live below `lg`, reserves its own height via `--action-bar-h`, and hides itself on `/contact`. Phase 3 will **extend it** (scroll-direction behaviour, hero IntersectionObserver, WhatsApp) rather than add a second component — building `MobileStickyCta` alongside it would ship two bars.

**5. Sections the audit lists that were already removed this week**: the journal teaser, the featured-work teaser, Silk · Gold · Jasmine, and the hair silhouette. The homepage is already 12 → 8 sections and 33 → 24.5 screens. The audit's remaining eight items all still exist and all still apply.

**6. Operating rule 9 says do not push or deploy.** That reverses this project's established workflow, where every change is pushed and deployed. **I will follow the brief** — commits only, nothing pushed — and wait for an explicit instruction to ship.

**7. `<Transformation />` renders `null`** (no permissioned before/after pair exists). It costs nothing and is invisible; out of scope.

## 5. Measured baseline (iPhone 13, 390×844, veil skipped)

| Page | Height | Screens | Links to `/contact` |
|---|---|---|---|
| `/` | 16,286px | **24.5** | **9 (8 visible)** |
| `/services` | 11,910px | 17.9 | **12** |
| `/portfolio` | 8,349px | 12.6 | 6 · *0 images in the first paint* |
| `/about` | 7,505px | 11.3 | 7 · *"Trichy" ×9* |
| `/contact` | 3,467px | 5.2 | 4 |

Homepage city repetition: Chennai ×2, **Trichy ×6**, Pudukkottai ×2, Madurai ×2.

## 6. Open questions (non-blocking; assumptions stated)

1. **`md` vs `lg`** — proceeding with `lg` to match the codebase. Say if you want the literal 768 instead.
2. **Her morning on desktop home** — the brief allows either. I will **move it** (single source on `/about`), because keeping two copies is the problem the audit is about.
3. **Party & Guest image** — will pick from the BTS/party set; if nothing suits, `TODO(client)` and leave as is.
