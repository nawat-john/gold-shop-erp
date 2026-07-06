// E2E: CRM ลูกค้า + ออมทอง + งานช่าง (Phase 6) — happy path หลักต่อโมดูล
// login เป็น owner ทำครั้งเดียวใน auth.setup.ts (storageState) — ที่นี่แค่ navigate
import { expect, test } from "@playwright/test";

test("ลงทะเบียนลูกค้าใหม่ -> เห็นในทะเบียน -> ดูรายละเอียด", async ({
  page,
}) => {
  const customerName = `ลูกค้าทดสอบ E2E ${Date.now()}`;

  await page.goto("/admin/customers/new");
  await page.fill('input[name="name"]', customerName);
  await page.fill('input[name="phone"]', "0812345678");
  await page.getByRole("button", { name: "ลงทะเบียนลูกค้า" }).click();
  await expect(page.getByText("เรียบร้อยแล้ว")).toBeVisible();

  await page.goto("/admin/customers");
  const row = page.locator("tr", { hasText: customerName });
  await expect(row).toBeVisible();
  await row.getByRole("link", { name: "รายละเอียด" }).click();
  await expect(page.getByText(customerName)).toBeVisible();
});

test("เปิดบัญชีออมทอง -> ฝากเงิน -> ปิดบัญชีรับเงินคืน", async ({ page }) => {
  await page.goto("/admin/savings");
  await page.locator('select[name="branchId"]').selectOption({ index: 1 });
  await page.locator('select[name="accountType"]').selectOption("CASH_SAVINGS");
  await page.getByRole("button", { name: "เปิดบัญชี" }).click();
  await expect(page.getByText("เรียบร้อยแล้ว")).toBeVisible();

  await page.goto("/admin/savings");
  await page
    .locator("tbody tr")
    .first()
    .getByRole("link", { name: "รายละเอียด" })
    .click();

  await page.fill('input[name="amountBahtStr"]', "1000.00");
  await page.getByRole("button", { name: "รับฝากเงิน" }).click();
  await expect(page.getByText("รับฝากเงินเรียบร้อยแล้ว")).toBeVisible();

  await page
    .getByRole("button", { name: "ปิดบัญชีรับเงินคืน (ยกเลิก)" })
    .click();
  await expect(page.getByText("CLOSED_CASH")).toBeVisible();
});

test("รับงานซ่อม -> เริ่มงาน -> เสร็จ -> ส่งมอบ", async ({ page }) => {
  const description = `ซ่อมสร้อยคอทดสอบ E2E ${Date.now()}`;

  await page.goto("/admin/work-orders");
  await page.locator('select[name="branchId"]').selectOption({ index: 1 });
  await page.locator('select[name="type"]').selectOption("REPAIR");
  await page.fill('textarea[name="description"]', description);
  await page.getByRole("button", { name: "รับงาน" }).click();
  await expect(page.getByText("เรียบร้อยแล้ว")).toBeVisible();

  // คิวงานเรียงแบบ FIFO (งานเก่าสุดก่อน) ไม่ใช่งานล่าสุดก่อน — หาแถวจากคำอธิบายที่ไม่ซ้ำแทน
  await page.goto("/admin/work-orders");
  await page
    .locator("tr", { hasText: description })
    .getByRole("link", { name: "รายละเอียด" })
    .click();

  // ปุ่ม/ข้อความสำเร็จชั่วคราวจะหายไปทันทีที่หน้า revalidate เพราะ section
  // ถูกซ่อนเมื่อสถานะเปลี่ยน — เช็คสถานะ/ปุ่มขั้นถัดไปที่ปรากฏแทน
  await page.getByRole("button", { name: "เริ่มดำเนินงาน" }).click();
  await expect(page.getByText("IN_PROGRESS")).toBeVisible();

  await page.getByRole("button", { name: "งานเสร็จสมบูรณ์" }).click();
  await expect(page.getByText("COMPLETED")).toBeVisible();

  await page.getByRole("button", { name: "ส่งมอบให้ลูกค้า" }).click();
  await expect(page.getByText("DELIVERED")).toBeVisible();
});
