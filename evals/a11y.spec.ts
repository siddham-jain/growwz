import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { demo, fresh } from "./helpers";
import { saveMetrics } from "./metrics";

const paths = ["/", "/invest", "/learn", "/squads", "/you", "/payday", "/fno", "/stock/TRENT", "/new-stash"];
for (const path of paths) {
  test(`A · ${path}: no serious WCAG AA violations, tap targets ≥ 44px`, async ({ page }) => {
    await demo(page, path);
    await page.waitForTimeout(1200);
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const serious = axe.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
    const smallTargets = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("#scroller button, #scroller a, #scroller [role=switch], nav a")]
        .filter((element) => !element.closest("[data-term]") && !element.closest("p"))
        .map((element) => ({ label: (element.getAttribute("aria-label") || element.innerText).trim().slice(0, 40), rect: element.getBoundingClientRect() }))
        .filter(({ rect }) => rect.width > 0 && (rect.height < 44 || rect.width < 44))
        .map(({ label, rect }) => `${label} (${Math.round(rect.width)}×${Math.round(rect.height)})`),
    );
    saveMetrics("a11y", path === "/" ? "home" : path, { path, serious: serious.map((violation) => `${violation.id} ×${violation.nodes.length}`), smallTargets });
    expect(serious.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
    expect(smallTargets).toEqual([]);
  });
}

test("A · onboarding welcome passes axe", async ({ page }) => {
  await fresh(page);
  await page.waitForTimeout(800);
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(axe.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical").map((violation) => violation.id)).toEqual([]);
});
