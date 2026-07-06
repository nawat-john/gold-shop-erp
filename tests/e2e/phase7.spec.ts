// E2E: บัญชี (Phase 7) — ดูงบทดลอง, บันทึกค่าใช้จ่าย, ดูรายงาน
// login เป็น owner ทำครั้งเดียวใน auth.setup.ts (storageState) — ที่นี่แค่ navigate
import { expect, test } from "@playwright/test";

test("ดูหน้าบัญชี -> เห็นผังบัญชีและงบทดลองสมดุล", async ({ page }) => {
  await page.goto("/admin/accounting");
  await expect(page.getByText("บัญชี (Accounting)")).toBeVisible();
  await expect(page.getByText("ใบสำคัญบัญชีล่าสุด")).toBeVisible();
  // ไม่ควรเห็น banner เตือนงบทดลองไม่สมดุล
  await expect(page.getByText("งบทดลองไม่สมดุล")).not.toBeVisible();
});

test("บันทึกค่าใช้จ่ายใหม่ -> เห็นในประวัติทันที", async ({ page }) => {
  const description = `ค่าใช้จ่ายทดสอบ E2E ${Date.now()}`;

  await page.goto("/admin/expenses");
  await page.locator('select[name="branchId"]').selectOption({ index: 1 });
  await page.fill('input[name="amountBahtStr"]', "1234.00");
  await page.fill('input[name="description"]', description);
  await page.getByRole("button", { name: "บันทึกค่าใช้จ่าย" }).click();
  await expect(page.getByText("เรียบร้อยแล้ว")).toBeVisible();

  await page.goto("/admin/expenses");
  await expect(page.getByText(description)).toBeVisible();
});

test("ดูรายงานบัญชีและรายงานคอมมิชชั่น", async ({ page }) => {
  await page.goto("/admin/accounting/reports");
  await expect(page.getByText("งบกำไรขาดทุน (P&L)")).toBeVisible();
  await expect(page.getByText("รายงาน VAT (สำหรับ ภ.พ.30)")).toBeVisible();

  await page.goto("/admin/commissions");
  await expect(page.getByText("ค่าคอมมิชชั่นพนักงาน")).toBeVisible();

  await page.goto("/admin/accounting/periods");
  await expect(page.getByRole("heading", { name: "งวดบัญชี" })).toBeVisible();
});
