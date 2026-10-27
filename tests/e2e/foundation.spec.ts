import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const workspaceRoutes = [
  ["/dashboard", "A little focus. A brighter future."],
  ["/reading", "Reading"], ["/listening", "Listening"],
  ["/writing", "Writing"], ["/speaking", "Speaking"],
  ["/mock-tests", "Mock tests"],
  ["/analytics", "A clearer picture of progress."],
  ["/profile", "Your journey. Your direction."],
  ["/admin", "Carefully built. Thoughtfully managed."],
] as const;

test("homepage explains the preview and opens the workspace", async ({ page }, testInfo) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Big ambitions.");
  await expect(page.getByText("PHASE 1 PREVIEW", { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("homepage.png"), fullPage: true });
  await page.getByRole("link", { name: "Explore your workspace", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText("Demonstration workspace.", { exact: true })).toBeVisible();
  await expect(page.getByLabel("No estimated band", { exact: true })).toHaveText("—");
  expect(runtimeErrors).toEqual([]);
});

for (const [route, heading] of workspaceRoutes) {
  test(`${route} renders a labeled preview without horizontal overflow`, async ({ page }, testInfo) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: heading, exact: true })).toBeVisible();
    await expect(page.getByText("Demonstration workspace.", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
    if (route === "/dashboard") await page.screenshot({ path: testInfo.outputPath("dashboard.png"), fullPage: true });
  });
}

test("navigation opens the selected module and marks it current", async ({ page, isMobile }) => {
  await page.goto("/dashboard");
  if (isMobile) await page.getByRole("button", { name: "Open navigation" }).click();
  const navigation = page.getByRole("navigation", { name: isMobile ? "Mobile navigation" : "Main navigation", exact: true });
  await navigation.getByRole("link", { name: "Writing", exact: true }).click();
  await expect(page).toHaveURL(/\/writing$/);
  await expect(page.getByRole("heading", { name: "Writing", exact: true, level: 1 })).toBeVisible();
  await expect(page.getByText("Coming in Phase 3", { exact: true })).toBeVisible();
  if (isMobile) {
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await page.getByRole("button", { name: "Open navigation" }).click();
  }
  await expect(navigation.getByRole("link", { name: "Writing", exact: true })).toHaveAttribute("aria-current", "page");
});

test("mobile menu supports keyboard opening, Escape and focus restoration", async ({ page, isMobile }) => {
  test.skip(!isMobile, "The modal menu is a mobile control.");
  await page.goto("/dashboard");
  const trigger = page.getByRole("button", { name: "Open navigation" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Workspace navigation" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Workspace navigation" })).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("theme choice persists across reloads", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("demo profile validates, saves locally, survives reload and clears", async ({ page }) => {
  const supabaseRequests: string[] = [];
  page.on("request", (request) => { if (/\.supabase\.(co|in)\//.test(request.url())) supabaseRequests.push(request.url()); });
  await page.goto("/profile");
  await expect(page.getByText("Demonstration preferences", { exact: true })).toBeVisible();
  await page.getByLabel("Display name", { exact: true }).fill("Demo Explorer");
  await page.getByLabel(/Time zone/).fill("invalid/timezone");
  await page.getByRole("button", { name: "Save demo preferences" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "valid IANA time zone" })).toBeVisible();
  await page.getByLabel(/Time zone/).fill("Asia/Singapore");
  await page.getByLabel(/Target overall band/).selectOption("7");
  await page.getByLabel(/Daily study goal/).fill("45");
  await page.getByRole("button", { name: "Save demo preferences" }).click();
  await expect(page.getByText(/Demo preferences saved on this browser only/)).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Display name", { exact: true })).toHaveValue("Demo Explorer");
  await expect(page.getByLabel(/Time zone/)).toHaveValue("Asia/Singapore");
  await expect(page.getByLabel(/Target overall band/)).toHaveValue("7");
  await expect(page.getByLabel(/Daily study goal/)).toHaveValue("45");
  await page.getByRole("button", { name: "Clear demo data" }).click();
  await expect(page.getByText("Demo preferences cleared from this browser.", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Display name", { exact: true })).toHaveValue("");
  await page.reload();
  await expect(page.getByLabel("Display name", { exact: true })).toHaveValue("");
  await expect(page.getByLabel(/Target overall band/)).toHaveValue("");
  expect(supabaseRequests).toEqual([]);
});

test("authentication cannot fake a session when services are not configured", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("Sign-in is not connected in this demonstration.", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeDisabled();
  await page.goto("/register");
  await expect(page.getByRole("button", { name: "Create approved account" })).toBeDisabled();
  await page.goto("/forgot-password");
  await expect(page.getByRole("button", { name: "Send reset link" })).toBeDisabled();
  await page.goto("/reset-password");
  await expect(page.getByRole("button", { name: "Update password" })).toBeDisabled();
});

test("mock and analytics previews do not present fabricated results", async ({ page }) => {
  await page.goto("/mock-tests");
  await expect(page.getByText(/No tests are available in Phase 1/)).toBeVisible();
  await expect(page.getByRole("button", { name: /start.*test|begin.*mock/i })).toHaveCount(0);
  await page.goto("/analytics");
  await expect(page.getByText("Not enough data", { exact: true })).toHaveCount(4);
  await expect(page.getByLabel("No estimated band", { exact: true })).toHaveCount(4);
});

test("unknown routes return an accessible 404", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Let’s find your way back." })).toBeVisible();
  await page.getByRole("link", { name: "Back to overview" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

for (const route of ["/", "/dashboard", "/profile", "/login"]) {
  test(`${route} has no automatically detectable WCAG A/AA violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("dashboard dark theme passes the automated accessibility check", async ({ page }, testInfo) => {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.screenshot({ path: testInfo.outputPath("dashboard-dark.png"), fullPage: true });
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
});
