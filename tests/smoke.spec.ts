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

/**
 * Skip the opening.
 *
 * While the veil is up it sets `overflow: hidden` on the document, so a test
 * that scrolls does not move and anything gated on scroll position never
 * fires. Any test measuring scroll behaviour must call this first.
 */
async function skipVeil(page: Page) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("lm:veil", "1");
    } catch {
      /* private mode */
    }
  });
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
      // On a phone the header CTA was removed (it made three in one frame) and
      // the sticky bar deliberately stays down while the hero is on screen —
      // so the button in frame one is the hero's own.
      : page.locator("[data-hero]").getByRole("link", { name: "Check Your Date" });
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
     *
     * WhatsApp and Instagram joined the header when a real number was
     * configured, and on a phone the third tab lands on one of them. That is
     * a good place to land: both are primary channels for this business.
     */
    const internal = ["/contact", "/portfolio", "/services", "/journal", "/about", "/faq", "/"];
    const href = focused!.href;
    const ok =
      // The menu button is a button, not a link, and has no href.
      href === null ||
      internal.includes(href) ||
      href.startsWith("https://wa.me/") ||
      href.startsWith("https://www.instagram.com/");
    expect(ok, `focus landed on ${JSON.stringify(focused)}`).toBe(true);
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
const stepMarker = (page: Page, n: number) => page.getByText(`Step ${n} of 3`);

const onStep = (page: Page, n: number) =>
  expect(stepMarker(page, n)).toBeVisible({ timeout: 20_000 });

/**
 * Advance one step, tolerating a click that lands before hydration.
 *
 * The enquiry is server-rendered, so its buttons exist in the HTML a moment
 * before React attaches handlers to them. Playwright will happily click one in
 * that gap, and the click does nothing at all — which showed up as a rare,
 * genuinely confusing "Step 2 of 3 not found" on a fully working flow.
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
 * Walks the three-step enquiry (§12) from the date to the submit button.
 * Returns nothing; the caller asserts on whatever state it lands in.
 *
 * Six panels still exist and still own their own fields; they are grouped two
 * to a step. The date and the city are one question asked twice, and so are
 * "which events" and "what do you need" — pairing them halves the taps between
 * a bride and a sent enquiry without moving a single field name.
 */
async function completeBookingFlow(page: Page, city = "Trichy") {
  const advance = (n: number) => advanceTo(page, n);

  await page.goto("/contact");
  await waitForHydration(page);
  await onStep(page, 1);

  // 01 the wedding — date, then city. The four cities are radio chips, not a
  // free-text field: a real radio visually replaced by its own label, so the
  // test clicks what a visitor clicks.
  await page.getByLabel("Wedding date *").fill("2027-05-14");
  await chip(page, city).click();
  await advance(2);

  // 02 the day — events, then services.
  await chip(page, "Muhurtham").click();
  await chip(page, "Bridal Makeup").click();
  await advance(3);

  // 03 you — name and phone are the only required fields, and the review is
  // on this step rather than behind one more tap.
  //
  // The endpoint silently drops anything submitted within three seconds of
  // the first interaction — no human fills the form that fast, but Playwright
  // does. Waiting past the gate is what makes this test exercise the real
  // path rather than the spam trap.
  await page.getByLabel("Name *").fill("Test Enquiry");
  await page.getByLabel("Phone *").fill("9876543210");
  await expect(page.getByText("Ready to send.")).toBeVisible();
  await page.waitForTimeout(3200);
  await page.getByRole("button", { name: "Check availability" }).click();
}

test("the enquiry will not advance past an empty required step", async ({ page }) => {
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

  /**
   * The date is filled but the city is not, and both live on step one now.
   * One Continue guards two questions, so it must still refuse — and name the
   * one that is missing rather than the one that is already answered.
   */
  await page.getByLabel("Wedding date *").fill("2027-05-14");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Please choose the city, or")).toBeVisible();
  await expect(page.getByText("Please choose your wedding date.")).toHaveCount(0);
  await onStep(page, 1);

  await chip(page, "Trichy").click();
  await advanceTo(page, 2);
});

test("the enquiry offers the four service locations as cities", async ({ page }) => {
  await page.goto("/contact");
  await waitForHydration(page);
  // Step one, not step two: the city now sits under the date rather than
  // behind a tap of its own.
  await onStep(page, 1);

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
  await chip(page, "Madurai").click();
  await expect(page.getByRole("radio", { name: "Madurai" })).toBeChecked();
  await advanceTo(page, 2);

  await chip(page, "Muhurtham").click();

  await page.getByRole("button", { name: "Back" }).click();
  await onStep(page, 1);
  await expect(page.getByLabel("Wedding date *")).toHaveValue("2027-05-14");
  await expect(page.getByRole("radio", { name: "Madurai" })).toBeChecked();

  await advanceTo(page, 2);
  await expect(page.getByRole("checkbox", { name: "Muhurtham" })).toBeChecked();
});

