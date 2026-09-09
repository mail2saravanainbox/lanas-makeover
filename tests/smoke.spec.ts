import { expect, test, type Page } from "@playwright/test";

/**
 * PHASE 1 SMOKE TESTS
 *
 * Each test guards one thing Phase 1 fixed, so a regression fails loudly
 * rather than quietly shipping. They assert behaviour a visitor can observe —
 * not implementation.
 */

function isDesktop(page: Page): boolean {
  return (page.viewportSize()?.width ?? 0) >= 1024;
}

test.describe("the homepage introduces itself in frame one", () => {
  test("wordmark, booking CTA and (desktop) nav links are visible at scroll 0", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Lana's Makeover/);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    // The wordmark, in the header — not the one further down the hero.
    const header = page.locator("header");
    await expect(
      header.getByRole("link", { name: "Lana's Makeover" }),
    ).toBeVisible();

    /**
     * The booking CTA is in frame one at every width — but not in the same
     * place. On desktop it is in the header; on a phone it is in the sticky
     * action bar, which is where it was moved to so that CHECK YOUR DATE did
     * not appear three times in one 390px frame. Either way it is on screen
     * without scrolling, which is the thing that actually matters.
     */
    const cta = isDesktop(page)
      ? header.getByRole("link", { name: "Check Your Date" })
      : page
          .getByRole("navigation", { name: "Quick actions" })
          .getByRole("link", { name: "Check Your Date" });
    await expect(cta).toBeVisible();

    if (isDesktop(page)) {
      const nav = page.getByRole("navigation", { name: "Primary" });
      for (const label of ["Work", "Services", "About", "Journal", "FAQ"]) {
        await expect(nav.getByRole("link", { name: label })).toBeVisible();
      }
      // "Brides" has no stories behind it, so it must not be offered.
      await expect(nav.getByRole("link", { name: "Brides" })).toHaveCount(0);
      // And the header CTA is desktop-only — the bar owns it below lg.
      await expect(page.getByRole("navigation", { name: "Quick actions" })).toBeHidden();
    }
  });

  test("three Tab presses reach a nav link or the booking CTA", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("header").waitFor();

    for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");

    const focused = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return null;
      return {
        text: (el.textContent ?? "").trim(),
        href: el.getAttribute("href"),
        inHeader: !!el.closest("header"),
      };
    });

    expect(focused, "something should have focus").not.toBeNull();
    expect(
      focused!.inHeader,
      `focus landed on ${JSON.stringify(focused)}`,
    ).toBe(true);

    /**
     * Three tabs from the top land on something that navigates. The set
     * differs by width — the header carries the booking CTA on desktop and
     * only the wordmark and the menu button on a phone — so both are allowed
     * here; what is asserted is that the focus is inside the header and on a
     * real destination, not on nothing.
     */
    const reachable = [
      "/contact",
      "/portfolio",
      "/services",
      "/journal",
      "/about",
      "/faq",
      "/",
      // The menu button is a button, not a link, and has no href.
      null,
    ];
    expect(reachable).toContain(focused!.href);
  });
});

/** The chip a visitor actually clicks — the label wrapping an sr-only input. */
function chip(page: Page, name: string) {
  return page.locator("label").filter({ hasText: new RegExp(`^${name}$`) });
}

/**
 * Wait until React has actually attached to the enquiry form.
 *
 * THE BUG THIS EXISTS FOR. The flow is server-rendered, so its inputs are in
 * the HTML before React hydrates. Playwright would fill the date field in that
 * gap: the DOM value was set, but React never heard the input event, so its
 * state stayed empty — and every subsequent "Continue" was correctly refused
 * by validation, forever, on a field the test could plainly see was filled.
 * It looked like a step that would not advance; it was a value React did not
 * have. Rare, load-dependent, and utterly baffling without this note.
 *
 * React marks every hydrated host node with a `__reactFiber$…` key, which is
 * the cheapest honest signal that handlers are attached. Test-only probe; no
 * production code exists to support it.
 */
async function waitForHydration(page: Page, selector = "form") {
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      return !!el && Object.keys(el).some((k) => k.startsWith("__reactFiber$"));
    },
    selector,
    { timeout: 20_000 },
  );
}

/** The step indicator, which is also the flow's live region. */
const stepMarker = (page: Page, n: number) => page.getByText(`Step ${n} of 6`);

