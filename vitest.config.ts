import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/**/*.integration.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@crunchrr/validation": new URL(
        "./packages/validation/src/index.ts",
        import.meta.url,
      ).pathname,
      "@crunchrr/utils": new URL(
        "./packages/utils/src/index.ts",
        import.meta.url,
      ).pathname,
      "@crunchrr/database": new URL(
        "./packages/database/src/index.ts",
        import.meta.url,
      ).pathname,
    },
  },
});
