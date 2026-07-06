import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      // auth.spec.ts / profile.spec.ts ทดสอบ login/logout เองจริง ๆ — รันแบบไม่ login ล่วงหน้า
      name: "chromium-no-auth",
      testMatch: /(auth|profile)\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // spec อื่น ๆ ใช้ session owner ที่ login ไว้แล้วจาก setup project (กัน login ซ้ำชน rate limiter)
      name: "chromium",
      testIgnore: /(auth|profile)\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/owner.json",
      },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