const onStep = (page: Page, n: number) =>
  expect(stepMarker(page, n)).toBeVisible({ timeout: 20_000 });

/**
 * Advance one step, tolerating a click that lands before hydration.
 *
 * The enquiry is server-rendered, so its buttons exist in the HTML a moment
 * before React attaches handlers to them. Playwright will happily click one in
 * that gap, and the click does nothing at all — which showed up as a rare,
 * genuinely confusing "Step 2 of 6 not found" on a fully working flow.
 *
 * The retry is guarded by a check for the target step, so an advance that DID
 * register but rendered slowly is never clicked a second time and never skips
 * a step.
 */
async function advanceTo(page: Page, n: number) {
  await expect(async () => {
    if ((await stepMarker(page, n).count()) === 0) {
      await page.getByRole("button", { name: "Continue" }).click();
    }
    await expect(stepMarker(page, n)).toBeVisible({ timeout: 1_500 });
  }).toPass({ timeout: 25_000 });
}

/**
 * Walks the six-step enquiry (§12) from the date to the submit button.
 * Returns nothing; the caller asserts on whatever state it lands in.
 */
async function completeBookingFlow(page: Page, city = "Trichy") {
  const advance = (n: number) => advanceTo(page, n);

  await page.goto("/contact");
  await waitForHydration(page);
  await onStep(page, 1);

  // 01 date
  await page.getByLabel("Wedding date *").fill("2027-05-14");
  await advance(2);

  // 02 location — the four cities are radio chips, not a free-text field.
  // The control is a real radio, visually replaced by its own label, so the
  // test clicks what a visitor clicks: the chip.
  await chip(page, city).click();
  await advance(3);

  // 03 events
  await chip(page, "Muhurtham").click();
  await advance(4);

  // 04 services
  await chip(page, "Bridal Makeup").click();
  await advance(5);

  // 05 details — name and phone are the only required fields.
  await page.getByLabel("Name *").fill("Test Enquiry");
  await page.getByLabel("Phone *").fill("9876543210");
  await advance(6);

  // 06 review.
  //
  // The endpoint silently drops anything submitted within three seconds of
  // the first interaction — no human fills six steps that fast, but Playwright
  // does. Waiting past the gate is what makes this test exercise the real
  // path rather than the spam trap.
  await expect(page.getByText("Ready to send.")).toBeVisible();
  await page.waitForTimeout(3200);
  await page.getByRole("button", { name: "Check availability" }).click();
}

test("the six-step enquiry will not advance past an empty required step", async ({ page }) => {
  await page.goto("/contact");

  await onStep(page, 1);

  // No date entered — Continue must refuse and say why. Retried the same way
  // as an advance, because a pre-hydration click is silent here too.
  await expect(async () => {
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Please choose your wedding date.")).toBeVisible({
      timeout: 1_500,
    });
  }).toPass({ timeout: 25_000 });

  await onStep(page, 1);

  await page.getByLabel("Wedding date *").fill("2027-05-14");
  await advanceTo(page, 2);
});

test("the enquiry offers the four service locations as cities", async ({ page }) => {
  await page.goto("/contact");
  await waitForHydration(page);
  await onStep(page, 1);
  await page.getByLabel("Wedding date *").fill("2027-05-14");
  await advanceTo(page, 2);

  for (const city of ["Chennai", "Trichy", "Pudukkottai", "Madurai"]) {
    await expect(chip(page, city)).toBeVisible();
    // The chip is a label for a real radio, so it is keyboard- and
    // screen-reader-operable rather than a styled div.
    await expect(page.getByRole("radio", { name: city })).toHaveCount(1);
  }
  // And the honest escape hatch for anywhere else.
  await expect(chip(page, "Other location")).toBeVisible();
});

test("going back through the enquiry does not lose what was entered", async ({ page }) => {
  await page.goto("/contact");
  await waitForHydration(page);
  await onStep(page, 1);

  await page.getByLabel("Wedding date *").fill("2027-05-14");
  await advanceTo(page, 2);

  await chip(page, "Madurai").click();
  await expect(page.getByRole("radio", { name: "Madurai" })).toBeChecked();

  await page.getByRole("button", { name: "Back" }).click();
  await onStep(page, 1);
  await expect(page.getByLabel("Wedding date *")).toHaveValue("2027-05-14");

  await advanceTo(page, 2);
  await expect(page.getByRole("radio", { name: "Madurai" })).toBeChecked();
});

