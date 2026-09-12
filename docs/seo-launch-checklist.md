# SEO launch checklist

What is done, what is waiting on you, and what to do in the first month.

Everything in **Done** is in the repository and covered by a test. Everything
in **Yours** needs something only you can supply — a login, a decision, or a
fact about the business. None of it is faked in the meantime.

---

## Done

### Foundations
- [x] One canonical host. `www.lanas.in` → `lanas.in` with a 308, in
      `next.config.ts` rather than the Vercel dashboard, so it lives in the
      repo and cannot be changed by a click.
- [x] `robots.txt` — everything public crawlable, `/admin` and `/api` not.
- [x] `sitemap.xml`, generated from real content. Unpublished items never
      appear: the provider filters them before the sitemap sees them.
- [x] Canonical URL on every page, absolute, from `NEXT_PUBLIC_SITE_URL`.
- [x] Retired `/portfolio/<image>` URLs 301 to their collection with the
      lightbox pre-opened. Nothing that was ever indexed 404s.
- [x] **The city pages moved to exact-match URLs.** See the URL map below.
      Every old URL 308s, and a test fails the build if one stops doing so.
- [x] Open Graph and Twitter cards, with a generated image per route.
- [x] No horizontal scroll at 390px; every tap target ≥44px; text ≥4.5:1.
      All three are Core Web Vitals / page-experience inputs and all three
      are held by tests.

### Structured data
- [x] `BeautySalon` once, in the root layout, with `areaServed` for the four
      cities and Tamil Nadu, and now `telephone` from the configured WhatsApp
      number.
- [x] `Person` for Lana on `/about`, `worksFor` the business.
- [x] `Service` per service page and per city page — no `offers` block on any
      of them, because no price exists.
- [x] `FAQPage` on `/faq` and on each city page, built from the same items the
      page renders.
- [x] `BreadcrumbList` on every non-home route.
- [x] `CollectionPage` + `ImageObject` on portfolio collections.
- [x] `Article` on journal posts.

### Content surfaces
- [x] Three discipline pages: `/bridal`, `/hair`, `/makeup`.
- [x] Six service pages.
- [x] Seven portfolio collections.
- [x] Seven journal posts, and fifteen briefed in `docs/journal-briefs.md`
      — twelve general, three in the jewellery cluster.
- [x] **Four city pages** — `/bridal-makeup-<city>` — plus the `/locations`
      index. Written from what is genuinely different about a wedding in each
      city; a test fails the build if any two drift above 25% similarity.
- [x] **`/rental-jewellery-trichy`** — the jewellery city page. Six of the
      site's target queries are Trichy-qualified jewellery searches
      ("rental jewellery Trichy", "bridal jewellery sets for rent in Trichy")
      and nothing answered them: the hub never says Trichy in its title, h1 or
      description, and the four room pages are about metal, not about a city.
      It is the showroom to the hub's directory — the whole catalogue on one
      URL, then what a Trichy muhurtham asks of a set, how it works, and seven
      FAQs. No price, no deposit, no hold period: see **Yours** below.

### Internal linking
- [x] Every city named on the site links to its page — the footer on every
      page, and `/about`.
- [x] City pages link laterally to each other, so none is an orphan.
- [x] Service pages link to the archive and to each other.
- [x] Journal posts link to services, collections, city pages and the
      jewellery **from inside the prose**. Article bodies could not carry a
      link at all before — every post reached the rest of the site only
      through a breadcrumb, three related articles and a Contact button.
      `ArticleBody` now renders `[text](/path)`, with the href whitelisted to
      a site-relative path or an https URL so a future CMS still cannot inject
      script through one.
- [x] All four city pages link to the jewellery; Trichy to its own city page,
      the other three to the catalogue. (There is no Chennai jewellery page,
      and inventing one would be a doorway.)
- [x] `/journal/temple-jewellery-or-american-diamond` — the first article
      behind the jewellery page. Three more are briefed in
      `docs/journal-briefs.md`.

---

## The URL map

Changed on the move to exact-match city URLs. Every left-hand URL returns a
**308** to its right-hand one, built in `next.config.ts` from the same slug
list the pages are built from — `src/content/location-slugs.ts` — so the live
URL and the redirect that feeds it cannot drift apart.

| Old | New |
|---|---|
| `/locations/trichy` | `/bridal-makeup-trichy` |
| `/locations/chennai` | `/bridal-makeup-chennai` |
| `/locations/pudukkottai` | `/bridal-makeup-pudukkottai` |
| `/locations/madurai` | `/bridal-makeup-madurai` |
| `/locations` | **unchanged** — still the hub |

New, with no predecessor:

| URL | Answers |
|---|---|
| `/rental-jewellery-trichy` | rental jewellery Trichy · bridal jewellery rental Trichy · bridal jewellery sets for rent in Trichy · wedding jewellery rental Trichy · bridal jewellery on rent in Trichy |
| `/journal/temple-jewellery-or-american-diamond` | temple jewellery vs American diamond · matching bridal jewellery to a Kanchipuram silk |

**Why the rename was worth doing now and not later.** The URL is the one line
of a search result rendered verbatim under the title, and a path that repeats
the query reads as an answer to it. The ranking signal is small; the
click-through difference is not. The cost of moving a URL rises every week it
stays indexed, and these had been live for days.

⚠ **After deploying:** in Search Console, submit the sitemap again and use URL
Inspection on the five new URLs. Do not delete the old ones from anything —
the redirects are what move the index entry, and they must stay permanently.

---

## Yours

These are ordered by how much difference they make.

### 1. Google Business Profile — the single biggest win
Nothing on this site can compete with a verified Business Profile for
"bridal makeup artist near me". It is free and it takes an afternoon.