test("the enquiry admits that no inbox is connected", async ({ page }) => {
  // The slowest test in the suite by design: it walks the whole enquiry AND
  // waits out the endpoint's three-second spam gate before submitting.
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
  /**
   * At scroll 0 the reachable CTA is the HERO's. The sticky bar deliberately
   * stays down while the hero — carrying the identical button — is on screen;
   * a bar duplicating a control already in view is a bar in the way. The bar's
   * own arrival is covered by "the sticky action bar behaviour".
   */
  const cta = page.locator("[data-hero]").getByRole("link", { name: "Check Your Date" });
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
    // Was eight. The mobile audit removed the duplicated trust block from the
    // homepage (it is verbatim on /about) and moved "Her morning" to /about,
    // so the floor moves with it. The assertion that matters is the one below:
    // whatever renders, the numbers run 01..n with no gaps.
    "at least six numbered sections",
  ).toBeGreaterThanOrEqual(6);

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
  // The 300vh scrub is the DESKTOP rendering. Below lg the section is
  // <StagesMobile />, a carousel with no track to scroll — covered separately.
  test.skip((page.viewportSize()?.width ?? 0) < 1024, "desktop scrub only");

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
  // Scrolling reveals the stages on the desktop track; on a phone the reader
  // flicks a rail instead. Same deferral, different gesture — see below.
  test.skip((page.viewportSize()?.width ?? 0) < 1024, "desktop scrub only");

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

  /**
   * SCROLL THROUGH THE RITUAL, NOT PAST IT.
   *
   * This used to step the whole document in fixed 400px jumps. That worked
   * while the homepage was 33 screens tall; the mobile audit took it to under
   * 17, and the same loop then crossed the ritual's sticky track in a handful
   * of jumps — too fast for each stage to become active and request its frame.
   * The test began failing for a page that had got better.
   *
   * It now walks the section itself, in twenty-four steps, which is what a
   * reader does and what the assertion below actually claims.
   */
  const track = await page.evaluate(() => {
    const el = document.querySelector('[aria-labelledby="ritual-title"], #ritual-title')
      ?.closest("section");
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top + window.scrollY, height: el.scrollHeight };
  });
  expect(track, "the ritual section was not found").not.toBeNull();

  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    await page.evaluate((v) => window.scrollTo(0, v), track!.top + (track!.height * i) / steps);
    await page.waitForTimeout(110);
  }

  // Every frame arrives by the time the reader has been through the section,
  // so no stage is ever blank.
  /**
   * 40s, inside the 90s this test gets from `test.slow()`.
   *
   * It takes ~13s on its own and contends with thirteen other browsers for one
   * server's image bandwidth, so the number here is headroom, not an
   * expectation. What is being asserted is that all eight frames ARRIVE — not
   * that they arrive quickly. Tightening it does not test the site harder, it
   * just tests the machine.
   */
  await expect.poll(() => fetched.size, { timeout: 40_000 }).toBe(8);
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
  /**
   * The secondary action is one control at each width, not two: a ghost button
   * from `lg` up, and a plain text link on a phone, where two filled buttons
   * stacked read as two equal choices. The name carries an arrow on mobile,
   * hence the regex rather than an exact string.
   */
  await expect(hero.getByRole("link", { name: /View the work/ }).first()).toBeVisible();

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

    await skipVeil(page);
    await page.goto("/");

    /**
     * Located by attribute, not by role.
     *
     * While the bar is down it is `aria-hidden`, which removes it from the
     * accessibility tree — so `getByRole` cannot see it, by design. And it IS
     * down here: this test jumps 2000px in one go, which is a downward scroll,
     * and hiding on the way down is the behaviour. Its arrival is asserted in
     * "the sticky action bar behaviour"; what matters here is the reservation.
     */
    const bar = page.locator("nav[data-action-bar]");
    await expect(bar).toBeAttached();

    // The one booking CTA, at a real touch size (§14 — 44px minimum).
    const cta = bar.getByRole("link", { name: "Check Your Date", includeHidden: true });
    const box = await cta.boundingBox();
    expect(box, "the bar's CTA has no box").not.toBeNull();
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

/**
 * On a phone every axis but the first lives behind the Filters sheet, so a
 * test that clicks chips has to say which surface it is clicking on. Above lg
 * the panel is the page itself and there is no sheet to open.
 *
 * Returns the surface to query chips in, and a way to put it away again.
 */
async function filterSurface(page: Page) {
  const open = page.getByRole("button", { name: /^Filters/ });
  if (await open.isVisible().catch(() => false)) {
    await open.click();
    const sheet = page.locator("dialog.lm-sheet");
    await expect(sheet).toBeVisible();
    return {
      surface: sheet,
      close: async () => {
        await page.keyboard.press("Escape");
        await expect(sheet).toBeHidden();
      },
    };
  }
  return { surface: page.locator("main"), close: async () => {} };
}

