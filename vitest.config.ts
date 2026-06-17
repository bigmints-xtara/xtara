import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setup-tests.ts",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "json"],
      include: ["src/lib/firebase/**/*.ts"],
      thresholds: {
        "src/lib/firebase": {
          lines: 70,
          functions: 70,
          branches: 70,
          statements: 70,
        },
      },
      exclude: [
        "src/lib/firebase/firebase.ts",
      ],
    },
  },
});
