// E2E: Gold Price Engine — ดึง feed, ประกาศราคา, price board แสดงราคา
// login เป็น owner ทำครั้งเดียวใน auth.setup.ts (storageState) — ที่นี่แค่ navigate
import { expect, test } from "@playwright/test";

test("ดึง feed → ประกาศราคา → price board แสดงราคาที่ประกาศ", async ({
  page,
}) => {
  await page.goto("/admin/prices");

  // 1) ดึงราคาจาก feed (mock)
  await page.getByRole("button", { name: "ดึงราคาตอนนี้" }).click();
  await expect(
    page.locator("table").first().locator("tbody tr").first(),
  ).toContainText("GTA");

  // 2) ฟอร์มประกาศถูก prefill จาก feed — แก้ราคาขายออกรูปพรรณเป็นค่าที่จำได้
  const ornamentSell = "59,750.00";
  const announceForm = page.locator("form", {
    has: page.getByRole("button", { name: "ประกาศราคา" }),
  });
  await announceForm
    .locator('input[name="ornamentSell"]')
    .fill(ornamentSell.replace(/,/g, ""));
  await announceForm.getByRole("button", { name: "ประกาศราคา" }).click();
  await expect(page.getByText("ประกาศราคาแล้ว")).toBeVisible();

  // 3) ราคาปัจจุบันบนหน้า admin อัปเดต
  await expect(
    page.getByText("ราคาประกาศปัจจุบันของร้าน").locator(".."),
  ).toContainText(ornamentSell);

  // 4) price board (สาธารณะ ไม่ต้อง login) แสดงราคาเดียวกัน
  await page.context().clearCookies();
  await page.goto("/price-board");
  await expect(page.getByText("ทองรูปพรรณ 96.5%")).toBeVisible();
  await expect(page.locator("main")).toContainText(ornamentSell);
});

test("กราฟราคาย้อนหลังแสดงเมื่อมี feed พอ", async ({ page }) => {
  await page.goto("/admin/prices");

  // มี svg กราฟ หรือข้อความบอกว่าข้อมูลไม่พอ (feed เดียว) — อย่างใดอย่างหนึ่งต้องปรากฏ
  const chart = page.locator("figure svg");
  const notEnough = page.getByText("ยังมีข้อมูลไม่พอสำหรับกราฟ");
  await expect(chart.or(notEnough).first()).toBeVisible();
});
