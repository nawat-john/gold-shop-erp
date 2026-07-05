import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/server/**", "src/lib/**", "src/config/**"],
      exclude: ["**/*.test.ts"],
    },
  },
});