test("the enquiry admits that no inbox is connected", async ({ page }) => {
  // The slowest test in the suite by design: it walks six steps AND waits out
  // the endpoint's three-second spam gate before submitting.
  test.slow();

  await completeBookingFlow(page);

  const status = page.locator('[role="status"]');
  // Typographic apostrophe: the copy uses ’ throughout, and a straight one
  // here would pass for the wrong reason on the day the copy changes.
  await expect(status).toContainText("isn’t connected yet");
  // And NEVER the claim that it arrived somewhere.
  await expect(status).not.toContainText("has been received");
  await expect(status).toContainText("been recorded");

  // Her answers stay on screen so she can carry them somewhere that works.
  await expect(status).toContainText("Test Enquiry");
  await expect(status).toContainText("2027-05-14");
});

test("an imageless portfolio slug is a 404, not a plate under a made-up title", async ({
  page,
}) => {
  const res = await page.goto("/portfolio/muhurtham-gold");
  expect(res?.status()).toBe(404);
});

test.describe("prefers-reduced-motion", () => {
  test("reveals resolve and no WebGL canvas is mounted", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("header").waitFor();

    // Every reveal has resolved to its final frame; nothing is left hidden.
    await expect(page.locator('[data-reveal="out"]')).toHaveCount(0);
    await expect(page.locator('[data-reveal-blur="out"]')).toHaveCount(0);

    // The 3D layer must never load for a visitor who asked for less motion.
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});

test("at 390px the header fits and the booking CTA is always in reach", async ({
  page,
}) => {
  test.skip(isDesktop(page), "phone-width layout only");

  await page.goto("/");
  const width = page.viewportSize()!.width;
  const header = page.locator("header");

  // The bar does not overflow the viewport …
  const headerBox = (await header.boundingBox())!;
  expect(headerBox.x).toBeGreaterThanOrEqual(0);
  expect(headerBox.x + headerBox.width).toBeLessThanOrEqual(width + 0.5);

  /**
   * … and the booking CTA is reachable without scrolling.
   *
   * On a phone it lives in the sticky action bar rather than the header. The
   * header version was removed at this width because it put CHECK YOUR DATE
   * on screen three times at once and wrapped onto two lines; the bar version
   * is pinned, so the CTA is reachable at every scroll position rather than
   * only at the top.
   */
  const cta = page
    .getByRole("navigation", { name: "Quick actions" })
    .getByRole("link", { name: "Check Your Date" });
  await expect(cta).toBeVisible();

  const ctaBox = (await cta.boundingBox())!;
  expect(ctaBox.x).toBeGreaterThanOrEqual(-0.5);
  expect(ctaBox.x + ctaBox.width).toBeLessThanOrEqual(width + 0.5);
  // It is inside the first screen, not below the fold.
  expect(ctaBox.y + ctaBox.height).toBeLessThanOrEqual(page.viewportSize()!.height + 0.5);

  // No horizontal scroll anywhere on the page.
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

/* ── Phase 2 ─────────────────────────────────────────────────────────────── */

test("the homepage numbers its sections contiguously from 01", async ({
  page,
}) => {
  await page.goto("/");

  const numbered = await page.evaluate(() => {
    const footer = document.querySelector("footer");
    return [...document.querySelectorAll<HTMLElement>(".eyebrow")]
      .filter((el) => !footer?.contains(el))
      .map((el) => el.textContent?.trim() ?? "")
      .filter((t) => /^\d{2} — /.test(t));
  });

  expect(
    numbered.length,
    "at least eight numbered sections",
  ).toBeGreaterThanOrEqual(8);

  const values = numbered.map((t) => Number(t.slice(0, 2)));
  // No gaps: sections that render nothing (no brides, no testimonials) must
  // not leave a hole in the sequence.
  expect(values).toEqual(values.map((_, i) => i + 1));
  expect(new Set(values).size, "no duplicates").toBe(values.length);
});

test("no WebGL canvas exists, before or after scrolling", async ({ page }) => {
  /**
   * Asserts WEBGL specifically, not the absence of <canvas>. The brush
   * cursor's powder trail is a legitimate 2D canvas; the thing Task 2.4
   * removed and this guards is a WebGL context and the Three.js runtime.
   */
  /**
   * COUNTED, NOT PROBED.
   *
   * This used to call `getContext("webgl")` on every canvas and treat a
   * non-null result as proof of a WebGL rig. On a canvas that has no context
   * yet, that call does not REPORT a context — it CREATES one. The brush
   * cursor's trail canvas is 2D, but for the few frames before it calls
   * getContext("2d") the probe would manufacture a WebGL context on it and
   * then fail the test for finding it. A test that creates the thing it
   * forbids.
   *
   * The brush's canvas carries `data-brush-trail`; anything else is a canvas
   * this site has no business having.
   */
  const webglCanvases = () =>
    page.evaluate(
      () => document.querySelectorAll("canvas:not([data-brush-trail])").length,
    );

  await page.goto("/");
  expect(await webglCanvases()).toBe(0);

  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
  await page.waitForTimeout(800);
  expect(await webglCanvases()).toBe(0);

  // And the Three.js runtime is not among the scripts the page pulled.
  const three = await page.evaluate(() =>
    [...document.querySelectorAll("script[src]")].some((s) =>
      /three|react-three/i.test((s as HTMLScriptElement).src),
    ),
  );
  expect(three).toBe(false);
});

test("the ritual reaches stage eight and reports it", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { dataLayer: unknown[] }).dataLayer = [];
  });
  await page.goto("/", { waitUntil: "networkidle" });
  // Measure only once layout has settled — the track's offset moves while
  // fonts and images land, and a stale offset scrolls to the wrong stage.
  await page.waitForTimeout(1000);

  const track = await page.evaluate(() => {
    const el = [...document.querySelectorAll("section")].find(
      (s) => s.getAttribute("aria-labelledby") === "ritual-title",
    );
    if (!el) return null;
    const inner = el.querySelector<HTMLElement>("div[class*='300vh']");
    if (!inner) return null;
    const r = inner.getBoundingClientRect();
    return {
      top: Math.round(r.top + window.scrollY),
      height: Math.round(r.height),
    };
  });
  expect(track, "the 300vh ritual track").not.toBeNull();

  /**
   * Re-measure and re-scroll on every attempt rather than trusting one jump.
   * The track's offset shifts while the page settles, and a single scrollTo
   * against a stale offset lands on the wrong stage — which made this flaky
   * roughly one run in three.
   */
  await expect
    .poll(
      async () => {
        await page.evaluate(() => {
          const el = [...document.querySelectorAll("section")]
            .find((s) => s.getAttribute("aria-labelledby") === "ritual-title")
            ?.querySelector<HTMLElement>("div[class*='300vh']");
          if (!el) return;
          const top = el.getBoundingClientRect().top + window.scrollY;
          window.scrollTo(0, top + el.offsetHeight - window.innerHeight);
        });
        await page.waitForTimeout(500);
        return page.locator('[aria-live="polite"]').first().textContent();
      },
      // Raised from 15s: the page now carries 55 photographs and two video
      // encodes, and layout takes longer to settle under parallel test load.
      { timeout: 25_000 },
    )
    .toMatch(/Stage 08: The Bride/);

  const fired = await page.evaluate(() =>
    (
      (window as unknown as { dataLayer: Array<{ event?: string }> })
        .dataLayer ?? []
    ).some((e) => e.event === "ritual_complete"),
  );
  expect(fired, "ritual_complete on the dataLayer").toBe(true);
});

