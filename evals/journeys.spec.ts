import { expect, test } from "@playwright/test";
import { demo, fresh, tapCounter } from "./helpers";
import { saveMetrics } from "./metrics";

test("J1 · first-timer goes from install to first ₹100 in ≤ 12 taps", async ({ page }) => {
  const user = tapCounter();
  await fresh(page);
  await user.tap(page.getByRole("button", { name: /Set me up/ }));
  await page.getByLabel("Your name").fill("Riya");
  await user.tap(page.getByRole("button", { name: "Continue" }));
  await user.tap(page.getByRole("button", { name: /First job/ }));
  await user.tap(page.getByRole("button", { name: "Continue" }));
  await user.tap(page.getByRole("button", { name: "Continue" }));
  await user.tap(page.getByRole("button", { name: /A trip/ }));
  await user.tap(page.getByRole("button", { name: "Continue" }));
  await user.tap(page.getByRole("button", { name: "Continue" }));
  await user.tap(page.getByRole("button", { name: "Continue" }));
  await expect(page.getByTestId("starter-plan")).toContainText("Emergency cushion");
  await user.tap(page.getByRole("button", { name: /Looks good/ }));
  await user.tap(page.getByTestId("first-invest"));
  await user.tap(page.getByRole("button", { name: /Pay ₹100 via UPI/ }));
  await expect(page.getByTestId("celebration")).toBeVisible({ timeout: 5000 });
  saveMetrics("journeys", "firstInvestment", { taps: user.count });
  expect(user.count).toBeLessThanOrEqual(12);
});

test("J2 · starter plan never promises a goal it can't hit on time", async ({ page }) => {
  await fresh(page);
  await page.getByRole("button", { name: /Set me up/ }).click();
  await page.getByLabel("Your name").fill("Arjun");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /Student/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /New gadget/ }).click();
  await page.getByRole("button", { name: /Moving out/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Monthly amount").fill("500");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /Looks good/ }).click();
  await page.getByTestId("first-invest").click();
  await page.getByRole("button", { name: /Pay ₹100 via UPI/ }).click();
  await page.getByRole("button", { name: "Let's go" }).click();
  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.getByText(/On track|Reaches goal/).first()).toBeVisible();
  const statuses = await page.locator("text=/On track|Reaches goal/").allInnerTexts();
  expect(statuses.every((status) => status.includes("On track"))).toBe(true);
  saveMetrics("journeys", "honestPlan", { taps: 0 });
});

test("J3 · payday split invests in one tap from the notification", async ({ page }) => {
  const user = tapCounter();
  await demo(page, "/you");
  await page.getByRole("button", { name: /Simulate payday/ }).click();
  await user.tap(page.getByTestId("notice"));
  await expect(page.getByTestId("payday")).toBeVisible();
  await user.tap(page.getByTestId("confirm-split"));
  await expect(page.getByRole("status")).toContainText("Streak +1");
  saveMetrics("journeys", "paydaySplit", { taps: user.count });
  expect(user.count).toBeLessThanOrEqual(2);
});

test("J4 · in a dip, Dip Coach appears and selling long-term money is intercepted", async ({ page }) => {
  await demo(page, "/you");
  await page.getByRole("button", { name: /Simulate a 4% market dip/ }).click();
  await expect(page.getByTestId("dip-coach")).toBeVisible();
  await page.getByRole("button", { name: /Freedom fund/ }).first().click();
  await page.getByRole("button", { name: "Withdraw" }).click();
  await expect(page.getByTestId("panic-check")).toBeVisible();
  await page.getByRole("button", { name: "Keep it invested" }).click();
  await expect(page.getByRole("status")).toContainText("Nothing changed");
  saveMetrics("journeys", "dipIntercept", { taps: 0 });
});