test.describe("portfolio filtering", () => {
  test("offers combinable facets and reports the result count", async ({ page }) => {
    await page.goto("/portfolio");
    const { surface } = await filterSurface(page);

    // Every axis the archive can genuinely fill (§15).
    for (const axis of ["Look", "Event", "Hair", "Category"]) {
      await expect(surface.getByRole("group", { name: axis }).first()).toBeVisible();
    }

    const status = surface.locator('[role="status"]').first();
    const unfiltered = await status.textContent();

    const chip = surface.getByRole("button", { name: "Muhurtham", exact: true }).first();
    await chip.click();
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await expect(status).not.toHaveText(unfiltered ?? "");
    await expect(status).toContainText("1 filter");
  });

  test("a combination with no work shows a way out, not an empty grid", async ({ page }) => {
    await page.goto("/portfolio");
    const { surface, close } = await filterSurface(page);

    // Muhurtham frames are not filed under Hair — an intersection with
    // nothing in it, which is exactly the state §46 is about.
    await surface.getByRole("button", { name: "Muhurtham", exact: true }).first().click();
    await surface.getByRole("button", { name: "Hair", exact: true }).first().click();
    await close();

    await expect(page.getByText("No looks found for this combination.")).toBeVisible();

    const clear = page.getByRole("button", { name: /^Clear/ }).last();
    await clear.click();

    await expect(page.getByText("No looks found for this combination.")).toBeHidden();

    const { surface: again } = await filterSurface(page);
    await expect(
      again.getByRole("button", { name: "Muhurtham", exact: true }).first(),
    ).toHaveAttribute("aria-pressed", "false");
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


/**
 * PHASE 3 — the sticky action bar's behaviour, not just its presence.
 *
 * The bar is only useful when it is not in the way: absent while the hero (and
 * its identical button) is on screen, present past it, gone on the way down
 * because on the way down a reader is reading, back on the way up.
 */
test.describe("the sticky action bar behaviour", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 1024, "mobile only");

  const state = (page: Page) =>
    page.evaluate(() => {
      const n = document.querySelector('nav[aria-label="Quick actions"]');
      if (!n) return null;
      return {
        inert: n.hasAttribute("inert"),
        hidden: n.hasAttribute("aria-hidden"),
        onScreen: n.getBoundingClientRect().top < window.innerHeight - 10,
      };
    });

  test("stays out of the way until the hero has gone, then follows scroll direction", async ({
    page,
  }) => {
    await skipVeil(page);
    await page.goto("/");
    await page.waitForTimeout(900);

    // The hero carries the same button; a bar duplicating it is a bar in the way.
    expect(await state(page), "bar should be down while the hero is visible").toMatchObject({
      inert: true,
      onScreen: false,
    });

    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForTimeout(700);
    expect(await state(page), "bar should arrive past the hero").toMatchObject({
      inert: false,
      onScreen: true,
    });

    await page.evaluate(() => window.scrollTo(0, 3400));
    await page.waitForTimeout(700);
    expect(await state(page), "bar should retreat while reading downward").toMatchObject({
      inert: true,
    });

    await page.evaluate(() => window.scrollTo(0, 2600));
    await page.waitForTimeout(700);
    expect(await state(page), "bar should return on the way back up").toMatchObject({
      inert: false,
    });
  });

  test("every WhatsApp link points at the configured number", async ({ page }) => {
    /**
     * This test used to assert the opposite — that NO wa.me link existed —
     * because the repo shipped without a number and every affordance is
     * written to render nothing rather than build a link that opens a chat
     * with nobody. A number is configured now, so the guarantee it protects
     * has moved: not "no link", but "no link to the wrong place".
     *
     * The failure it still catches is the placeholder. `91XXXXXXXXXX`
     * survives a digit-strip as "91", and a link to wa.me/91 costs the
     * enquiry AND the trust. `waNumber()` rejects anything under ten digits;
     * this is the end-to-end proof that it did.
     */
    await page.goto("/");

    const links = await page.locator('a[href*="wa.me"]').evaluateAll((els) =>
      els.map((e) => e.getAttribute("href") ?? ""),
    );
    expect(links.length, "WhatsApp affordances on the homepage").toBeGreaterThan(0);

    for (const href of links) {
      // Digits only, country code included, long enough to be a real number.
      expect(href, `malformed WhatsApp link: ${href}`).toMatch(
        /^https:\/\/wa\.me\/\d{12,15}\?text=/,
      );
    }
    // One number across the whole site, not one per component.
    expect(new Set(links.map((h) => h.split("?")[0])).size).toBe(1);
  });

  test("both channels are in the header and the footer", async ({ page }) => {
    await page.goto("/");

    // The header has room for exactly one of each — two 44px icons beside the
    // wordmark and the menu button, which is what fits at 390px.
    const header = page.locator("header");
    await expect(header.locator('a[href*="wa.me"]')).toHaveCount(1);
    await expect(header.locator('a[href*="instagram.com"]')).toHaveCount(1);

    // The footer carries the labelled pair, and the handle underneath it —
    // "Instagram" is the control, "@lanasmakeover" is how she finds the
    // account once she is already inside the app. So: at least one each.
    const footer = page.locator("footer");
    await expect(footer.locator('a[href*="wa.me"]')).toHaveCount(1);
    expect(await footer.locator('a[href*="instagram.com"]').count()).toBeGreaterThanOrEqual(1);

    // Both regions offer a pressable control, not just a line of text.
    for (const region of [header, footer]) {
      const box = await region.locator('a[href*="wa.me"]').boundingBox();
      expect(Math.min(box?.width ?? 0, box?.height ?? 0)).toBeGreaterThanOrEqual(44);
    }
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE RITUAL ON A PHONE (Phase 4)
 * ═══════════════════════════════════════════════════════════════════════════
 *  Linearised, the eight stages were eight full-bleed photographs with
 *  captions — around six screens for a sequence whose whole point is that it
 *  changes in one place. It is now a carousel, and the audit's number is the
 *  thing to hold: the entire section under 1.3 screens.
 */
test.describe("the ritual, on a phone", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 1024, "mobile only");

  test("is one frame, not eight, and fits in 1.3 screens", async ({ page }) => {
    await skipVeil(page);
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const section = page.locator('section[aria-labelledby="ritual-title"]');

    // The 300vh scrub must not be rendering underneath the carousel.
    expect(
      await section.locator("div[class*='300vh']").evaluateAll((els) =>
        els.filter((e) => getComputedStyle(e).display !== "none").length,
      ),
      "the desktop track is still painting on a phone",
    ).toBe(0);

    /**
     * THE ACCEPTANCE NUMBER.
     *
     * Measured from the section's own box, and against the visual viewport,
     * because that is what a bride's thumb has to travel.
     */
    const screens = await section.evaluate(
      (el) => el.getBoundingClientRect().height / window.innerHeight,
    );
    expect(screens, `the ritual is ${screens.toFixed(2)} screens tall`).toBeLessThanOrEqual(1.3);
  });

  test("tapping a stage changes the frame and announces it", async ({ page }) => {
    await skipVeil(page);
    await page.goto("/", { waitUntil: "networkidle" });

    const section = page.locator('section[aria-labelledby="ritual-title"]');
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    const thumbs = section.locator('button[aria-label^="Stage "]');
    expect(await thumbs.count(), "one thumbnail per stage").toBe(8);

    // Every one of them is a real tap target (§ Phase 6, checked early here
    // because this rail is the densest set of controls on the homepage).
    for (const box of await thumbs.evaluateAll((els) =>
      els.map((e) => e.getBoundingClientRect()),
    )) {
      expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
    }

    await thumbs.nth(5).click();
    await page.waitForTimeout(700);

    // The live region says where she is …
    await expect(section.locator('[aria-live="polite"]')).toHaveText(/Stage 6 of 8/);
    // … the caption agrees …
    await expect(section.getByText("The Gold", { exact: false }).first()).toBeVisible();
    // … and exactly one frame is opaque.
    const opaque = await section.evaluate((el) => {
      const frames = [...el.querySelectorAll<HTMLElement>("div[style*='opacity']")];
      return frames.filter((f) => Number(f.style.opacity) === 1).length;
    });
    expect(opaque, "exactly one frame is showing").toBe(1);
  });

  test("defers the frames it has not shown", async ({ page }) => {
    const fetched = new Set<string>();
    page.on("response", (r) => {
      const m = /url=([^&]+)/.exec(r.url());
      if (!/_next\/image/.test(r.url()) || !m) return;
      const name = decodeURIComponent(m[1]).split("/").pop() ?? "";
      if (name.startsWith("ritual-")) fetched.add(name);
    });

    await skipVeil(page);
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    /**
     * All eight plates share one box, so all eight are technically in the
     * viewport once the section is — `loading="lazy"` saves nothing. Only the
     * active frame and its neighbours are mounted, so a phone on a wedding-hall
     * connection fetches two photographs, not eight.
     */
    expect(fetched.size, `fetched ${[...fetched].join(", ")}`).toBeLessThanOrEqual(3);
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE INNER PAGES, ON A PHONE (Phase 5)
 * ═══════════════════════════════════════════════════════════════════════════
 */
test.describe("the inner pages, on a phone", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 1024, "mobile only");

  test("the services index is an index, not six service pages", async ({ page }) => {
    await skipVeil(page);
    await page.goto("/services", { waitUntil: "networkidle" });

    // Every service still names itself and links to its own page …
    await expect(page.getByRole("link", { name: "View service" })).toHaveCount(6);

    // … but its prose and its Includes list are not rendered here as well.
    // They are on /services/<slug>, which is one tap away and is where a
    // crawler and a bride both already expect to find them.
    expect(
      await page.getByRole("heading", { name: "Includes" }).evaluateAll((els) =>
        els.filter((e) => e.getBoundingClientRect().height > 0).length,
      ),
      "Includes lists painting on the index",
    ).toBe(0);

    /**
     * ONE BOOKING CONTROL, NOT SIX.
     *
     * Six "Check Your Date" buttons down one scroll is the mistake the
     * homepage made with eight. The sticky bar carries this intent on a phone,
     * and the page still ends with the closing CTA.
     */
    const cta = await page.getByRole("link", { name: /Check Your Date/i }).evaluateAll((els) =>
      els.filter((e) => {
        const r = e.getBoundingClientRect();
        // Painting, in the page itself — not the sticky bar and not the nav
        // drawer, both of which are places she went looking for it.
        return (
          r.width > 0 &&
          r.height > 0 &&
          !e.closest("[data-action-bar]") &&
          !!e.closest("main") &&
          !e.closest("nav")
        );
      }).length,
    );
    expect(cta, "inline booking links on /services").toBeLessThanOrEqual(1);
  });

  test("a service page shows a selection, and says where the rest is", async ({ page }) => {
    await skipVeil(page);
    await page.goto("/services/muhurtham", { waitUntil: "networkidle" });

    const gallery = page.locator('section[aria-label$="gallery"]');
    if ((await gallery.count()) === 0) test.skip(true, "no work filed under this world yet");

    // Twelve full-bleed photographs was six and a half screens under the prose
    // someone came to read — and the same twelve appear on the other five
    // service pages and again on /portfolio.
    const shown = await gallery.locator("img").count();
    expect(shown, "photographs under Selected work").toBeLessThanOrEqual(6);

    await expect(gallery.getByRole("link", { name: "The full archive" })).toBeVisible();
    expect(await gallery.evaluate((el) => el.getBoundingClientRect().height / window.innerHeight))
      .toBeLessThanOrEqual(4);
  });

  test("the archive filter is one rail and a sheet", async ({ page }) => {
    await skipVeil(page);
    await page.goto("/portfolio", { waitUntil: "networkidle" });

    const open = page.getByRole("button", { name: /^Filters/ });
    await expect(open).toBeVisible();

    // Closed, the sheet's chips are display:none and so are not a second copy
    // of every control in the accessibility tree.
    const sheet = page.locator("dialog.lm-sheet");
    await expect(sheet).toBeHidden();

    await open.click();
    await expect(sheet).toBeVisible();

    // It is a sheet: full width, sitting on the bottom edge.
    const box = await sheet.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), gap: Math.round(window.innerHeight - r.bottom) };
    });
    expect(box.w).toBe(390);
    expect(box.gap).toBe(0);

    // Filtering from inside the sheet moves the count, which is the whole
    // reason to leave it open while tapping.
    const status = sheet.locator('[role="status"]');
    const before = await status.textContent();
    await sheet.getByRole("button", { name: "Muhurtham" }).first().click();
    await expect(status).not.toHaveText(before ?? "");
    await expect(status).toContainText("filter");

    // showModal() means Escape is the browser's, not ours.
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();

    // And the count comes back with the button, so she can see one is on.
    await expect(open).toContainText("1");
  });

  test("about states the service area once, not twice", async ({ page }) => {
    await skipVeil(page);
    await page.goto("/about", { waitUntil: "networkidle" });

    /**
     * "Four cities — bridal makeup and hair across Chennai, Trichy,
     * Pudukkottai and Madurai" and the travel note were rendered in the trust
     * section word for word, about a screen and a half after the Locations
     * section had said both at display size. The same fact twice on one page
     * reads as padding, not as reassurance.
     */
    const trust = page.locator("section:has(#trust-title)");
    await expect(trust.getByRole("heading", { name: "Four cities" })).toHaveCount(0);
    await expect(trust.getByRole("heading", { name: "Travel", exact: true })).toHaveCount(0);
    // The signals that are NOT a repeat of the section above are still here.
    await expect(trust.getByRole("heading", { name: /Natural/ })).toBeVisible();

    // The section that DOES carry them is still there and still complete.
    await expect(page.locator("#locations-title")).toBeVisible();
    for (const city of ["Chennai", "Trichy", "Pudukkottai", "Madurai"]) {
      await expect(page.locator("#locations-title ~ ul, section:has(#locations-title) ul").getByText(city, { exact: true })).toHaveCount(1);
    }

    // The travel note survives, once — in the page. The footer carries it on
    // every page and is not what "twice on this page" meant.
    expect(
      await page.evaluate(
        () =>
          ((document.querySelector("main") as HTMLElement | null)?.innerText.match(
            /Travel available across Tamil Nadu/g,
          ) ?? []).length,
      ),
    ).toBe(1);
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  A THUMB IS NOT A CURSOR (Phase 6)
 * ═══════════════════════════════════════════════════════════════════════════
 *  A line of 14px text is about 20px tall, which is a fine link for a mouse
 *  and a poor one for a thumb — and the site had thirty-nine of them. This is
 *  the standing guard: it walks every page and fails on the first control a
 *  bride would have to aim at.
 */
test.describe("every control is thumb-sized", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 1024, "mobile only");

  for (const path of ["/", "/services", "/services/muhurtham", "/about", "/portfolio", "/contact", "/faq"]) {
    test(`on ${path}`, async ({ page }) => {
      await skipVeil(page);
      await page.goto(path, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);

      const small = await page.evaluate(() =>
        [...document.querySelectorAll("a,button,input,select,textarea,summary,[role=button]")]
          .filter((e) => {
            const r = e.getBoundingClientRect();
            if (r.width < 3 || r.height < 3) return false; // sr-only
            const cs = getComputedStyle(e);
            if (cs.visibility === "hidden") return false;
            // The honeypot is parked off-screen, aria-hidden and untabbable:
            // the one field on the site nobody should ever be able to hit.
            if (e.closest("[aria-hidden=true]") || (e as HTMLElement).tabIndex < 0) return false;
            return Math.min(r.width, r.height) < 44;
          })
          .map((e) => {
            const r = e.getBoundingClientRect();
            return `${e.tagName.toLowerCase()} "${(e.textContent || "").trim().slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`;
          }),
      );

      expect(small, `controls under 44px on ${path}`).toEqual([]);
    });
  }
});

/**
 * The theme is ivory on near-black and has never been in doubt, but the type
 * carries a lot of alpha — /65, /70, /80 — and each of those is a step toward
 * the ground. This checks what a bride actually sees, by compositing the text
 * colour over the first ancestor that paints.
 */
test("nothing readable falls under the contrast minimum", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) >= 1024, "mobile only");

  await skipVeil(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  const bad = await page.evaluate(() => {
    /**
     * COMPUTED COLOURS ARE NOT ALWAYS rgb().
     *
     * Anything through color-mix() or an oklab token comes back as
     * `oklab(0.94 0.001 0.013 / 0.65)`, and reading those three numbers as
     * 0–255 sRGB makes every ratio come out at about 1.03 — a contrast audit
     * that fails everything and therefore says nothing. The browser already
     * knows how to resolve and composite any colour it can parse, so ask it:
     * paint the ground, paint the text colour over it, read the pixel.
     */
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const ctx = cv.getContext("2d", { willReadFrequently: true })!;
    const px = (bg: string, fg?: string) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1, 1);
      if (fg) {
        ctx.fillStyle = fg;
        ctx.fillRect(0, 0, 1, 1);
      }
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2]];
    };
    const lum = (c: number[]) => {
      const s = c.map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
    };
    /** The first ancestor that actually paints something opaque. */
    const bgOf = (el: Element) => {
      let n: Element | null = el;
      while (n && n !== document.documentElement) {
        const c = getComputedStyle(n).backgroundColor;
        const a = px("rgb(255,0,255)", c);
        const b = px("rgb(0,255,0)", c);
        if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) < 12) return c;
        n = n.parentElement;
      }
      return getComputedStyle(document.body).backgroundColor;
    };

    const out: string[] = [];
    for (const el of document.querySelectorAll("p,span,a,li,h1,h2,h3,dt,dd,button,label,summary")) {
      const txt = (el.textContent || "").trim();
      if (!txt || el.children.length > 0) continue;
      // A ghost word at 3.5% opacity is a depth cue, not text — it is
      // aria-hidden and pointer-events-none, and the rule does not reach it.
      if (el.closest("[aria-hidden=true]")) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.opacity === "0") continue;

      const bg = bgOf(el);
      const L1 = lum(px(bg, cs.color));
      const L2 = lum(px(bg));
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);

      const size = parseFloat(cs.fontSize);
      const large = size >= 24 || (size >= 18.66 && parseInt(cs.fontWeight, 10) >= 700);
      const need = large ? 3 : 4.5;
      if (ratio < need) out.push(`${ratio.toFixed(2)} < ${need} · ${size}px "${txt.slice(0, 30)}"`);
    }
    return [...new Set(out)];
  });

  expect(bad).toEqual([]);
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE CITY PAGES
 * ═══════════════════════════════════════════════════════════════════════════
 *  "Bridal makeup artist in Chennai" is the query this site most needs to
 *  answer, and these four pages are the only ones written to answer it. The
 *  failure mode is not that they break — it is that they quietly become one
 *  template with four names in it, which is the oldest and most reliably
 *  penalised trick in local SEO.
 */
