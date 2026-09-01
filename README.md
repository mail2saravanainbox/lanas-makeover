# Lana's Makeover

An immersive, story-driven website for **Lana's Makeover** — a bridal and party
transformation makeup artist based in **Trichy, Tamil Nadu**, working in natural,
HD and South Indian bridal registers.

The homepage is structured as a film in nine acts rather than as a brochure, and
a single fixed WebGL surface sits behind the document adding depth to three of
them. Remove that surface and the site is still complete.

---

## 1. Project overview

**The central idea:** *the moment before she becomes the bride.*

| Act | Section | What it does |
|-----|---------|--------------|
| 0 | Opening cinematic | A held line of type and a procedural jasmine bloom in the dark |
| I | Before the bride | "We don't change her. We reveal her." — layered parallax portrait |
| II | The artist | Lana, in her own configurable words |
| — | Silk transition | The camera passes through shader-displaced cloth |
| III | The bridal ritual | **The primary interaction.** Scroll drives five stages: bare → prepared → defined → adorned → bridal |
| IV | The heritage | Kanchipuram, zari, jasmine and temple gold as material culture |
| — | Bridal worlds | Six services as 3D-tilting editorial cards |
| V | The women | Bride stories |
| — | Her morning | The bridal-day timeline |
| — | The detail / the silhouette / the atelier | Craft disciplines, hair, behind the scenes |
| VII | The journal | Editorial + organic search surface |
| VIII | The final mirror | The closing beat of the film |
| IX | Your story | Enquiry CTA |

### Design principles enforced throughout

1. **Lana's artistry is the hero.** 3D is sixth in the hierarchy, never first.
2. **Nothing is fabricated.** No invented testimonial, price, credential, award,
   client or year of experience appears anywhere. See §7 below.
3. **WebGL only ever enhances.** Every act is complete, premium and accessible
   without it.
4. **The frontend never knows where content comes from.** One interface,
   three providers.

---

## 2. Technology stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, React 19, TypeScript, Turbopack) |
| Styling | Tailwind CSS v4 with a token-based design system in `globals.css` |
| 3D | Three.js + React Three Fiber (hand-written GLSL, no post-processing stack) |
| Motion | GSAP + ScrollTrigger, Lenis smooth scroll, IntersectionObserver reveals |
| Type | Cormorant Garamond (display) + Inter (interface), via `next/font` |
| Analytics | Vercel Analytics + optional GTM / GA4 |
| Hosting | Vercel |

**No 3D asset files.** The jasmine bloom is generated as real geometry at
runtime (~1.4k triangles) and every material is a hand-written shader. Total
3D payload on the wire: zero bytes.

---

## 3. Installation & development

```bash
npm install
cp .env.example .env.local     # optional — the site runs with no configuration
npm run dev                    # http://localhost:3000
```

```bash
npm run lint      # ESLint (must be clean)
npm run build     # production build (must succeed)
npm run start     # serve the production build
```

---

## 4. Environment variables

Every key is documented in **`.env.example`**. Nothing is required to run the
site — it ships fully functional on local content.

| Variable | Required | Purpose |
|---|---|---|
| `CONTENT_SOURCE` | no | `local` (default) · `cms` · `instagram` |
| `NEXT_PUBLIC_SITE_URL` | before production | Canonicals, OG URLs, sitemap, robots |
| `INSTAGRAM_ACCESS_TOKEN` | for Instagram | Graph API long-lived token — **server only** |
| `INSTAGRAM_USER_ID` | for Instagram | Instagram user id — **server only** |
| `INSTAGRAM_SYNC_SECRET` | for Instagram | Shared secret protecting the sync route |
| `CMS_API_URL` / `CMS_API_TOKEN` | for CMS | Headless CMS endpoint |
| `CONTACT_TO_EMAIL` / `RESEND_API_KEY` | for email | Enquiry delivery |
| `NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_GA_ID` | no | Analytics; nothing loads unless set |

