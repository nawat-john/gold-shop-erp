// Setup project: login เป็น owner ครั้งเดียว แล้วเซฟ storageState ให้ spec อื่นใช้ร่วมกัน
// กันไม่ให้ suite เต็มยิง login ซ้ำจนชน rate limiter ต่อ username (10 ครั้ง/5 นาที)
import { expect, test as setup } from "@playwright/test";

const OWNER = {
  username: "owner",
  password: process.env.SEED_OWNER_PASSWORD ?? "ChangeMe-Owner-1",
};

export const OWNER_AUTH_FILE = "tests/e2e/.auth/owner.json";

setup("authenticate as owner", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="username"]', OWNER.username);
  await page.fill('input[name="password"]', OWNER.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/admin/);
  await page.context().storageState({ path: OWNER_AUTH_FILE });
});
