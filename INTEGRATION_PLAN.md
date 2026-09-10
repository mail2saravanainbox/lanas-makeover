# CMS + CRM + automation + SEO — discovery & plan

Phase 0 output. No source file modified. Inventory in `content-inventory.json`.

## 1. Repo map

| | |
|---|---|
| Framework | Next.js **16.3.3**, React 19.2.8, App Router, Turbopack |
| Hosting | **Vercel** — project `lanas-makeover`, live on `lanas.in`. Route Handlers, ISR and Cron all available. |
| Styling | Tailwind v4, single `@theme` token block in `globals.css` |
| Content | Hard-coded TypeScript in `src/content/*`, read through a **`ContentProvider` interface** (`src/lib/types.ts`, `src/lib/content/provider.ts`) with `local`, `cms` and `instagram` implementations already stubbed |
| Images | `next/image` via one `EditorialImage` component; 114 optimised WebPs in `public/portfolio` |
| SEO today | `sitemap.ts` ✓ · `robots.ts` ✓ (disallows `/admin`, `/api`) · **8 JSON-LD builders** ✓ · GA4/GTM env-gated and unset |
| Form today | 6-step `BookingFlow` → `/api/contact` → console log (always) + Resend + Vercel KV (both unset) · honeypot + 3s time-trap |
| Tests | Playwright, 62 tests, `desktop` 1280 / `mobile` 390 |

**The `ContentProvider` interface is the single most important finding.** Every component already consumes typed shapes rather than content files, and `src/lib/content/cms.ts` exists as a stub. A CMS migration therefore replaces **one provider**, not fifty components.

## 2. Content inventory (summary — full data in `content-inventory.json`)

| Type | Count | Migration note |
|---|---|---|
| Portfolio items | **55** (all published, all with alt, 54 with focal points) | **All 55 titles are filename-derived** — "Bts Ritual", "Editorial Hands Gold". Needs human titles. |
| Services | 6 | |
| FAQ items | 15 | 11 carry `⟨confirm⟩` markers awaiting real policy |
| Journal posts | 6 | |
| Collections | 9 | |
| Testimonials | **0** published | Nothing to migrate; blocks `Review`/`AggregateRating` schema |
| Bride stories | 3 defined, 0 published | |
| Timeline entries | 7 | "Her morning" |
| Trust signals | 10 defined, 4 published | |
| Routes | 20 | All must keep working |

## 3. ⛔ Blocking: every credential is UNKNOWN

| Phase | Needs | Status |
|---|---|---|
| 1 — Sanity | `SANITY_PROJECT_ID`, read + write tokens | **all UNKNOWN** |
| 2 — CRM | `BIGIN_CLIENT_ID/SECRET/REFRESH_TOKEN`, `N8N_WEBHOOK_SECRET`, `BREVO_API_KEY` | **all UNKNOWN** |
| 3 — Admin | Google OAuth client id/secret | not in INPUTS at all |
| 4 — SEO | `GA4_MEASUREMENT_ID`, `GSC_VERIFICATION_TOKEN`, `GOOGLE_REVIEW_URL`, `BASE_ADDRESS`, `BUSINESS_PHONE`, `OFFERS_JEWELLERY` | **all UNKNOWN** |

Supplied: `BUSINESS_EMAIL`, `BIGIN_DC=in`, `BIGIN_PIPELINE_NAME`, `N8N_BASE_URL`, `BREVO_SENDER_*`, `ADMIN_ALLOWED_EMAILS`. `WHATSAPP_NUMBER` is still the template placeholder `91XXXXXXXXXX`.

### What this means concretely

**Phase 1 cannot be completed and cannot be verified.** Without a project id there is no dataset to migrate into, so Rule 4 ("zero content loss, proven by a diff script") is unprovable and Rule 5 ("zero SEO regression") unverifiable. I can write schemas, Studio config and the provider — I cannot run the migration or confirm a single page still renders the same text.

**Phase 2 has no CRM to write to.** n8n workflows can be authored as JSON, but nothing can be imported, triggered or tested.

**Phase 3 needs a Google OAuth client**, which INPUTS does not include at all.

**Phase 4 is the exception.** Most of it needs no credentials.

## 4. Recommended order (differs from the brief — reason given)

**A. Finish the mobile audit first (Phases 2–6 of the previous brief).**
Phase 1 shipped; 2–6 did not. The homepage is still **24.5 screens with 8 visible CTAs**; `/services` has **12 CTAs**. That is live, measurable damage to the site's actual job. Building a CMS on top of layouts about to be rewritten means migrating content twice.

**B. Then Phase 4 SEO — the credential-free ~70%.** City landing pages, `Service`/`FAQPage`/`Breadcrumb` schema, internal linking, journal briefs, `docs/seo-launch-checklist.md`. This is the work that actually moves "bridal makeup artist in Trichy", and none of it is blocked.

**C. Then CMS/CRM, once credentials exist.** The `ContentProvider` seam makes this a contained change whenever you are ready.

## 5. Risks

1. **Free-tier ceilings.** Bigin free = 500 records / 1 pipeline / 3 automations. At ~50 enquiries/month the cap is reached in ~10 months, hence the archival workflow. Sanity free = 500k API requests/month — safe only with `useCdn: true` and ISR, never per-request fetching.
2. **Sanity as an enquiry store (brief §2.1) is the wrong tool.** Enquiries are PII and would sit in a dataset whose read token is on the website. **Vercel KV** is already coded against in `/api/contact` and is the right sink; the plan uses it.
3. **Migrating 55 filename titles** is a content-writing job, not a script. The rule-based conversion produces drafts that all need review.
4. **Thin city pages are a ranking risk, not a win.** The brief's own 120-word floor is right; nine pages seeded as drafts is nine pages of copy someone has to write.
5. **Rule 10 says never push or deploy**, which contradicts how this project has run all session. I will follow the brief unless told otherwise.

## 6. Blocking question

Which of A / B / C above should I do now? My recommendation is **A then B**, and C when credentials land.