> **Never** prefix a secret with `NEXT_PUBLIC_`. `src/lib/instagram/client.ts`
> imports `server-only`, so a build fails outright if a client component ever
> tries to reach the Instagram credentials.

---

## 5. Content architecture

```
src/
├─ app/                       routes (App Router)
├─ components/
│  ├─ 3d/                     StoryCanvas, shaders, jasmine, DOM↔WebGL binding
│  ├─ sections/               the nine acts + shared page sections
│  ├─ portfolio/              grid, lightbox, before/after slider
│  ├─ journal/                article renderer
│  └─ ui/                     nav, cursor, reveals, images, forms
├─ content/                   ← everything the client edits
│  ├─ site.ts                 brand, contact, biography, CTA copy
│  ├─ services.ts             the bridal worlds
│  ├─ brides.ts               bride stories
│  ├─ testimonials.ts         (intentionally empty)
│  ├─ faq.ts   timeline.ts   disciplines.ts
│  ├─ journal/posts.ts        articles
│  └─ portfolio/local.ts      portfolio items
└─ lib/
   ├─ types.ts                the canonical content contracts
   ├─ content/                provider.ts · local.ts · cms.ts · instagram.ts
   ├─ instagram/              client · normalize · categorize · store
   └─ seo.ts  analytics.ts  utils.ts
```

### The provider pattern — why the frontend is CMS-ready

Every page calls exactly one function:

```ts
import { content } from "@/lib/content/provider";
const services = await content().getServices();
```

`content()` returns whichever `ContentProvider` `CONTENT_SOURCE` selects:

```
LocalContentProvider  →  /src/content            (default)
CMSContentProvider    →  a headless CMS          (extends Local; falls through)
InstagramContentProvider → synced media store    (extends Local for non-media)
```

All three satisfy the same interface in `src/lib/types.ts`
(`PortfolioItem`, `BrideStory`, `BlogPost`, `Service`, `Testimonial`,
`SiteSettings`, `FAQItem`). **No component imports a provider, a CMS SDK or a
content file directly.** Adopting Sanity/Payload/Contentful means implementing
methods in `cms.ts` and changing one environment variable — no component is
touched.

---

## 6. Portfolio & Instagram integration

### Architecture

```
Instagram Graph API
   │  POST /api/instagram/sync   (authenticated, server-side only)
   ▼
normalize → suggest category → merge over existing curation → store
   │
   ▼  published items only
InstagramContentProvider → PortfolioGrid / lightbox / detail pages
```

### Guarantees

* **No scraping.** Official Graph API only (`@lanasmakeover` is a Professional
  account, so this path is available). No HTML parsing anywhere.
* **No client-side tokens.** `server-only` makes it a build error.
* **Not fetched on page render.** Pages read the store; only the sync route
  talks to Meta. Portfolio routes use `revalidate = 3600`.
* **Pagination is bounded** — a hard page ceiling prevents runaway requests.
* **Curation is mandatory (§14).** Every imported item arrives
  `published: false`. Nothing reaches the public site until a human publishes it.
* **Curation survives re-sync.** `published`, `featured`, `category`, `title`,
  `alt`, `slug` and `weight` are never overwritten by a sync.
* **Deletion is safe.** Removing a post on Instagram does not silently empty
  the website; the record is retained and reported.

### Running a sync

```bash
curl -X POST https://<host>/api/instagram/sync \
  -H "Authorization: Bearer $INSTAGRAM_SYNC_SECRET"
```

```json
{ "ok": true,
  "summary": { "imported": 47, "created": 12, "updated": 5,
               "skipped": 30, "errors": 0, "syncedAt": "…" } }
```

`GET /api/instagram/sync` returns a non-secret status probe (also surfaced on
`/admin`).

> **Production note.** The store persists to memory + the OS temp directory,
> which is ephemeral on serverless. Before making Instagram the live source,
> swap `readDisk`/`writeDisk` in `src/lib/instagram/store.ts` for Vercel KV,
> Postgres or the CMS. That file is the only thing that changes.

---

## 6a. Adding Lana's photographs (the important one)

