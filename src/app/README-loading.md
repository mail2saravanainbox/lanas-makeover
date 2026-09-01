# Why there is no root `loading.tsx`

A `loading.tsx` creates a streaming Suspense boundary for its segment **and all
of its children**. Once Next starts streaming, the HTTP status is already
committed as `200` — so a child route that later calls `notFound()` returns
**200 with the not-found UI**, a classic soft-404.

That silently made every unpublished bride story, and every non-existent
portfolio or journal slug, return `200 OK` to crawlers.

Instead:

* `dynamicParams = false` on the enumerable detail routes (`brides/[slug]`,
  `journal/[slug]`, `services/[slug]`) — unknown slugs 404 statically, before
  any rendering happens.
* `portfolio/[slug]` keeps dynamic params, because an Instagram sync can add
  items at runtime, and returns a real 404 with no streaming boundary above it.
* `error.tsx` and `global-error.tsx` stay — they do not affect status codes.

If you add a `loading.tsx`, put it only on a segment with no `notFound()`
descendants, and re-check the status codes afterwards.
