import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke tests run against a PRODUCTION build served by `next start`.
 *
 * Not `next dev`: the things being asserted — static 404s, prerendered
 * markup, the absence of the WebGL chunk — only behave correctly in a real
 * build, and a dev-server pass would be a false green.
 *
 * No env vars are set, deliberately. That is the state the site ships in
 * today, and the contact test depends on it.
 */
const PORT = Number(process.env.PORT ?? 3100);
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL,
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    {
      name: "mobile",
      // 390 x 844 — the iPhone 14/15 class of device most brides arrive on.
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: false },
    },
  ],

  webServer: {
    command: `npm run build && npx next start --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