The site ships with **no photographs**. Every image is a procedurally generated
placeholder plate — there is not one stock photo, Unsplash image or AI-generated
bride anywhere in the repository. Verified: zero references to any stock service,
zero raster files, zero remote image URLs.

### To fill the entire site with real work

```bash
# 1. Drop Lana's approved photographs here
content/incoming/
    bridal-01.jpg
    muhurtham-gold-drape.jpg
    hair-jadai-02.jpg
    reception-evening-01.jpg
    bts-morning-kit.jpg

# 2. Run
npm run import:portfolio
```

That is the whole process. The filename prefix sets the category
(`bridal-`, `reception-`, `engagement-`, `hair-`, `editorial-`, `bts-`,
`beforeafter-`, `party-`); see `content/incoming/README.md` for the full table.

### What the pipeline does

1. **Strips EXIF** — camera, GPS and personal metadata removed.
2. Writes an optimised **WebP** (max 2000px) plus a **640px thumbnail**.
3. Generates a real **blur-up placeholder from the photograph itself**.
4. Derives intrinsic width/height, slug, readable title and descriptive alt text.
5. Assigns an editorial layout weight from the actual aspect ratio.
6. **Preserves your curation on every re-run** — `title`, `alt`, `category`,
   `featured`, `published` and `sortOrder` survive.
7. Writes `src/content/portfolio/portfolio.json`.

### Where the photographs then appear — automatically

The moment `portfolio.json` contains a published item it replaces the plates
across the whole site, with **no code change**:

| Slot | Fed from |
|---|---|
| Act I — the three parallax layers | bridal, editorial |
| Act III — the five transformation stages | behind-scenes → editorial → hair → bridal |
| Act IV — heritage motifs | bridal, hair |
| The silhouette (hair sequence) | hair |
| The art of the detail | editorial, bridal, hair |
| The atelier | behind-scenes, editorial |
| The final mirror | bridal, editorial |
| Bridal worlds / services | each world's own category |
| Journal covers | a *different* photograph per article |
| Portfolio grid, lightbox, detail pages | everything published |

Grids and WebGL use the **thumbnail**, never the 2000px original (§13, §34).

Two slots are deliberately never auto-filled:

* **The artist portrait.** A photograph of a bride is not a photograph of Lana.
  Until a real portrait exists, `/about` and the homepage artist act render a
  typography treatment instead of a stand-in.
* **Bride stories.** These assert facts about a named person. Every sample entry
  is `published: false`; the site shows *Featured Bridal Looks* — real work with
  neutral titles — until permissioned stories are added.

---

## 7. Content honesty

This is a deliberate architectural feature, not an oversight.

| Item | Status |
|---|---|
| Brand, discipline, base city, specialities, travel | **Verified** from the public Instagram profile |
| Phone, WhatsApp, email | **Empty.** The WhatsApp button and phone links do not render at all until configured |
| Testimonials | **Empty array.** The section hides itself entirely — no invented quote |
| Bride stories | **Sample entries**, badged "Sample story", titled by ceremony rather than by an invented person |
| Photography | **None.** Every image is a procedural `PlaceholderPlate`, badged "Placeholder" |
| Years of experience, awards, training, clientele, pricing | **Absent.** Never claimed |
| Timeline ("Her morning") | Marked illustrative in the UI and in the content file |
| FAQ answers needing Lana's policy | Marked `⟨confirm⟩`, rendered as a "To confirm" chip |

Two switches in `content/site.ts` control this:

```ts
contentIsPlaceholder: true,   // shows the preview notice in the footer + /admin
showPlaceholderBadges: true,  // tags placeholder imagery and sample stories
```

Set both to `false` once real content is in. **Replacing a placeholder with a
photograph is one line:** add `src` to the `ImageRef` and the plate disappears.

---

## 8. SEO

* Next.js Metadata API on every route: title, description, canonical, Open
  Graph, Twitter card, robots.
