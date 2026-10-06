import type { Locator, Page } from "@playwright/test";

export async function fresh(page: Page) {
  await page.goto("/#/welcome");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

export async function demo(page: Page, path = "/") {
  await page.goto("/#/welcome");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Skip to a demo account" }).click();
  if (path !== "/") await page.goto(`/#${path}`);
}

// counts every tap the user makes so journeys can be scored on effort
export function tapCounter() {
  let taps = 0;
  return {
    tap: async (locator: Locator) => {
      taps += 1;
      await locator.click();
    },
    get count() {
      return taps;
    },
  };
}