test.describe("the city pages", () => {
  const CITIES = [
    { slug: "chennai", city: "Chennai" },
    { slug: "trichy", city: "Trichy" },
    { slug: "madurai", city: "Madurai" },
    { slug: "pudukkottai", city: "Pudukkottai" },
  ];

  for (const { slug, city } of CITIES) {
    test(`${city} names itself in the title, the h1 and the schema`, async ({ page }) => {
      await skipVeil(page);
      await page.goto(`/locations/${slug}`, { waitUntil: "networkidle" });

      await expect(page).toHaveTitle(new RegExp(`Bridal Makeup Artist in ${city}`));

      const h1 = page.locator("h1");
      await expect(h1).toHaveCount(1);
      await expect(h1).toContainText(city);

      const schema = await page.evaluate(() =>
        [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => {
          try {
            const j = JSON.parse(s.textContent ?? "{}");
            return Array.isArray(j) ? j : [j];
          } catch {
            return [];
          }
        }),
      );
      const types = schema.map((s: Record<string, unknown>) => s["@type"]);
      expect(types).toContain("Service");
      expect(types).toContain("FAQPage");
      expect(types).toContain("BreadcrumbList");

      /**
       * ONE BUSINESS, FOUR AREAS SERVED — NOT FOUR BUSINESSES.
       *
       * The obvious move on a city page is to emit a LocalBusiness for that
       * city. It is also the move that gets a business flattened in local
       * search: there is one premises, in Trichy, and four records with four
       * addresses would claim four that do not exist. The city page's Service
       * references the business by @id and varies `areaServed` instead.
       */
      const service = schema.find((s: Record<string, unknown>) => s["@type"] === "Service") as
        | Record<string, never>
        | undefined;
      expect(service?.areaServed).toMatchObject({ "@type": "City", name: city });
      expect(service?.provider).toHaveProperty("@id");
      // No price exists, so no offers block may claim one.
      expect(service).not.toHaveProperty("offers");

      // The FAQ schema must answer exactly what the page answers.
      const faq = schema.find((s: Record<string, unknown>) => s["@type"] === "FAQPage") as
        | { mainEntity?: Array<{ name: string }> }
        | undefined;
      for (const q of faq?.mainEntity ?? []) {
        await expect(page.getByRole("heading", { name: q.name, exact: true })).toBeVisible();
      }
    });
  }

  test("are four different pages, not one template four times", async ({ page }) => {
    /**
     * Shingled on eight-word windows, which is roughly how a duplicate-content
     * detector sees a page. What overlap remains is the shared chrome — the
     * services list, the closing block, the travel note — and the body copy of
     * any two of these should have almost nothing in common.
     */
    const texts: Record<string, string> = {};
    for (const { slug } of CITIES) {
      await page.goto(`/locations/${slug}`, { waitUntil: "networkidle" });
      texts[slug] = await page.evaluate(() => document.querySelector("main")?.innerText ?? "");
    }

    const shingles = (t: string) => {
      const w = t
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .filter(Boolean);
      const s = new Set<string>();
      for (let i = 0; i + 8 <= w.length; i++) s.add(w.slice(i, i + 8).join(" "));
      return s;
    };

    const keys = Object.keys(texts);
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const a = shingles(texts[keys[i]]);
        const b = shingles(texts[keys[j]]);
        const inter = [...a].filter((x) => b.has(x)).length;
        const jaccard = inter / (a.size + b.size - inter);
        expect(
          jaccard,
          `${keys[i]} and ${keys[j]} are ${(jaccard * 100).toFixed(0)}% the same page`,
        ).toBeLessThan(0.25);
      }
    }
  });

  test("every city the site claims has a page, and is linked from every page", async ({
    page,
  }) => {
    await page.goto("/");

    // The footer prints the service areas on every page of the site — the
    // single most-repeated internal link opportunity there is.
    for (const { slug, city } of CITIES) {
      const link = page.locator("footer").getByRole("link", { name: city, exact: true });
      await expect(link, `${city} is linked in the footer`).toHaveCount(1);
      await expect(link).toHaveAttribute("href", `/locations/${slug}`);
    }
    await expect(page.locator("footer").getByRole("link", { name: "Locations" })).toHaveCount(1);
  });

  test("the index reaches all four and the sitemap lists them", async ({ page, request }) => {
    await page.goto("/locations", { waitUntil: "networkidle" });
    for (const { slug } of CITIES) {
      await expect(page.locator(`a[href="/locations/${slug}"]`).first()).toBeVisible();
    }

    const xml = await (await request.get("/sitemap.xml")).text();
    for (const { slug } of CITIES) {
      expect(xml, `${slug} in the sitemap`).toContain(`/locations/${slug}`);
    }
    expect(xml).toContain("/locations<");
  });

  test("invent nothing: no price, no count, no years, no address", async ({ page }) => {
    /**
     * A city page is exactly where the temptation to invent a business fact is
     * strongest — "trusted by 200 Chennai brides", "packages from ₹15,000".
     * None of that is knowable from anything the client has supplied.
     */
    for (const { slug } of CITIES) {
      await page.goto(`/locations/${slug}`, { waitUntil: "networkidle" });
      const text = await page.evaluate(() => document.querySelector("main")?.innerText ?? "");

      expect(text, "a price").not.toMatch(/₹|\bRs\.?\s?\d|\bINR\b/i);
      expect(text, "a bride count").not.toMatch(/\b\d{2,}\+?\s+(brides|weddings|clients)\b/i);
      expect(text, "years of experience").not.toMatch(/\b\d+\+?\s+years?\b/i);
      expect(text, "a superlative claim").not.toMatch(/\bbest\b|\bno\.?\s?1\b|\btop\s+rated\b/i);
      // Leftover editorial markers must never reach a visitor.
      expect(text, "an unresolved marker").not.toMatch(/TODO|⟨|⟩|Lorem/);
    }
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE RENTAL JEWELLERY CATALOGUE
 * ═══════════════════════════════════════════════════════════════════════════
 *  133 photographs from five supplier catalogues. Every product frame arrived
 *  with an internal stock code burned into it in bold white type — M201, AD07,
 *  C030 — in an inconsistent corner. The codes were found and painted out
 *  before import.
 *
 *  The two things that must never regress are here: no code reaches a bride,
 *  and no price is ever implied.
 */
test.describe("rental jewellery", () => {
  const ROOMS = [
    { slug: "temple-jewellery", name: "Temple Jewellery" },
    { slug: "american-diamond-sets", name: "American Diamond" },
    { slug: "choker-and-necklace-sets", name: "Choker & Necklace" },
    { slug: "on-the-bride", name: "On the Bride" },
  ];

  test("the index offers every room, with a count taken from the catalogue", async ({
    page,
  }) => {
    await skipVeil(page);
    await page.goto("/rental-jewellery", { waitUntil: "networkidle" });

    for (const { slug } of ROOMS) {
      await expect(page.locator(`a[href="/rental-jewellery/${slug}"]`).first()).toBeVisible();
    }

    // The counts are rendered from the JSON, never typed — so they cannot
    // outlive the photographs behind them.
    const counts = await page
      .locator("main")
      .getByText(/^\d+ sets$/)
      .allTextContents();
    expect(counts).toHaveLength(ROOMS.length);
    for (const c of counts) expect(Number(c.split(" ")[0])).toBeGreaterThan(0);
  });

  for (const { slug, name } of ROOMS) {
    test(`${name} renders, pages, and opens a set full size`, async ({ page }) => {
      await skipVeil(page);
      await page.goto(`/rental-jewellery/${slug}`, { waitUntil: "networkidle" });

      await expect(page.locator("h1")).toHaveCount(1);

      /**
       * TWENTY-FOUR AT A TIME, NOT FIFTY-SIX.
       *
       * The largest room holds fifty-six sets. Putting all of them in the DOM
       * would make the first paint of that page cost twice what the smallest
       * one does, on a phone, for photographs nobody has scrolled to.
       */
      const tiles = page.locator("main ul li button[aria-label^='Open']");
      const n = await tiles.count();
      expect(n).toBeGreaterThan(0);
      expect(n, "sets rendered before paging").toBeLessThanOrEqual(24);

      // Opening one gives the full frame in a real modal.
      await tiles.first().click();
      const box = page.locator("dialog.lm-lightbox");
      await expect(box).toBeVisible();
      await expect(box.locator("img")).toBeVisible();
      await expect(box.locator('[aria-live="polite"]')).toContainText(/1 of \d+/);

      // Arrow keys compare without closing — the whole point of the control.
      await page.keyboard.press("ArrowRight");
      await expect(box.locator('[aria-live="polite"]')).toContainText(/2 of \d+/);
      await expect(box).toBeVisible();

      // showModal() means Escape is the browser's.
      await page.keyboard.press("Escape");
      await expect(box).toBeHidden();
    });
  }

  test("no stock code survives, and no price is implied", async ({ page }) => {
    for (const { slug } of ROOMS) {
      await skipVeil(page);
      await page.goto(`/rental-jewellery/${slug}`, { waitUntil: "networkidle" });

      const text = await page.evaluate(() => document.querySelector("main")?.innerText ?? "");

      /**
       * A stock code is a warehouse reference. It means nothing to a bride and
       * printing it invites her to ask for "M201" rather than to describe what
       * she wants — the opposite of the conversation this site is for. The
       * shapes are the four families in the supplier books.
       */
      expect(text, "a stock code in the copy").not.toMatch(/\b(?:M\d{3}|AD\d{2}|C\d{3})\b/);

      // Nor may one hide in an alt attribute, which is where a careless
      // import would put it.
      const alts = await page.locator("main img").evaluateAll((els) =>
        els.map((e) => e.getAttribute("alt") ?? ""),
      );
      for (const a of alts) {
        expect(a, `stock code in alt: ${a}`).not.toMatch(/\b(?:M\d{3}|AD\d{2}|C\d{3})\b/);
        expect(a.length, "an empty alt on a catalogue photograph").toBeGreaterThan(10);
      }

      // No price exists. Rental terms are settled per date and per city, and a
      // figure on this page would be one Lana never quoted.
      expect(text, "a price").not.toMatch(/₹|\bRs\.?\s?\d|\bINR\b|\bper day\b/i);
    }
  });

  test("the schema describes a service, not a shop", async ({ page }) => {
    await skipVeil(page);
    await page.goto("/rental-jewellery/temple-jewellery", { waitUntil: "networkidle" });

    const schema = await page.evaluate(() =>
      [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => {
        try {
          const j = JSON.parse(s.textContent ?? "{}");
          return Array.isArray(j) ? j : [j];
        } catch {
          return [];
        }
      }),
    );
    const types = schema.map((s: Record<string, unknown>) => s["@type"]);
    expect(types).toContain("CollectionPage");

    /**
     * Product/Offer is the obvious mistake here. Product without `offers`
     * earns nothing, and `offers` requires a price — so emitting one would
     * mean inventing a figure to satisfy a validator, and that figure would
     * appear in a search result.
     */
    expect(types).not.toContain("Product");
    expect(types).not.toContain("Offer");
    expect(JSON.stringify(schema)).not.toContain('"price"');
  });

  test("is reachable from the header and the footer of every page", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator("footer").getByRole("link", { name: "Jewellery Rental" }),
    ).toHaveCount(1);

    if ((page.viewportSize()?.width ?? 0) >= 1024) {
      await expect(
        page.locator("header").getByRole("link", { name: "Jewellery", exact: true }),
      ).toBeVisible();
    }
  });

  test("the sitemap lists the catalogue", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("/rental-jewellery<");
    for (const { slug } of ROOMS) expect(xml).toContain(`/rental-jewellery/${slug}`);
  });
});