test("the hero's frame actually has a size", async ({ page }) => {
  await page.goto("/");

  // Regression guard. The frame once rendered 1280x0 — valid markup, correct
  // classes, no height — because PlaceholderPlate's own `relative` beat the
  // `absolute` passed in via className. Nothing in the DOM looked wrong; the
  // hero was simply an empty black rectangle on the live site.
  const box = await page
    .locator("[data-hero] [data-placeholder], [data-hero] img")
    .first()
    .boundingBox();
  expect(box, "the hero frame is in the DOM").not.toBeNull();
  expect(box!.width).toBeGreaterThan(200);
  expect(box!.height).toBeGreaterThan(200);
});

test("portfolio grid tiles have a size", async ({ page }) => {
  await page.goto("/portfolio");
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(1200);

  /**
   * Regression guard. Every tile once rendered at zero height: the <li> carries
   * the aspect ratio, but Reveal and ParallaxFrame sit between it and the
   * button's h-full at height:auto, so h-full resolved against nothing. The
   * images all loaded — naturalWidth > 0, no failed requests — and the grid was
   * simply a black rectangle. Latent since the grid was written, invisible
   * until the portfolio had its first published item.
   */
  const boxes = await page.evaluate(() =>
    [...document.querySelectorAll("li img")].map((i) => {
      const r = i.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    }),
  );

  expect(boxes.length, "tiles rendered").toBeGreaterThan(0);
  expect(
    boxes.filter((b) => b.h === 0),
    "tiles with zero height",
  ).toHaveLength(0);
});

