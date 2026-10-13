import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL: "http://localhost:3000",
    viewport: { width: 1440, height: 1000 },
    timezoneId: "Asia/Kolkata",
    trace: "retain-on-failure",
  },
  expect: { timeout: 15000 },
  workers: 1,
  timeout: 60000,
});
