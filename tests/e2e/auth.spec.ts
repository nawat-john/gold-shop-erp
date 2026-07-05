// E2E: login flow กับ dev server + DB จริง (ต้อง docker compose up + seed แล้ว)
import { expect, test } from "@playwright/test";

const OWNER = {
  username: "owner",
  password: process.env.SEED_OWNER_PASSWORD ?? "ChangeMe-Owner-1",
};

test("เข้า /admin โดยไม่ login → ถูกเด้งไปหน้า login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
});

test("login รหัสผิด → แสดง error ไม่เข้าให้", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="username"]', OWNER.username);
  await page.fill('input[name="password"]', "wrong-password-123");
  await page.click('button[type="submit"]');

  await expect(page.locator('p[role="alert"]')).toContainText("ไม่ถูกต้อง");
  await expect(page).toHaveURL(/\/login/);
});

test("login สำเร็จ → เข้า /admin เห็นชื่อและเมนูครบ แล้ว logout ได้", async ({
  page,
}) => {
  await page.goto("/login");
  await page.fill('input[name="username"]', OWNER.username);
  await page.fill('input[name="password"]', OWNER.password);
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/\/admin/);
  await expect(page.getByText("เจ้าของร้าน").first()).toBeVisible();
  // OWNER เห็นทุกเมนูรวม Audit Log
  await expect(page.getByRole("link", { name: "Audit Log" })).toBeVisible();

  await page.getByRole("button", { name: "ออกจากระบบ" }).click();
  await expect(page).toHaveURL(/\/login/);

  // logout แล้วต้องกลับเข้า /admin ไม่ได้ (session ถูก revoke จริง)
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
});

test("หน้า admin/users แสดงตารางผู้ใช้ (ผ่าน permission check)", async ({
  page,
}) => {
  await page.goto("/login");
  await page.fill('input[name="username"]', OWNER.username);
  await page.fill('input[name="password"]', OWNER.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/admin/);

  await page.getByRole("link", { name: "ผู้ใช้" }).click();
  await expect(page).toHaveURL(/\/admin\/users/);
  await expect(page.locator("td", { hasText: "owner" }).first()).toBeVisible();
});