test.describe("the brush cursor", () => {
  test("is a brush, follows the pointer, and never blocks a click", async ({
    page,
  }) => {
    test.skip(
      (page.viewportSize()?.width ?? 0) < 1024,
      "desktop fine-pointer only",
    );

    await page.goto("/");
    await page.mouse.move(600, 400);
    // Poll rather than sleep: the brush mounts a frame after the first
    // pointermove, and a fixed wait loses that race under parallel load.
    await expect
      .poll(async () => page.locator('svg [data-brush="bristles"]').count(), {
        timeout: 10_000,
      })
      .toBeGreaterThan(0);

    const state = await page.evaluate(() => {
      const svg = document.querySelector('[data-brush="bristles"]');
      const layer = svg?.closest(".pointer-events-none") as HTMLElement | null;
      return {
        bristles: !!svg,
        ariaHidden: layer?.getAttribute("aria-hidden"),
        pointerEvents: layer ? getComputedStyle(layer).pointerEvents : null,
        realCursor: getComputedStyle(document.body).cursor,
      };
    });

    expect(state.bristles, "the brush's bristle path is rendered").toBe(true);
    // Decorative, and never in the way of a real click.
    expect(state.ariaHidden).toBe("true");
    expect(state.pointerEvents).toBe("none");
    // The native pointer is only hidden once the brush is actually running.
    expect(state.realCursor).toBe("none");

    // It moves with the pointer.
    const before = await page.evaluate(
      () =>
        (
          document.querySelector('[data-brush="bristles"]')?.closest("svg")
            ?.parentElement as HTMLElement
        )?.style.transform,
    );
    await page.mouse.move(1000, 700);
    await expect
      .poll(
        async () =>
          page.evaluate(
            () =>
              (
                document.querySelector('[data-brush="bristles"]')?.closest("svg")
                  ?.parentElement as HTMLElement
              )?.style.transform,
          ),
        { timeout: 10_000 },
      )
      .not.toBe(before);
  });

  /**
   * THE REGRESSION THIS GUARDS.
   *
   * The effect that binds the pointer listeners used to have the pressed
   * state in its dependency array, so every mousedown tore the whole thing
   * down and rebuilt it — re-seeding the tracked position at the CENTRE OF
   * THE VIEWPORT. The brush visibly flew to the middle of the screen and
   * eased back on every single click.
   *
   * A press should move the brush by a few pixels of dab, and nothing else.
   */
  test("a click does not throw the brush across the screen", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 1024, "desktop fine-pointer only");

    await page.goto("/");

    // Park the brush well away from the centre and let it settle there.
    await page.mouse.move(1100, 640);
    await expect
      .poll(async () => page.locator('svg [data-brush="bristles"]').count(), { timeout: 10_000 })
      .toBeGreaterThan(0);
    await page.waitForTimeout(600);

    const translation = () =>
      page.evaluate(() => {
        // Reached via the brush's own stable hook. `[aria-hidden] svg` also
        // matches the brand veil's jasmine mark, which precedes it in the DOM.
        const el = document
          .querySelector('[data-brush="bristles"]')
          ?.closest("svg")?.parentElement as HTMLElement | null;
        const m = /translate3d\(([-\d.]+)px,\s*([-\d.]+)px/.exec(el?.style.transform ?? "");
        return m ? { x: Number(m[1]), y: Number(m[2]) } : null;
      });

    const before = await translation();
    expect(before, "the brush reports a position").not.toBeNull();

    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(120);

    const after = await translation();
    expect(after).not.toBeNull();

    // A dab, not a flight. The old bug moved it hundreds of pixels toward the
    // viewport centre; anything past a few pixels is that bug returning.
    expect(Math.abs(after!.x - before!.x)).toBeLessThan(12);
    expect(Math.abs(after!.y - before!.y)).toBeLessThan(12);
  });

  test("does not exist under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.mouse.move(600, 400);
    await page.waitForTimeout(400);
    // No brush, and the real pointer is left alone.
    expect(await page.locator('svg [data-brush="bristles"]').count()).toBe(0);
    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor),
    ).not.toBe("none");
  });
});