- [ ] Create or claim the profile at business.google.com.
- [ ] Category: **Makeup Artist**. Secondary: **Bridal Shop** or **Beauty
      Salon** as fits.
- [ ] Service area: Trichy, Chennai, Pudukkottai, Madurai — the same four the
      site says, or the site and the profile will contradict each other.
- [ ] **Hide the street address** unless you want brides arriving at it. A
      service-area business may show the area without the address.
- [ ] Website: `https://lanas.in`.
- [ ] Phone: the same number the site publishes.
- [ ] Photographs: 15–20 of the real work. The profile ranks partly on this.
- [ ] Verification arrives by postcard or video. Until it completes, the
      profile does not rank.

⚠ **The name, address and phone must match the site exactly.** Inconsistent
NAP across the web is the most common reason a local business under-ranks.

### 2. Google Search Console
- [ ] Add `lanas.in` as a **domain property** (DNS verification), not a URL
      prefix — a domain property covers both http/https and www.
- [ ] Submit `https://lanas.in/sitemap.xml`.
- [ ] Request indexing for the homepage, the four `/bridal-makeup-<city>`
      pages and `/rental-jewellery-trichy`.
- [ ] Check Coverage after a week. Anything "Discovered — not indexed" for
      more than a fortnight needs an internal link, not a resubmission.

### 3. Analytics
- [ ] The site already pushes to `dataLayer` and calls `gtag` — every event is
      defined in `src/lib/analytics.ts`. **Nothing is loaded yet**: add a
      GA4 or GTM container and the events start arriving with no code change.
- [ ] Mark `booking_complete` and `whatsapp_click` as conversions.
- [ ] The events worth watching first: `booking_start` → `booking_complete`
      (where brides drop out of the enquiry) and `whatsapp_click` by
      `placement` (which of the six places actually gets used).

### 4. Facts the site is currently silent about
Each of these is gated behind a flag or a variable and renders **nothing**
until supplied. Every one of them is also a ranking and conversion input.

- [ ] **A credential line for `/about`** — years working, brides, training,
      with the awarding body. One factual sentence. `src/content/trust.ts`
      has five more signals switched off waiting for real answers: experience,
      brides, hygiene practice, products, training.
- [ ] **The `⟨confirm⟩` FAQ answers** in `src/content/faq.ts` — travel radius
      and charges, typical durations, whether draping is included, trial
      availability and where, the advance amount, the rescheduling policy.
      These render as nothing today. They are also, word for word, what
      brides search for.
- [x] ~~**Reply time.**~~ "within 24 hours" is live on the contact page and on
      the last screen of the enquiry, from `siteSettings.replyTime`. **It has
      to be true** — set it to `""` and both places stop saying it rather than
      softening it. A missed soft promise is worse than no promise.
- [ ] **Rental terms.** `/rental-jewellery-trichy` is the site's second
      commercial landing page and it currently cannot answer the question a
      bride arrives with. Needed: rental price bands, the deposit, how long a
      set is held against a date, whether the collection can be seen in person
      in Trichy and where, and whether sets travel to the other three cities
      or are collected. Every one of those is written as "confirmed directly"
      today, which is true but converts worse than an answer. They are also
      what unblocks the three briefed jewellery articles.
- [ ] **Testimonials.** `src/content/testimonials.ts` renders only what is
      published. Real, attributed, with permission — never invented. Review
      schema is deliberately not emitted until there are real reviews.

### 5. Off-site
- [ ] Instagram bio → `lanas.in`. Most of this site's traffic will come from
      there, and the link is the only thing connecting the two entities.
- [ ] Consistent NAP on any wedding directory listings (WedMeGood, ShaadiSaga
      and similar). Same name, same number, same site.
- [ ] Ask photographers you have worked with for a credit link. A link from a
      Tamil Nadu wedding photographer is worth more than fifty directory
      listings.

---

## First month

| When | Do |
|---|---|
| Launch day | Search Console domain property, submit sitemap, request indexing for the four `/bridal-makeup-<city>` URLs and `/rental-jewellery-trichy` |
| Launch day | Confirm in Search Console that the four `/locations/<city>` URLs report as redirected, not as errors |
| Day 1 | Google Business Profile created, verification requested |
| Week 1 | GA4 or GTM installed; conversions marked |
| Week 2 | Search Console Coverage — chase anything not indexed |
| Week 2 | Answer the `⟨confirm⟩` FAQ items; they are the cheapest content win available |
| Week 3 | First new journal post from `docs/journal-briefs.md`, Priority 1 |
| Week 4 | Search Console **Queries** report — what people actually typed. That, not a keyword tool, decides what gets written next. |

---

## How to check nothing has regressed

```
npx playwright test        # 94 tests, desktop and mobile
```

The SEO-specific ones:

- every city page names its city in the title, the `h1` and the schema
- the four city pages are not one template four times (8-gram similarity < 25%)
- every city the site claims has a page, linked from the footer of every page
- the sitemap lists all five location URLs, and the jewellery city page
- every retired `/locations/<city>` URL returns a 308 to its new address, and
  `/locations` itself still returns 200
- the jewellery city page names Trichy in its title, h1 and schema, emits no
  second business record, and quotes no price
- every journal post links out from inside its own prose, and no post renders
  an href that is not a path or an https URL
- no city page contains a price, a bride count, a years claim, a superlative,
  or a stray `TODO`
- no page 404s that used to exist
- no page scrolls horizontally at 390px
- every control is ≥44px; all text ≥4.5:1

---

## The one rule

**Never invent a business fact to fill a page.** A bride who finds one
invented number stops believing the other five, and a page that ranks on a
false claim converts worse than a page that ranks lower on a true one.

Everything on this site that could not be verified is switched off rather than
guessed. Keep it that way.