* Dynamic `sitemap.xml` (44 URLs) — published content only.
* `robots.txt` allowing everything public, disallowing `/admin` and `/api`.
* Generated OG image at `/opengraph-image`; bride stories and journal posts
  use their own featured image when one exists.
* Structured data: `BeautySalon`, `Person`, `Article`, `BreadcrumbList`,
  `ImageObject`, `FAQPage`.
* Search surfaces are **real articles and real discipline pages**, not keyword
  padding. Geography targets **Trichy / Tiruchirappalli / Tamil Nadu** — the
  artist's actual base.
* All SEO config is editable in `src/lib/seo.ts`.

### Before indexing

A client/ops checklist. None of it is code — do it once, before submitting the
site to Search Console.

1. **Set `NEXT_PUBLIC_SITE_URL`** to the real origin (e.g.
   `https://www.lanasmakeover.com`) in the Vercel project's Production
   environment. Until it is set, canonicals, Open Graph URLs, `sitemap.xml`
   and `robots.txt` point at whatever host answered the build — which for a
   Vercel deployment is a per-deploy hostname that stops existing.
2. **Confirm the live host answers `200` to Googlebot.** From a machine
   outside the Vercel account:

   ```bash
   curl -sI -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
     https://<host>/ | head -20
   ```

   Look for `HTTP/2 200`. A `401` means Vercel **Deployment Protection** is on
   (Project → Settings → Deployment Protection); a production site cannot be
   indexed while it is. An automated-access refusal page — Vercel's bot
   challenge — is the same problem wearing a different status code.
3. **Confirm no header blocks crawlers**: the response must not carry
   `x-robots-tag: noindex`, and `https://<host>/robots.txt` must be reachable
   and must not `Disallow: /`.
4. **Then** submit `https://<host>/sitemap.xml` in Search Console.

Steps 1–3 are settings in the Vercel dashboard and the domain registrar. This
repository cannot change them and does not try to.

---

## 9. Analytics

Provider-agnostic; nothing loads unless an ID is configured. Events emitted:

`portfolio_view` · `bride_story_view` · `journal_view` · `booking_click` ·
`whatsapp_click` · `instagram_click` · `contact_submit`

---

## 10. Performance & fallbacks

* One WebGL canvas for the whole document, not one per section.
* `useDeviceCapability` decides once per device: no WebGL, reduced motion, or a
  low-power phone → the canvas never mounts and the 2D experience runs.
* Phones that do get WebGL keep the atmosphere and jasmine but skip the two
  heavy shader planes.
* Portfolio paginates at 12; images beyond the first page never enter the DOM.
* `next/image` with AVIF/WebP, responsive `sizes`, lazy by default.
* Scenes whose DOM anchor is absent on the current route cost nothing.
* Reduced motion strips every transform while preserving every meaning.

---

## 11. Accessibility

Semantic landmarks · skip link · visible focus rings · focus-trapped dialogs ·
Escape/arrow-key support · `role="slider"` before/after control with keyboard
operation · `aria-live` announcements for scroll-driven stages · alt text on
every meaningful image · nav revealed on first Tab press so keyboard users are
never trapped behind the opening animation · no hover-only interaction.

---

## 12. Deployment

```bash
npm install && npm run lint && npm run build
vercel                 # preview deployment
vercel --prod          # production (only when the client approves)
```

Set `NEXT_PUBLIC_SITE_URL` in Vercel before production so canonicals and the
sitemap point at the real domain.

---

## 13. Roadmap

1. Replace placeholder plates with Lana's photography (`src` on each `ImageRef`).
2. Add the real phone, WhatsApp and enquiry inbox to `content/site.ts`.
3. Wire enquiry delivery in `src/app/api/contact/route.ts`.
4. Add real testimonials and real bride stories; flip both honesty switches off.
5. Connect the Meta app, run the first Instagram sync, curate.
6. Move the Instagram store to durable storage (KV / Postgres).
7. Add authentication in front of `/admin`, then build the write layer.
8. Choose a headless CMS and implement `CMSContentProvider`.
9. Supply five real photographs to the transformation shader for the full
   photographic version of Act III.
