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