test("J5 · short-term money is never intercepted (no friction where there's no risk)", async ({ page }) => {
  await demo(page, "/you");
  await page.getByRole("button", { name: /Simulate a 4% market dip/ }).click();
  await page.getByRole("button", { name: /Goa with the gang/ }).first().click();
  await page.getByRole("button", { name: "Withdraw" }).click();
  await expect(page.getByTestId("panic-check")).toHaveCount(0);
  await expect(page.getByLabel(/Amount \(up to/)).toBeVisible();
  saveMetrics("journeys", "noFalseFriction", { taps: 0 });
});

test("J6 · F&O is gated by reality check, quiz and a 24h cool-off", async ({ page }) => {
  await demo(page, "/invest");
  await page.getByTestId("fno-tile").click();
  await expect(page.getByTestId("reality-check")).toContainText("91 of every 100");
  await page.getByRole("button", { name: /One-time check/ }).click();
  await page.getByRole("button", { name: "Close to ₹0" }).click();
  await page.getByRole("button", { name: "₹15 lakh or more" }).click();
  await page.getByRole("button", { name: "Stop and review what happened" }).click();
  await expect(page.getByTestId("fno-result")).toContainText("3/3");
  await page.getByTestId("start-cooloff").click();
  await expect(page.getByTestId("cooloff-timer")).toContainText(/23:59|24:00/);
  await page.goto("/#/invest");
  await expect(page.getByTestId("fno-tile")).toContainText("Cooling off");
  saveMetrics("journeys", "fnoGate", { taps: 0 });
});

test("J7 · calm mode hides daily P&L by default, peek reveals it", async ({ page }) => {
  await demo(page);
  await expect(page.getByTestId("day-change")).toHaveCount(0);
  await page.getByRole("button", { name: /Peek at today's change/ }).click();
  await expect(page.getByTestId("day-change")).toBeVisible();
  saveMetrics("journeys", "calmMode", { taps: 0 });
});

test("J8 · any jargon on a fund is one tap from a plain-language decode", async ({ page }) => {
  await demo(page);
  await page.getByRole("button", { name: /Freedom fund/ }).first().click();
  await page.getByRole("button", { name: "Expense ratio" }).click();
  await expect(page.getByTestId("decode-sheet")).toContainText("yearly fee");
  await page.goto("/#/");
  await expect(page.getByTestId("decode-sheet")).toHaveCount(0);
  saveMetrics("journeys", "decode", { taps: 1 });
});

test("J9 · a Byte can be finished and its quiz marks it done", async ({ page }) => {
  await demo(page, "/learn/dips");
  for (let card = 0; card < 4; card++) await page.getByTestId("byte-next").click();
  await expect(page.getByTestId("byte-quiz")).toBeVisible();
  await page.getByRole("button", { name: /Stay put/ }).click();
  await page.getByTestId("byte-done").click();
  await page.goto("/#/learn");
  await expect(page.getByText(/3 of 6 Bytes done/)).toBeVisible();
  saveMetrics("journeys", "byte", { taps: 6 });
});

test("J10 · new stash picks a fund from the horizon and creates it", async ({ page }) => {
  await demo(page, "/new-stash");
  await page.getByRole("button", { name: /Freedom fund/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByTestId("new-stash-plan")).toContainText("India's top 50 companies");
  await page.getByTestId("create-stash").click();
  await expect(page.getByTestId("fund-card")).toContainText("Nifty 50 Index Fund");
  saveMetrics("journeys", "newStash", { taps: 4 });
});

test("J11 · irregular income gets a %-of-this-payment split, with an equal-weight way out", async ({ page }) => {
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
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /Looks good/ }).click();
  await page.goto("/#/you");
  await page.getByRole("button", { name: /Simulate payday/ }).click();
  await expect(page.getByTestId("notice")).toContainText("from a client");
  await page.getByTestId("notice").click();
  await expect(page.getByRole("group", { name: "Share of this payment" })).toBeVisible();
  await page.getByRole("button", { name: "15%" }).click();
  await expect(page.getByTestId("confirm-split")).toContainText("₹2,700");
  const way = await page.getByRole("button", { name: "Not now" }).boundingBox();
  const invest = await page.getByTestId("confirm-split").boundingBox();
  expect(way?.height).toBe(invest?.height);
  saveMetrics("journeys", "irregularIncome", { taps: 3 });
});

test("J12 · squads never reveal a friend's rupee amount or target", async ({ page }) => {
  await demo(page, "/squads");
  const text = await page.getByTestId("squad-members").innerText();
  expect(text).not.toMatch(/₹/);
  await expect(page.getByTestId("squad-card")).not.toContainText(/₹\d/);
  saveMetrics("journeys", "squadPrivacy", { taps: 0 });
});

test("J13 · projections are shown as a range, never a single precise rupee figure", async ({ page }) => {
  await demo(page);
  await page.getByRole("button", { name: /Freedom fund/ }).first().click();
  await expect(page.getByTestId("projection-range")).toContainText("–");
  await expect(page.getByText(/you'll likely have/i)).toHaveCount(0);
  saveMetrics("journeys", "projectionRange", { taps: 0 });
});
