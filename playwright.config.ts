import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./evals",
  timeout: 60_000,
  fullyParallel: true,
  reporter: [["list"], ["json", { outputFile: "evals/results/report.json" }]],
  use: {
    baseURL: "http://localhost:4173",
    channel: "chrome",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
  },
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://localhost:4173",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
