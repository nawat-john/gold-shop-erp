// E2E full loop: admin สร้าง user → user แรก login ถูกบังคับเปลี่ยนรหัส →
// เปลี่ยนรหัส → เปิด 2FA (สแกน secret จริง คำนวณ TOTP จริง) → login รอบใหม่ต้องใช้ 2FA
import { expect, test, type Page } from "@playwright/test";
import { generate } from "otplib";

const OWNER = {
  username: "owner",
  password: process.env.SEED_OWNER_PASSWORD ?? "ChangeMe-Owner-1",
};

// user ใหม่ทุกรอบ กัน state ชนกันระหว่างรัน
const newUser = {
  username: `e2e${Date.now()}`,
  tempPassword: "Temp-Password-4321",
  realPassword: "Real-Password-8765",
};

async function login(
  page: Page,
  username: string,
  password: string,
  totpCode?: string,
) {
  await page.goto("/login");
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  if (totpCode !== undefined) {
    await page.fill('input[name="totpCode"]', totpCode);
    await page.click('button[type="submit"]');
  }
}

async function logout(page: Page) {
  await page.getByRole("button", { name: "ออกจากระบบ" }).click();
  await expect(page).toHaveURL(/\/login/);
}

test("วงจรชีวิตผู้ใช้เต็ม loop: สร้าง → บังคับเปลี่ยนรหัส → เปิด 2FA → login ด้วย 2FA", async ({
  page,
}) => {
  test.setTimeout(120_000);

  // ── 1) owner สร้างผู้ใช้ใหม่ผ่านหน้า admin
  await login(page, OWNER.username, OWNER.password);
  await expect(page).toHaveURL(/\/admin/);
  await page.goto("/admin/users");

  await page.fill('input[name="username"]', newUser.username);
  await page.fill('input[name="displayName"]', "พนักงานทดสอบ E2E");
  await page.fill('input[name="password"]', newUser.tempPassword);
  await page.selectOption('select[name="roleId"]', {
    label: "พนักงานขาย (CASHIER)",
  });
  await page.selectOption('select[name="branchId"]', {
    label: "สำนักงานใหญ่ (HQ)",
  });
  await page.getByRole("button", { name: "สร้างผู้ใช้" }).click();
  await expect(
    page.getByText(`สร้างผู้ใช้ ${newUser.username} แล้ว`),
  ).toBeVisible();
  await logout(page);

  // ── 2) user ใหม่ login ครั้งแรก → ถูกพาไปหน้าโปรไฟล์ + เตือนให้เปลี่ยนรหัส
  await login(page, newUser.username, newUser.tempPassword);
  await expect(page).toHaveURL(/\/admin\/profile/);
  await expect(page.getByText("กรุณาเปลี่ยนรหัสผ่านใหม่")).toBeVisible();

  // ── 3) เปลี่ยนรหัสผ่าน
  await page.fill('input[name="currentPassword"]', newUser.tempPassword);
  await page.fill('input[name="newPassword"]', newUser.realPassword);
  await page.getByRole("button", { name: "เปลี่ยนรหัสผ่าน" }).click();
  await expect(page.getByText("เปลี่ยนรหัสผ่านแล้ว")).toBeVisible();

  // ── 4) เปิด 2FA — อ่าน secret จาก otpauth URL แล้วคำนวณ TOTP จริง
  await page.getByRole("button", { name: "เริ่มตั้งค่า 2FA" }).click();
  const otpauthUrl = await page
    .getByTestId("otpauth-url")
    .textContent({ timeout: 10_000 });
  const secret = new URL(otpauthUrl!).searchParams.get("secret")!;
  expect(secret.length).toBeGreaterThan(10);

  await page.fill('input[name="code"]', await generate({ secret }));
  await page.getByRole("button", { name: "ยืนยันและเปิดใช้งาน" }).click();

  const codes = page.getByTestId("recovery-codes").locator("li");
  await expect(codes).toHaveCount(10);
  await logout(page);

  // ── 5) login รอบใหม่: รหัสอย่างเดียวไม่พอ ต้องกรอก TOTP
  await login(page, newUser.username, newUser.realPassword);
  await expect(
    page.getByText("รหัส 2FA (จากแอป Authenticator หรือ recovery code)"),
  ).toBeVisible();

  await page.fill('input[name="totpCode"]', await generate({ secret }));
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/admin/);
  await expect(page.getByText("พนักงานทดสอบ E2E").first()).toBeVisible();
});
