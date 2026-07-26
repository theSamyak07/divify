/**
 * vitest.config.ts
 * Vitest configuration for the Divify project.
 */
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
    globals: true,
  },
});
