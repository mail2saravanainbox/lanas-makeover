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
    await expect(header.getByRole("link", { name: "Lana's Makeover" })).toBeVisible();

    await expect(header.getByRole("link", { name: "Check Your Date" })).toBeVisible();

    if (isDesktop(page)) {
      const nav = page.getByRole("navigation", { name: "Primary" });
      for (const label of ["Portfolio", "Services", "Journal", "About"]) {
        await expect(nav.getByRole("link", { name: label })).toBeVisible();
      }
      // "Brides" has no stories behind it, so it must not be offered.
      await expect(nav.getByRole("link", { name: "Brides" })).toHaveCount(0);
    }
  });

  test("three Tab presses reach a nav link or the booking CTA", async ({ page }) => {
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
    expect(focused!.inHeader, `focus landed on ${JSON.stringify(focused)}`).toBe(true);

    const reachable = ["/contact", "/portfolio", "/services", "/journal", "/about", "/"];
    expect(reachable).toContain(focused!.href);
  });
});

test("the enquiry form admits that no inbox is connected", async ({ page }) => {
  await page.goto("/contact");

  await page.getByLabel("Name *").fill("Test Enquiry");
  await page.getByLabel("Phone *").fill("9876543210");
  await page.getByLabel("Email *").fill("test@example.com");
  await page.getByLabel("Wedding date *").fill("2027-05-14");
  await page.getByLabel("Wedding city *").fill("Trichy");

  await page.getByRole("button", { name: "Send enquiry" }).click();

  const status = page.locator('[role="status"]');
  await expect(status).toContainText("isn't connected yet");
  // And never the claim that it arrived somewhere.
  await expect(status).not.toContainText("has been received");

  // Her words are still in the form so she can copy them elsewhere.
  await expect(page.getByLabel("Name *")).toHaveValue("Test Enquiry");
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

test("at 390px the header fits the viewport and still shows the CTA", async ({ page }) => {
  test.skip(isDesktop(page), "phone-width layout only");

  await page.goto("/");
  const header = page.locator("header");
  const cta = header.getByRole("link", { name: "Check Your Date" });
  await expect(cta).toBeVisible();

  const width = page.viewportSize()!.width;
  const headerBox = (await header.boundingBox())!;
  const ctaBox = (await cta.boundingBox())!;

  // The bar does not overflow the viewport …
  expect(headerBox.x).toBeGreaterThanOrEqual(0);
  expect(headerBox.x + headerBox.width).toBeLessThanOrEqual(width + 0.5);

  // … and the CTA is wholly inside it, not clipped off the right edge.
  expect(ctaBox.x).toBeGreaterThanOrEqual(headerBox.x - 0.5);
  expect(ctaBox.x + ctaBox.width).toBeLessThanOrEqual(width + 0.5);

  // No horizontal scroll anywhere on the page.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

/* ── Phase 2 ─────────────────────────────────────────────────────────────── */

test("the homepage numbers its sections contiguously from 01", async ({ page }) => {
  await page.goto("/");

  const numbered = await page.evaluate(() => {
    const footer = document.querySelector("footer");
    return [...document.querySelectorAll<HTMLElement>(".eyebrow")]
      .filter((el) => !footer?.contains(el))
      .map((el) => el.textContent?.trim() ?? "")
      .filter((t) => /^\d{2} — /.test(t));
  });

  expect(numbered.length, "at least eight numbered sections").toBeGreaterThanOrEqual(8);

  const values = numbered.map((t) => Number(t.slice(0, 2)));
  // No gaps: sections that render nothing (no brides, no testimonials) must
  // not leave a hole in the sequence.
  expect(values).toEqual(values.map((_, i) => i + 1));
  expect(new Set(values).size, "no duplicates").toBe(values.length);
});

test("no WebGL canvas exists, before or after scrolling", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("canvas")).toHaveCount(0);

  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
  await page.waitForTimeout(800);
  await expect(page.locator("canvas")).toHaveCount(0);

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
    const el = [...document.querySelectorAll("section")].find((s) =>
      s.getAttribute("aria-labelledby") === "ritual-title",
    );
    if (!el) return null;
    const inner = el.querySelector<HTMLElement>("div[class*='300vh']");
    if (!inner) return null;
    const r = inner.getBoundingClientRect();
    return { top: Math.round(r.top + window.scrollY), height: Math.round(r.height) };
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
    ((window as unknown as { dataLayer: Array<{ event?: string }> }).dataLayer ?? []).some(
      (e) => e.event === "ritual_complete",
    ),
  );
  expect(fired, "ritual_complete on the dataLayer").toBe(true);
});

test("the hero's frame actually has a size", async ({ page }) => {
  await page.goto("/");

  // Regression guard. The frame once rendered 1280x0 — valid markup, correct
  // classes, no height — because PlaceholderPlate's own `relative` beat the
  // `absolute` passed in via className. Nothing in the DOM looked wrong; the
  // hero was simply an empty black rectangle on the live site.
  const box = await page.locator("[data-hero] [data-placeholder], [data-hero] img").first().boundingBox();
  expect(box, "the hero frame is in the DOM").not.toBeNull();
  expect(box!.width).toBeGreaterThan(200);
  expect(box!.height).toBeGreaterThan(200);
});
