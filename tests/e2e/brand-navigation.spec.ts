import { expect, test } from "@playwright/test";

test("workspace logo returns to the dashboard and closes mobile navigation", async ({ page, isMobile }) => {
  await page.goto("/profile");
  if (isMobile) await page.getByRole("button", { name: "Open navigation" }).click();
  const brand = page.getByRole("link", { name: "Aster. IELTS Academic dashboard", exact: true });
  await expect(brand).toHaveAttribute("href", "/dashboard");
  await brand.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "A little focus. A brighter future.", level: 1 })).toBeVisible();
  if (isMobile) await expect(page.getByRole("dialog", { name: "Workspace navigation" })).toBeHidden();
});

test("public logo continues to navigate to the landing page", async ({ page }) => {
  await page.goto("/faq");
  const brand = page.getByRole("banner").getByRole("link", { name: "Aster. IELTS Academic home", exact: true });
  await expect(brand).toHaveAttribute("href", "/");
  await brand.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Big ambitions.");
});
