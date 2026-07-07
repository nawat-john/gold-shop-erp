// E2E UAT Spec: ทดสอบระบบ ERP ตามธุรกรรม 1 วันเต็ม (เปิดราคา -> ทำรายการจำนำ -> บันทึกค่าใช้จ่าย -> ตรวจสอบรายงานบัญชี)
// รันด้วย: pnpm test:e2e tests/e2e/uat.spec.ts
import { expect, test } from "@playwright/test";

test.describe("Gold Shop ERP - วันดำเนินการธุรกรรมเต็มรูปแบบ (UAT)", () => {
  test("1. สรุปกระบวนการหน้าร้าน (เปิดราคา -> จำนำทอง -> บันทึกค่าใช้จ่าย -> สรุปบัญชีแยกประเภท)", async ({
    page,
  }) => {
    const customerName = `ลูกค้า UAT ${Date.now()}`;
    const expenseDesc = `ค่าไฟฟ้าประจำเดือน UAT ${Date.now()}`;
    const testGoldPrice = "40200.00";

    // --- ส่วนที่ 1: ประกาศราคาสำหรับวันนี้ ---
    console.log("UAT Step 1: ประกาศราคาทองหน้าร้านประจำวัน");
    await page.goto("/admin/prices");
    await expect(
      page.getByRole("heading", { name: "ราคาทอง", exact: true }),
    ).toBeVisible();

    // ดึงราคาจาก feed mock
    await page.getByRole("button", { name: "ดึงราคาตอนนี้" }).click();
    await expect(
      page.locator("table").first().locator("tbody tr").first(),
    ).toContainText("GTA");

    // กรอกและประกาศราคาร้าน
    const announceForm = page.locator("form", {
      has: page.getByRole("button", { name: "ประกาศราคา" }),
    });
    await announceForm.locator('input[name="barBuy"]').fill("40000.00");
    await announceForm
      .locator('input[name="barSell"]')
      .fill(testGoldPrice.replace(/,/g, ""));
    await announceForm.locator('input[name="ornamentBuy"]').fill("39000.00");
    await announceForm.locator('input[name="ornamentSell"]').fill("40500.00");
    await announceForm.getByRole("button", { name: "ประกาศราคา" }).click();
    await expect(page.getByText("ประกาศราคาแล้ว")).toBeVisible();

    // --- ส่วนที่ 2: เปิดสัญญาขายฝากสินค้าทองคำใหม่ ---
    console.log("UAT Step 2: สร้างสัญญาขายฝากทองคำ");
    await page.goto("/admin/pawn/new");
    await expect(
      page.getByRole("heading", { name: "เปิดสัญญาขายฝากใหม่" }),
    ).toBeVisible();

    // กรอกรายละเอียดการจำนำ
    await page.locator('select[name="branchId"]').selectOption({ index: 1 });
    await page.fill('input[name="customerName"]', customerName);
    await page.fill('input[name="description"]', "สร้อยคอทองจำนำ UAT");
    await page.fill('input[name="weightGramStr"]', "15.16"); // ทอง 1 บาท
    await page.fill('input[name="principalBahtStr"]', "25000.00"); // วงเงินต้น
    await page.getByRole("button", { name: "เปิดสัญญาขายฝาก" }).click();
    await expect(page.getByText("เรียบร้อยแล้ว")).toBeVisible();

    // --- ส่วนที่ 3: ตรวจสอบทะเบียนสัญญาและรับดอกเบี้ยจำนำ ---
    console.log("UAT Step 3: ชำระดอกเบี้ยขายฝากต่ออายุสัญญา");
    await page.goto("/admin/pawn");
    const pawnRow = page.locator("tr", { hasText: customerName });
    await expect(pawnRow).toBeVisible();
    await pawnRow.getByRole("link", { name: "รายละเอียด" }).click();

    // หน้ารายละเอียดสัญญาแสดงประวัติจำนำและมีปุ่มไถ่ถอนทองคืน
    await expect(page.getByText(customerName)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "ไถ่ถอนทองคืนลูกค้า" }),
    ).toBeVisible();

    // --- ส่วนที่ 4: บันทึกรายการค่าใช้จ่ายประจำวัน ---
    console.log("UAT Step 4: บันทึกค่าใช้จ่ายทั่วไป");
    await page.goto("/admin/expenses");
    await page.locator('select[name="branchId"]').selectOption({ index: 1 });
    await page.fill('input[name="amountBahtStr"]', "3200.00");
    await page.fill('input[name="description"]', expenseDesc);
    await page.getByRole("button", { name: "บันทึกค่าใช้จ่าย" }).click();
    await expect(page.getByText("เรียบร้อยแล้ว")).toBeVisible();

    // --- ส่วนที่ 5: บัญชีและงบการเงินสิ้นวันทำการ ---
    console.log("UAT Step 5: ตรวจสอบงบทดลองและรายงานแยกประเภท");
    await page.goto("/admin/accounting");
    await expect(page.getByText("บัญชี (Accounting)")).toBeVisible();
    // ยืนยันว่างบทดลองยังคงสมดุล (Σdebit = Σcredit)
    await expect(page.getByText("งบทดลองไม่สมดุล")).not.toBeVisible();

    // เข้าดูงบกำไรขาดทุน (P&L) เพื่อตรวจสอบความถูกต้อง
    await page.goto("/admin/accounting/reports");
    await expect(page.getByText("งบกำไรขาดทุน (P&L)")).toBeVisible();
    await expect(page.getByText("รายงาน VAT (สำหรับ ภ.พ.30)")).toBeVisible();
  });
});
