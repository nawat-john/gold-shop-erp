// E2E: ขายฝากทอง (Phase 5) — เปิดสัญญาใหม่ -> เห็นในทะเบียน -> ไถ่ถอน
import { expect, test, type Page } from "@playwright/test";

const OWNER = {
  username: "owner",
  password: process.env.SEED_OWNER_PASSWORD ?? "ChangeMe-Owner-1",
};

async function loginAsOwner(page: Page) {
  await page.goto("/login");
  await page.fill('input[name="username"]', OWNER.username);
  await page.fill('input[name="password"]', OWNER.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/admin/);
}

test("เปิดสัญญาขายฝากใหม่ -> เห็นในทะเบียน -> ไถ่ถอนสำเร็จ", async ({
  page,
}) => {
  await loginAsOwner(page);

  const customerName = `ลูกค้าทดสอบ E2E ${Date.now()}`;

  // 1) เปิดสัญญาขายฝากใหม่
  await page.goto("/admin/pawn/new");
  await page.locator('select[name="branchId"]').selectOption({ index: 1 });
  await page.fill('input[name="customerName"]', customerName);
  await page.fill('input[name="description"]', "สร้อยคอทองทดสอบ E2E");
  await page.fill('input[name="weightGramStr"]', "15.16");
  await page.fill('input[name="principalBahtStr"]', "10000.00");
  await page.getByRole("button", { name: "เปิดสัญญาขายฝาก" }).click();
  await expect(page.getByText("เปิดสัญญาขายฝาก")).toBeVisible();
  await expect(page.getByText("เรียบร้อยแล้ว")).toBeVisible();

  // 2) เห็นสัญญาในทะเบียนหน้ารายการ
  await page.goto("/admin/pawn");
  const row = page.locator("tr", { hasText: customerName });
  await expect(row).toBeVisible();
  await row.getByRole("link", { name: "รายละเอียด" }).click();

  // 3) หน้ารายละเอียดแสดงข้อมูลลูกค้าและปุ่มไถ่ถอน
  await expect(page.getByText(customerName)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "ไถ่ถอนทองคืนลูกค้า" }),
  ).toBeVisible();

  // 4) ไถ่ถอนทองคืนลูกค้า — ปุ่มดำเนินการทั้งหมดหายไปหลังสถานะเปลี่ยนเป็น REDEEMED
  // (ข้อความสำเร็จหายไปพร้อมกันเพราะ section ถูกซ่อนเมื่อ status ไม่ใช่ ACTIVE แล้ว)
  await page.getByRole("button", { name: "ไถ่ถอนทองคืนลูกค้า" }).click();
  await expect(page.getByText("REDEEMED")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "ไถ่ถอนทองคืนลูกค้า" }),
  ).not.toBeVisible();
});
