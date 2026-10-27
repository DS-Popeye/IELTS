import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByText("Demonstration workspace.", { exact: true })).toBeVisible();
});

test("account menu toggles with click or tap and dismisses outside", async ({ page, isMobile }) => {
  const trigger = page.getByRole("button", { name: "Demo workspace, account menu" });
  const menu = page.getByRole("menu", { name: "Account actions" });
  const activate = () => isMobile ? trigger.tap() : trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await activate();
  await expect(menu).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(menu.getByRole("menuitem", { name: "Profile & Goals" })).toBeFocused();
  await expect(menu.getByRole("menuitem", { name: "Administration" })).toHaveCount(0);
  await expect(menu.getByRole("menuitem", { name: "Sign Out" })).toHaveCount(0);
  await activate();
  await expect(menu).toBeHidden();
  await activate();
  const outside = page.getByRole("banner");
  if (isMobile) await outside.tap({ position: { x: 2, y: 2 } });
  else await outside.click({ position: { x: 2, y: 2 } });
  await expect(menu).toBeHidden();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("menu supports keyboard movement, Escape, Tab and focus restoration", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "Demo workspace, account menu" });
  const menu = page.getByRole("menu", { name: "Account actions" });
  const profile = menu.getByRole("menuitem", { name: "Profile & Goals" });
  const signIn = menu.getByRole("menuitem", { name: "Sign in" });
  await trigger.focus();
  await page.keyboard.press("ArrowUp");
  await expect(signIn).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(profile).toBeFocused();
  await page.keyboard.press("End");
  await expect(signIn).toBeFocused();
  await page.keyboard.press("Home");
  await expect(profile).toBeFocused();
  await page.keyboard.press("s");
  await expect(signIn).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Space");
  await expect(profile).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(menu).toBeHidden();
  expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe("BODY");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Shift+Tab");
  await expect(menu).toBeHidden();
  await expect(page.getByRole("button", { name: "Toggle color theme" })).toBeFocused();
});

test("profile action navigates and closes the account menu", async ({ page }) => {
  await page.getByRole("button", { name: "Demo workspace, account menu" }).click();
  await page.getByRole("menuitem", { name: "Profile & Goals" }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole("heading", { name: "Your journey. Your direction." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Demo workspace, account menu" })).toHaveAttribute("aria-expanded", "false");
});

test("keyboard users can activate a menu link with Space", async ({ page }) => {
  await page.getByRole("button", { name: "Demo workspace, account menu" }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "Profile & Goals" })).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page).toHaveURL(/\/profile$/);
});

for (const theme of ["light", "dark"] as const) {
  test(`open account menu fits the viewport and passes accessibility checks in ${theme} theme`, async ({ page }, testInfo) => {
    if (theme === "dark") await page.getByRole("button", { name: "Toggle color theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.getByRole("button", { name: "Demo workspace, account menu" }).click();
    const panel = page.locator(".account-menu-panel");
    await expect(panel).toBeVisible();
    const bounds = await panel.boundingBox();
    const viewport = page.viewportSize();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport!.width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
    await page.screenshot({ path: testInfo.outputPath(`account-menu-${theme}.png`) });
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("account menu stays within a narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.getByRole("button", { name: "Demo workspace, account menu" }).click();
  const panel = await page.locator(".account-menu-panel").boundingBox();
  expect(panel!.x).toBeGreaterThanOrEqual(0);
  expect(panel!.x + panel!.width).toBeLessThanOrEqual(320);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
});

test("keyboard focus reveals menu actions in a short viewport", async ({ page }) => {
  await page.setViewportSize({ width: 740, height: 220 });
  await page.getByRole("button", { name: "Demo workspace, account menu" }).focus();
  await page.keyboard.press("ArrowUp");
  const lastItem = page.getByRole("menuitem", { name: "Sign in" });
  await expect(lastItem).toBeFocused();
  const panel = page.locator(".account-menu-panel");
  expect(await panel.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  const panelBounds = (await panel.boundingBox())!;
  const itemBounds = (await lastItem.boundingBox())!;
  expect(itemBounds.y).toBeGreaterThanOrEqual(panelBounds.y);
  expect(itemBounds.y + itemBounds.height).toBeLessThanOrEqual(panelBounds.y + panelBounds.height);
  expect(itemBounds.y + itemBounds.height).toBeLessThanOrEqual(220);
});

test("long account names keep header controls inside a small tablet viewport", async ({ page }) => {
  await page.setViewportSize({ width: 481, height: 740 });
  // Exercise text sizing without creating a user or changing the demo session.
  await page.locator(".account-name").evaluate(element => { element.textContent = "Long account name for layout testing"; });
  const trigger = page.getByRole("button", { name: "Demo workspace, account menu" });
  const bounds = (await trigger.boundingBox())!;
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(481 - 16);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
});