/**
 * The homepage came down from 33.3 screens to 12.3 over the mobile audit. A
 * second line of business still had to appear on it, and those two facts are
 * only compatible in one direction: sideways. This is the guard that keeps it
 * that way.
 */
test.describe("the jewellery on the homepage", () => {
  test("is a rail, and costs under a screen", async ({ page }) => {
    await skipVeil(page);
    await page.goto("/", { waitUntil: "networkidle" });

    const strip = page.locator("section:has(#rental-strip-title)");
    await strip.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const screens = await strip.evaluate(
      (el) => el.getBoundingClientRect().height / window.innerHeight,
    );
    expect(screens, `the strip is ${screens.toFixed(2)} screens tall`).toBeLessThanOrEqual(0.95);

    // It scrolls sideways rather than growing downward. A grid of twelve would
    // have been three screens on a phone and would have undone a quarter of
    // the audit on its own.
    const rail = strip.locator('div[class*="overflow-x-auto"]');
    expect(await rail.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);

    // The first thumbnail lines up with the heading above it. An earlier
    // version did the gutter arithmetic by hand and produced no padding at
    // all, which put the first set half off the left of a phone.
    const offset = await strip.evaluate((el) => {
      const r = el.querySelector('div[class*="overflow-x-auto"]');
      const tile = r?.querySelector("a");
      const head = el.querySelector("h2");
      if (!tile || !head) return null;
      return Math.round(tile.getBoundingClientRect().left - head.getBoundingClientRect().left);
    });
    expect(offset, "the rail is out of line with the heading").toBe(0);
  });

  test("adds a link, not a fourth booking button", async ({ page }) => {
    await skipVeil(page);
    await page.goto("/", { waitUntil: "networkidle" });

    const strip = page.locator("section:has(#rental-strip-title)");
    await expect(strip.getByRole("link", { name: /All \d+ sets/ })).toBeVisible();

    /**
     * The homepage already carries three inline booking controls and the
     * sticky bar. A fourth here would be the eight-button mistake starting
     * again — the finding that opened this whole audit.
     */
    await expect(strip.getByRole("link", { name: /Check Your Date/i })).toHaveCount(0);

    // And the count is rendered from the catalogue, so it cannot outlive it.
    const label = await strip.getByRole("link", { name: /All \d+ sets/ }).textContent();
    const claimed = Number((label ?? "").replace(/\D/g, ""));
    await page.goto("/rental-jewellery", { waitUntil: "networkidle" });
    const counts = await page
      .locator("main")
      .getByText(/^\d+ sets$/)
      .allTextContents();
    const actual = counts.reduce((a, c) => a + Number(c.split(" ")[0]), 0);
    expect(claimed, "the homepage claims a different number from the catalogue").toBe(actual);
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE CASCADE-LAYER TRAP
 * ═══════════════════════════════════════════════════════════════════════════
 *  globals.css declares component classes that set `display` — `.btn`,
 *  `.link-wipe`, `.line-mask`. Declared OUTSIDE a cascade layer they beat every
 *  Tailwind utility, no matter how specific, so `className="btn hidden
 *  lg:inline-flex"` hides nothing and the control paints at every width.
 *
 *  That shipped four times: the header CTA, the mirror CTA, the services CTA,
 *  and finally the hero — where it put two "View the work" controls on top of
 *  each other on the first screen of the site, and survived an entire mobile
 *  audit because nothing looked broken, there was just one button too many.
 *
 *  Those classes are in `@layer components` now. This is the guard that says
 *  so, in the only terms that matter: no control appears twice.
 */
test("no control is rendered twice in the same place", async ({ page }) => {
  const ROUTES = [
    "/",
    "/about",
    "/services",
    "/portfolio",
    "/contact",
    "/faq",
    "/bridal",
    "/hair",
    "/makeup",
    "/locations/chennai",
    "/rental-jewellery",
    "/rental-jewellery/temple-jewellery",
    "/journal",
  ];
  const wide = (page.viewportSize()?.width ?? 0) >= 1024;

  for (const route of ROUTES) {
    await skipVeil(page);
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(300);

    const dupes = await page.evaluate(() => {
      const seen = new Map<string, number>();
      for (const a of document.querySelectorAll("main a, header a")) {
        const r = a.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) continue;
        if (getComputedStyle(a).visibility === "hidden") continue;
        // A closed drawer, a closed dialog and the sticky bar's own copy are
        // all legitimately the same link somewhere else.
        if (a.closest("[inert],[aria-hidden=true],dialog:not([open]),[data-action-bar],nav[aria-label='Quick actions']")) {
          continue;
        }
        const label = (a.textContent ?? "").trim().toLowerCase().replace(/[→\s]+/g, " ").trim();
        const href = a.getAttribute("href");
        if (!label || !href) continue;
        const scope = a.closest("section,header") ?? document.body;
        const key = `${scope.tagName}${scope.getAttribute("aria-labelledby") ?? ""}|${href}|${label}`;
        seen.set(key, (seen.get(key) ?? 0) + 1);
      }
      return [...seen.entries()]
        .filter(([, n]) => n > 1)
        .map(([k, n]) => `${n}× ${k.split("|").slice(1).join(" ")}`);
    });

    /**
     * /services on DESKTOP genuinely offers one booking button per service —
     * six of them, in one list, by design. Below lg they are all hidden and
     * the sticky bar carries the intent, which is what Phase 5 established.
     */
    const expected = wide && route === "/services" ? 1 : 0;
    expect(dupes, `${route} at ${page.viewportSize()?.width}px: ${dupes.join(" · ")}`).toHaveLength(
      expected,
    );
  }
});

/**
 * The three discipline pages are what disciplines.ts itself calls "the site's
 * primary organic-search surfaces". Each section carried `{ alt, tone, seed }`
 * and no `src`, so EditorialImage fell through to PlaceholderPlate and painted
 * a coloured gradient — four empty plates per page, above a gallery of the
 * real work, on three indexed pages.
 */
test.describe("the discipline pages show photographs, not plates", () => {
  for (const route of ["/bridal", "/hair", "/makeup"]) {
    test(route, async ({ page }) => {
      await skipVeil(page);
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);

      const plates = await page.evaluate(
        () =>
          [...document.querySelectorAll("main svg")].filter((s) => {
            const r = s.getBoundingClientRect();
            // The kolam is decorative line-work and is allowed; a placeholder
            // plate is a large filled block standing in for a photograph.
            return r.width > 150 && r.height > 150 && !s.closest("[class*='pointer-events-none']");
          }).length,
      );
      expect(plates, "placeholder plates standing in for photographs").toBe(0);

      // And every section has a real image above its prose.
      const imgs = await page.locator("main img").count();
      expect(imgs).toBeGreaterThanOrEqual(4);
    });
  }
});