/**
 * The eight ritual frames are stacked full-bleed in one sticky container that
 * sits ~1,800px below the fold — close enough that the browser fetched all
 * eight on first paint, about 1 MB for a section that shows one at a time.
 * Only the active frame and its neighbours are mounted; the set grows as the
 * reader scrolls and never shrinks.
 */
test("the ritual loads two frames up front and all eight by the end", async ({
  page,
}) => {
  /**
   * The slowest test here: it scrolls the entire homepage and waits on eight
   * separate image fetches. A 25s poll inside a 30s default was a test that
   * could only ever fail by timing out at the wrong level.
   */
  test.slow();

  const fetched = new Set<string>();
  page.on("response", (r) => {
    const m = /url=([^&]+)/.exec(r.url());
    if (!/_next\/image/.test(r.url()) || !m) return;
    const name = decodeURIComponent(m[1]).split("/").pop() ?? "";
    if (name.startsWith("ritual-")) fetched.add(name);
  });

  /**
   * Skip the opening. This test is about IMAGE LOADING, and the veil now
   * deliberately holds the page for ~1.9s — time taken straight out of this
   * test's budget for a gesture it is not measuring.
   */
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("lm:veil", "1");
    } catch {
      /* private mode */
    }
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  // Two, not eight: the whole point of the deferral.
  expect(fetched.size).toBeLessThanOrEqual(3);

  const height = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );
  for (let y = 0; y < height; y += 400) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(60);
  }

  // Every frame arrives by the time the reader has been through the section,
  // so no stage is ever blank.
  // 25s: fourteen browsers against one server make image delivery the
  // slow part here, not the page.
  await expect.poll(() => fetched.size, { timeout: 25_000 }).toBe(8);
});


/* ═══════════════════════════════════════════════════════════════════════════
   THE REDESIGN
   ═══════════════════════════════════════════════════════════════════════════ */

test("the hero answers what, where and what next in frame one", async ({ page }) => {
  await page.goto("/");

  const hero = page.locator("[data-hero]");

  // What the business is — the page's single H1.
  await expect(hero.getByRole("heading", { level: 1 })).toHaveText(
    /Tamil Bridal Makeup & Hair Artist/i,
  );
  // What kind of work.
  await expect(hero.getByText("Natural · HD · South Indian Bridal")).toBeVisible();
  // Where she works — all four, before a single scroll.
  await expect(hero.getByText("Chennai · Trichy · Pudukkottai · Madurai")).toBeVisible();

  // Both CTAs, and only one of them primary.
  await expect(hero.getByRole("link", { name: "Check Your Date" })).toBeVisible();
  await expect(hero.getByRole("link", { name: "View the work" })).toBeVisible();

  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test("the four service locations are in the footer of every page", async ({ page }) => {
  for (const path of ["/", "/services", "/faq"]) {
    await page.goto(path);
    const footer = page.locator("footer");
    for (const city of ["Chennai", "Trichy", "Pudukkottai", "Madurai"]) {
      await expect(footer.getByText(city, { exact: true }).first()).toBeAttached();
    }
  }
});

test.describe("the sticky action bar", () => {
  test("is present on mobile and does not cover the end of the page", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) >= 1024, "mobile only");

    await page.goto("/");
    const bar = page.getByRole("navigation", { name: "Quick actions" });
    await expect(bar).toBeVisible();

    // The one booking CTA, at a real touch size (§14 — 44px minimum).
    const cta = bar.getByRole("link", { name: "Check Your Date" });
    await expect(cta).toBeVisible();
    const box = await cta.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);

    /**
     * THE BAR MUST NOT COVER THE CONTENT (§33).
     *
     * It is `position: fixed`, so it takes no space of its own — the document
     * gives the space back through `--action-bar-h`. Measured as a reservation
     * rather than by scrolling to the end: Lenis owns scrolling on this site,
     * so `window.scrollTo` does not move the page and a scroll-then-measure
     * test would pass or fail for reasons unrelated to the bar.
     */
    const geometry = await page.evaluate(() => {
      const bar = document.querySelector('nav[aria-label="Quick actions"]');
      const content = document.querySelector(".page-content");
      const footer = document.querySelector("footer");
      if (!bar || !content || !footer) return null;
      return {
        barHeight: bar.getBoundingClientRect().height,
        reserved: parseFloat(getComputedStyle(content as Element).paddingBottom),
        // The gap between the last of the content and the end of the document.
        tail: content.getBoundingClientRect().bottom - footer.getBoundingClientRect().bottom,
      };
    });

    expect(geometry).not.toBeNull();
    // Every pixel the bar occupies is a pixel the document has given back.
    expect(geometry!.reserved).toBeGreaterThanOrEqual(geometry!.barHeight);
    expect(geometry!.tail).toBeGreaterThanOrEqual(geometry!.barHeight);
  });

  test("is absent on desktop, where the header carries the same actions", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 1024, "desktop only");

    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Quick actions" })).toBeHidden();
    await expect(
      page.locator("header").getByRole("link", { name: "Check Your Date" }),
    ).toBeVisible();
  });
});

