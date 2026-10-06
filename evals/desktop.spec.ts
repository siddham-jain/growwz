import { test } from "@playwright/test";
import { demo } from "./helpers";

test.use({ viewport: { width: 1440, height: 920 }, deviceScaleFactor: 1, hasTouch: false });

test("capture desktop reviewer shell", async ({ page }) => {
  await demo(page);
  await page.waitForTimeout(900);
  await page.screenshot({ path: "docs/screens/00-desktop.png" });
});
