# Presentation comp — branch `comp`

A build of the site carrying stand-in photography, for showing a client what
the design does once it has images. **It is not the website.**

## Running it

```bash
git checkout comp
# drop your presentation imagery into content/comp/  (see that folder's README
# for which filename prefix lands in which slot)
npm run comp:import
npm run dev
```

`comp:import` runs the real import pipeline against `content/comp/` — the same
prefix rules, the same WebP and thumbnail generation, the same blur
placeholders. That is deliberate: a comp that special-cases its imagery is not
showing the client anything true about how their own photographs will behave.

## What makes it safe

| | |
|---|---|
| A fixed banner on every page | "Presentation comp — stand-in imagery, not Lana's work or her clients." Undismissable. |
| Every route `noindex, nofollow` | `pageMetadata` ignores its own `noIndex` argument here; nothing in this build is indexable. |
| `robots.txt` disallows everything | Not just `/admin` and `/api` — the whole site. |
| Source images gitignored | `content/comp/*` never enters the repository. The DERIVED WebPs in `public/portfolio/` must be committed — Vercel builds from git and has to serve them. |

The per-image "Placeholder" badges are off in a comp — a client needs to see
the design carrying photography — so the banner replaces them as the statement
that the imagery is not Lana's.

## The one rule with no technical guard

**Never alias this build to the production domain.** Deploy it as a Vercel
*preview* only:

```bash
vercel deploy          # preview URL — correct
vercel deploy --prod   # NEVER on this branch
```

That is the reason this lives on its own branch rather than behind an
environment variable: a flag can be set in production by accident, a branch has
to be deliberately deployed.

## Never merge this branch

`comp` must not merge into `main` or `redesign`. It carries a banner, a
site-wide noindex, and a robots.txt that hides everything — all of which are
correct for a pitch and catastrophic for the real site.

When Lana's own photographs exist, they go in `content/incoming/` on
`redesign`, and this branch is deleted.