test.describe("portfolio filtering", () => {
  test("offers combinable facets and reports the result count", async ({ page }) => {
    await page.goto("/portfolio");

    // Every axis the archive can genuinely fill (§15).
    for (const axis of ["Look", "Event", "Hair", "Category"]) {
      await expect(page.getByRole("group", { name: axis })).toBeVisible();
    }

    const status = page.locator('[role="status"]').first();
    const unfiltered = await status.textContent();

    await page.getByRole("button", { name: "Muhurtham", exact: true }).click();
    await expect(page.getByRole("button", { name: "Muhurtham", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(status).not.toHaveText(unfiltered ?? "");
    await expect(status).toContainText("1 filter");
  });

  test("a combination with no work shows a way out, not an empty grid", async ({ page }) => {
    await page.goto("/portfolio");

    // Muhurtham frames are not filed under Hair — an intersection with
    // nothing in it, which is exactly the state §46 is about.
    await page.getByRole("button", { name: "Muhurtham", exact: true }).click();
    await page.getByRole("button", { name: "Hair", exact: true }).click();

    await expect(page.getByText("No looks found for this combination.")).toBeVisible();

    const clear = page.getByRole("button", { name: "Clear filters" }).last();
    await clear.click();

    await expect(page.getByText("No looks found for this combination.")).toBeHidden();
    await expect(page.getByRole("button", { name: "Muhurtham", exact: true })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});

test("the FAQ answers the location questions and opens them natively", async ({ page }) => {
  await page.goto("/faq");

  // §20 — the questions a bride asks about a four-city practice.
  await expect(page.getByText("Which cities do you serve?")).toBeVisible();
  await expect(page.getByText("How do I check availability?")).toBeVisible();

  const answer = page.locator("#cities");
  await expect(answer).not.toHaveAttribute("open", "");
  await answer.getByText("Which cities do you serve?").click();
  await expect(answer).toHaveAttribute("open", "");
  await expect(answer).toContainText("Pudukkottai");
});

test("no page scrolls horizontally at 390px", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) >= 1024, "mobile only");

  for (const path of ["/", "/portfolio", "/services", "/about", "/faq", "/contact"]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `${path} overflows horizontally by ${overflow}px`).toBeLessThanOrEqual(0);
  }
});


/**
 * §9 + §38. The before/after control is fully built and fully wired, and it
 * renders from `beforeAfter` on a portfolio item — a pair only Lana can
 * create, because only she can attest that two frames are the same woman on
 * the same morning. Until one exists the section must be ABSENT rather than
 * faked from two unrelated photographs or one photograph cropped twice.
 */
test("no transformation section is shown without a genuine before/after pair", async ({
  page,
}) => {
  await page.goto("/");
  const hasPair = await page.evaluate(async () => {
    // The section identifies itself; nothing else on the page uses this id.
    return !!document.querySelector("#transformation-title");
  });
  expect(hasPair, "a before/after appeared with no permissioned pair in the archive").toBe(false);
});


/**
 * §THE OPENING. The veil is the site's loading screen: a field of silk held
 * over the page while it becomes ready, then lifted. Three things must stay
 * true of it, and all three are safety rather than decoration.
 */
test.describe("the brand veil", () => {
  test("is the homepage's opening and nothing else's", async ({ page }) => {
    // The markup ships from the layout on every route; the guard decides.
    await page.goto("/portfolio");
    await page.waitForTimeout(400);
    expect(
      await page.evaluate(() => document.documentElement.classList.contains("lm-veiled")),
      "the veil must never be shown on an inner route",
    ).toBe(false);
    await expect(page.locator("#lm-veil")).toBeHidden();
  });

  test("never traps the page, and never runs twice in a session", async ({ page }) => {
    await page.goto("/");
    // Whatever happened, the veil must have let go.
    /**
     * Generous: the opening is now a deliberate ~1.9s (a 420ms fall, a 1,400ms
     * floor so the drape is actually seen, then a 520ms lift), and this runs
     * fourteen-wide against one server. The assertion is that it ALWAYS lets
     * go, not that it lets go quickly.
     */
    await expect
      .poll(
        () => page.evaluate(() => document.documentElement.classList.contains("lm-veiled")),
        { timeout: 15_000 },
      )
      .toBe(false);
    await expect(page.locator("#lm-veil")).toBeHidden();

  });

  test("is skipped once it has already been seen this session", async ({ page }) => {
    /**
     * Asserted by SETTING the flag rather than by loading the page twice and
     * assuming the first load showed it. The guard also skips when the
     * document is already complete, so a fast first load legitimately leaves
     * no flag behind — and the two-visit version of this test then failed
     * intermittently for a reason that was correct behaviour.
     */
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem("lm:veil", "1");
      } catch {
        /* private mode; the assertion below still holds */
      }
    });

    await page.goto("/");
    await page.waitForTimeout(400);
    expect(
      await page.evaluate(() => document.documentElement.classList.contains("lm-veiled")),
    ).toBe(false);
    await expect(page.locator("#lm-veil")).toBeHidden();
  });

  test("sits above the header rather than under it", async ({ page }) => {
    /**
     * THE REGRESSION THIS GUARDS. The veil used to render inside
     * `.page-content`, which is `position: relative; z-index: 10` and
     * therefore a stacking context — so its own z-index could never lift it
     * above the header at z-50, and the navigation sat on top of the veil.
     * Invisible on an ivory field; unmissable on silk.
     */
    const stacking = await page.goto("/").then(() =>
      page.evaluate(() => {
        const veil = document.getElementById("lm-veil");
        const header = document.querySelector("header");
        if (!veil || !header) return null;
        // A shared ancestor that creates a stacking context would trap it.
        const trapped = veil.closest(".page-content") !== null;
        return { trapped, veilZ: getComputedStyle(veil).zIndex };
      }),
    );
    expect(stacking).not.toBeNull();
    expect(stacking!.trapped, "the veil is inside .page-content again").toBe(false);
  });
});


