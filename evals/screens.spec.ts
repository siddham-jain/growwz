import { test } from "@playwright/test";
import { demo, fresh } from "./helpers";

const out = (name: string) => `docs/screens/${name}.png`;

test("capture key screens", async ({ page }) => {
  await fresh(page);
  await page.waitForTimeout(600);
  await page.screenshot({ path: out("01-welcome") });
  await page.getByRole("button", { name: /Set me up/ }).click();
  await page.getByLabel("Your name").fill("Arjun");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /First job/ }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: out("02-vibe") });
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /A trip/ }).click();
  await page.getByRole("button", { name: /Freedom fund/ }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: out("03-goals") });
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: out("04-gut-check") });
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: out("05-amount") });
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: out("06-starter-plan") });
  await page.getByRole("button", { name: /Looks good/ }).click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: out("07-home-new") });

  await demo(page);
  await page.waitForTimeout(800);
  await page.screenshot({ path: out("08-home-demo") });
  await page.screenshot({ path: out("08b-home-demo-full"), fullPage: false });
  await page.locator("#scroller").evaluate((element) => element.scrollTo(0, 700));
  await page.waitForTimeout(300);
  await page.screenshot({ path: out("09-home-scrolled") });

  await page.getByRole("button", { name: /Freedom fund/ }).first().click();
  await page.waitForTimeout(1100);
  await page.screenshot({ path: out("10-stash-detail") });
  await page.locator("#scroller").evaluate((element) => element.scrollTo(0, 650));
  await page.waitForTimeout(300);
  await page.screenshot({ path: out("11-stash-detail-plan") });
  await page.getByRole("button", { name: "Expense ratio" }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: out("12-decode") });

  await page.goto("/#/you");
  await page.getByRole("button", { name: /Simulate payday/ }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: out("13-payday-notification") });
  await page.goto("/#/payday");
  await page.waitForTimeout(400);
  await page.screenshot({ path: out("14-payday-split") });

  await page.goto("/#/you");
  await page.getByRole("button", { name: /Simulate a 4% market dip/ }).click();
  await page.waitForTimeout(7000);
  await page.screenshot({ path: out("15-dip-coach") });
  await page.getByRole("button", { name: /Freedom fund/ }).first().click();
  await page.getByRole("button", { name: "Withdraw" }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: out("16-panic-check") });

  await page.goto("/#/new-stash");
  await page.getByRole("button", { name: /New gadget/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: out("17-new-stash-plan") });

  await page.goto("/#/invest");
  await page.waitForTimeout(400);
  await page.screenshot({ path: out("18-invest") });
  await page.goto("/#/stock/TRENT");
  await page.waitForTimeout(400);
  await page.screenshot({ path: out("19-stock") });

  await page.goto("/#/fno");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: out("20-fno-reality") });
  await page.getByRole("button", { name: /One-time check/ }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: out("21-fno-quiz") });

  await page.goto("/#/learn");
  await page.waitForTimeout(400);
  await page.screenshot({ path: out("22-learn") });
  await page.goto("/#/learn/dips");
  await page.waitForTimeout(600);
  await page.screenshot({ path: out("23-byte") });

  await page.goto("/#/squads");
  await page.waitForTimeout(600);
  await page.screenshot({ path: out("24-squads") });
  await page.goto("/#/you");
  await page.waitForTimeout(400);
  await page.screenshot({ path: out("25-you") });

  await page.goto("/#/invest");
  await page.getByTestId("spice-pot").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({ path: out("18b-invest-spice-pot") });

  await fresh(page);
  await page.getByRole("button", { name: /Set me up/ }).click();
  await page.getByLabel("Your name").fill("Sana");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /Freelancer/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /A trip/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: out("05b-amount-freelancer") });
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /Looks good/ }).click();
  await page.goto("/#/you");
  await page.getByRole("button", { name: /Simulate payday/ }).click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: out("13b-freelancer-notification") });
  await page.getByTestId("notice").click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: out("14b-freelancer-payment-split") });
});
