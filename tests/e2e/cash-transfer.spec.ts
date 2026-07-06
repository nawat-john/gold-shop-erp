// E2E: โอนเงินสดข้ามสาขา (Phase 8) — สร้างสาขาที่ 2, สร้างใบโอนเงินสด, ยกเลิก
// login เป็น owner ทำครั้งเดียวใน auth.setup.ts (storageState) — ที่นี่แค่ navigate
// หมายเหตุ: ขั้นตอน "ยืนยันส่งเงิน" ต้อง step-up PIN ของผู้อนุมัติคนละคน (maker-checker)
// ซึ่งไม่มี self-service UI สำหรับตั้ง approval PIN ให้ผู้ใช้ที่สอง — เหมือนกับ flow
// step-up อื่นๆ (void/stock adjust/pawn forfeit) ที่ไม่ถูกทดสอบผ่าน E2E เช่นกัน
// ครอบคลุมด้วย integration test (cash-transfer-flow.test.ts) แทน ที่นี่ทดสอบเฉพาะ
// การสร้าง (DRAFT) และยกเลิก ซึ่งไม่ต้องการ step-up approval
import { expect, test } from "@playwright/test";

test("สร้างใบโอนเงินสดข้ามสาขา -> เห็นสถานะ DRAFT -> ยกเลิกได้", async ({
  page,
}) => {
  const branchCode = `CTE${Date.now().toString().slice(-6)}`;

  // สร้างสาขาที่ 2 เพื่อให้มีปลายทางสำหรับโอนเงิน
  await page.goto("/admin/branches");
  await page.fill('input[name="code"]', branchCode);
  await page.fill('input[name="name"]', `สาขาทดสอบ E2E ${branchCode}`);
  await page.getByRole("button", { name: "สร้างสาขา" }).click();
  await expect(page.getByText(`สร้างสาขา ${branchCode} แล้ว`)).toBeVisible();

  // สร้างใบโอนเงินสด
  await page.goto("/admin/cash-transfers");
  await expect(
    page.getByRole("heading", { name: "โอนเงินสดข้ามสาขา (Cash Transfer)" }),
  ).toBeVisible();

  await page
    .locator('select[name="fromBranchId"]')
    .selectOption({ label: "สำนักงานใหญ่ (HQ)" });
  await page
    .locator('select[name="toBranchId"]')
    .selectOption({ label: `สาขาทดสอบ E2E ${branchCode} (${branchCode})` });
  await page.fill('input[name="amountBahtStr"]', "12345.00");
  await page.getByRole("button", { name: "สร้างใบโอนเงินสด" }).click();
  await expect(page.getByText(/สร้างใบโอนเงินสด.*เรียบร้อยแล้ว/)).toBeVisible();

  // ต้องเห็นรายการใหม่สถานะ DRAFT พร้อมยอดเงินถูกต้อง
  // ใช้ .bg-gray-50 เพราะเป็น class เฉพาะของ div รายการแต่ละใบ (ไม่ใช่ div ครอบรายการทั้งหมด)
  const row = page.locator("div.bg-gray-50").filter({ hasText: branchCode });
  await expect(row).toHaveCount(1);
  await expect(row).toContainText("DRAFT");
  await expect(row).toContainText("12,345.00");

  // ยกเลิกได้จากสถานะ DRAFT โดยไม่ต้องใช้ PIN
  await row.getByRole("button", { name: "ยกเลิก" }).click();
  await expect(
    page.locator("div.bg-gray-50").filter({ hasText: branchCode }),
  ).toContainText("CANCELLED");
});