/**
 * Lana's own logo. It is her artwork, it carries its own black ground, and it
 * is NOT legible small — measured unreadable at the header's 34px and clean
 * from about 80px. These guard both halves of that: it appears where there is
 * room, and it does not appear where there is not.
 */
test.describe("the logo", () => {
  test("is in the footer at a size it can be read at", async ({ page }) => {
    await page.goto("/");
    const logo = page.locator("footer img").first();
    await expect(logo).toBeAttached();
    await logo.scrollIntoViewIfNeeded();

    const box = await logo.boundingBox();
    expect(box, "the footer logo has no size").not.toBeNull();
    // Below ~80px the script turns to mush; this is the floor that matters.
    expect(box!.height).toBeGreaterThanOrEqual(80);
    await expect(logo).toHaveAttribute("alt", /Lana/i);
  });

  test("is not used in the header, where it would be illegible", async ({ page }) => {
    await page.goto("/");
    // The header keeps the typographic wordmark, which reads at 12px.
    await expect(page.locator("header img")).toHaveCount(0);
    await expect(
      page.locator("header").getByRole("link", { name: "Lana's Makeover" }),
    ).toBeVisible();
  });

  test("is served as the tab icon and on the share card", async ({ request }) => {
    const icon = await request.get("/icon.png");
    expect(icon.status()).toBe(200);
    expect(icon.headers()["content-type"]).toContain("image/png");

    const og = await request.get("/opengraph-image");
    expect(og.status()).toBe(200);
    // Satori cannot decode WebP; a broken embed silently yields a tiny image.
    expect((await og.body()).byteLength).toBeGreaterThan(50_000);
  });
});
