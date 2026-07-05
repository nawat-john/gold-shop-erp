// Integration tests: ใช้ Postgres จริงผ่าน Testcontainers — ต้องมี Docker รันอยู่
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/integration/**/*.test.ts"],
    testTimeout: 120_000,
    hookTimeout: 180_000,
    // container ต่อ test file — รันทีละไฟล์กัน resource แย่งกัน
    fileParallelism: false,
  },
});
