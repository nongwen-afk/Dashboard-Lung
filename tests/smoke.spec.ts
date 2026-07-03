import { test, expect } from "@playwright/test";

test.describe("Dashboard Smoke Test", () => {
  test("mock authentication and basic navigation", async ({ page }) => {
    // 1. Open root
    await page.goto("/");

    // 2. Confirm mock login screen renders
    // Wait for the specific mock auth button "Dispatcher"
    const loginButton = page.getByRole("button", { name: /Dispatcher/i });
    await expect(loginButton).toBeVisible();

    // 3. Click Dispatcher
    await loginButton.click();

    // 4. Confirm Dashboard renders
    // Wait for the sidebar "Dashboard" link to be visible, ensuring we entered the app
    await expect(page.getByRole("link", { name: /Dashboard/i }).first()).toBeVisible({
      timeout: 15000,
    });

    // 5. Navigate to Drivers page (Thai label: คนขับ)
    const driversLink = page.getByRole("link", { name: /คนขับ/i });
    await driversLink.click();

    // 6. Confirm Drivers page renders (by checking for standard Next.js routing success / no crash)
    await expect(page).toHaveURL(/.*\/drivers/);

    // 7. Navigate to Analytics page (Thai label: วิเคราะห์)
    const analyticsLink = page.getByRole("link", { name: /วิเคราะห์/i });
    await analyticsLink.click();

    // 8. Confirm Analytics page renders
    await expect(page).toHaveURL(/.*\/analytics/);

    // 9. Confirm no obvious Next.js red error overlay
    const errorOverlay = page.locator("nextjs-portal");
    await expect(errorOverlay).not.toBeVisible();
  });
});
