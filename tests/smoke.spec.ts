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

test.describe("Fleet Dispatch", () => {
  test("dispatcher can open the operational fleet controls", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Dispatcher/i }).click();

    const manageFleetButton = page.getByRole("button", { name: /จัดการรถ/ }).first();
    await expect(manageFleetButton).toBeVisible({ timeout: 15000 });
    await manageFleetButton.click();

    const dispatchDialog = page.getByRole("dialog");
    await expect(dispatchDialog).toHaveCSS("z-index", "1001");
    await expect(page.getByRole("heading", { name: "จัดการกำลังรถ" })).toBeVisible();
    const reportUnavailable = page.getByRole("button", { name: /รายงานรถไม่พร้อม/ });
    await expect(reportUnavailable).toBeEnabled();

    await reportUnavailable.click();

    await expect(dispatchDialog).not.toBeVisible();
    await expect(page.getByText(/ถูกพักจากคิวแล้ว รถคันถัดไปรับรอบทันที/)).toBeVisible();

    await manageFleetButton.click();
    await page.getByRole("tab", { name: "ประวัติ" }).click();
    await expect(page.getByRole("heading", { name: "ประวัติการจัดรถ" })).toBeVisible();
    await expect(page.getByText(/ไม่พร้อมออก/).first()).toBeVisible();

    await page.reload();
    await page.getByRole("button", { name: /Dispatcher/i }).click();
    await manageFleetButton.click();
    await page.getByRole("tab", { name: "ประวัติ" }).click();
    await expect(page.getByText(/ไม่พร้อมออก/).first()).toBeVisible();

    await page.getByRole("button", { name: "รีเซ็ตข้อมูล" }).click();
    await expect(page.getByText("ยืนยันรีเซ็ตข้อมูลทดสอบทั้งหมด?")).toBeVisible();
    await page.getByRole("button", { name: "ยืนยันรีเซ็ต" }).click();
    await expect(page.getByText("ยังไม่มีประวัติสำหรับวันที่และตัวกรองที่เลือก")).toBeVisible();

    await page.reload();
    await page.getByRole("button", { name: /Dispatcher/i }).click();
    await manageFleetButton.click();
    await page.getByRole("tab", { name: "ประวัติ" }).click();
    await expect(page.getByText("ยังไม่มีประวัติสำหรับวันที่และตัวกรองที่เลือก")).toBeVisible();
  });
});

test.describe("Route vehicle details", () => {
  test("keeps the vehicle list scrollable inside its dialog", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Dispatcher/i }).click();

    await page
      .getByRole("button", { name: /ดูรถในสาย/ })
      .first()
      .click();

    const vehicleDialog = page.getByRole("dialog");
    await expect(vehicleDialog).toBeVisible();
    await expect(page.getByRole("heading", { name: "รถและผู้โดยสารแต่ละสาย" })).toBeVisible();

    const scrollRegion = vehicleDialog.locator("div.overflow-y-auto");
    await expect(scrollRegion).toHaveCSS("overflow-y", "auto");

    const scrollTop = await scrollRegion.evaluate((element) => {
      element.scrollTop = 120;
      return element.scrollTop;
    });
    expect(scrollTop).toBeGreaterThan(0);
  });
});

test.describe("Daily driver assignment", () => {
  test("shows the daily plan and a manual reserve replacement", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Dispatcher/i }).click();

    await expect(page.getByRole("columnheader", { name: "สาย" })).toBeVisible();
    const assignmentRows = page.locator("tbody");
    await expect(assignmentRows.getByText("ตามแผน", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("RL1", { exact: true })).not.toBeVisible();

    await page.getByRole("button", { name: "Replace" }).first().click();
    await expect(page.getByRole("heading", { name: "Confirm Substitute Driver" })).toBeVisible();
    await page.getByRole("button", { name: "ยืนยันการย้าย" }).click();

    await expect(assignmentRows.getByText("สำรองแทน", { exact: true }).first()).toBeVisible();
    await expect(assignmentRows.getByText(/แทน /).first()).toBeVisible();
  });
});
