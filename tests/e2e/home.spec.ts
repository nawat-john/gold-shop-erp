import { expect, test } from "@playwright/test";

test("หน้าแรกแสดงชื่อระบบ", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Gold Shop ERP" }),
  ).toBeVisible();
});

test("ทุก response มี x-request-id header (middleware ทำงาน)", async ({
  page,
}) => {
  const response = await page.goto("/");
  expect(response?.headers()["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/);
});
