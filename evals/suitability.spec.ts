import { expect, test } from "@playwright/test";
import { futureValue, project, recommendBucket, requiredMonthly, type Risk } from "../src/lib/plan";
import { bucketMeta } from "../src/data/funds";
import { templates } from "../src/data/templates";
import { monthlyEquivalent, starterPlan, type Profile } from "../src/lib/store";
import { saveMetrics } from "./metrics";

const risks: Risk[] = ["cautious", "steady", "bold"];

test("S1 · no money needed within 2 years is ever put in equity-heavy funds", () => {
  let cases = 0;
  for (const risk of risks) {
    for (let months = 1; months < 24; months++) {
      expect(recommendBucket(months, risk, false).bucket).toBe("steady");
      cases++;
    }
  }
  saveMetrics("suitability", "s1", { cases });
});

test("S2 · emergency money always stays in the steady bucket", () => {
  for (const risk of risks) for (let months = 1; months <= 240; months++) expect(recommendBucket(months, risk, true).bucket).toBe("steady");
});

test("S3 · growth bucket only for horizons of 3+ years, even for bold users", () => {
  for (const risk of risks) {
    for (let months = 1; months <= 240; months++) {
      if (recommendBucket(months, risk, false).bucket === "growth") expect(months).toBeGreaterThanOrEqual(36);
    }
  }
});

test("S4 · cautious users never get a riskier bucket than steady users", () => {
  const order = { steady: 0, balanced: 1, growth: 2 };
  for (let months = 1; months <= 240; months++) {
    expect(order[recommendBucket(months, "cautious", false).bucket]).toBeLessThanOrEqual(order[recommendBucket(months, "steady", false).bucket]);
  }
});

test("S5 · the suggested monthly amount actually reaches the goal", () => {
  for (const bucket of ["steady", "balanced", "growth"] as const) {
    for (const months of [6, 12, 36, 120]) {
      const monthly = requiredMonthly(100000, 0, months, bucketMeta[bucket].rate);
      expect(futureValue(0, monthly, months, bucketMeta[bucket].rate)).toBeGreaterThan(99_900);
    }
  }
});

test("S6 · projections always show a range: tough ≤ likely ≤ good", () => {
  for (const bucket of ["steady", "balanced", "growth"] as const) {
    const projection = project(5000, 1000, 60, bucket);
    expect(projection.low).toBeLessThanOrEqual(projection.typical);
    expect(projection.typical).toBeLessThanOrEqual(projection.high);
  }
});

test("S7 · starter plan adds up exactly to what the user said, and every milestone is reachable on time", () => {
  const ids = templates.map((template) => template.id);
  let cases = 0;
  for (let monthly = 100; monthly <= 10000; monthly += 300) {
    for (let size = 1; size <= 4; size++) {
      for (let offset = 0; offset < ids.length; offset++) {
        const goals = Array.from({ length: size }, (_, index) => ids[(offset + index) % ids.length]);
        const profile: Profile = { name: "T", vibe: "firstjob", rhythm: "monthly", payday: 7, risk: "steady", monthly, idle: 0 };
        const { stashes, spare } = starterPlan(profile, [...new Set(goals)]);
        const committed = stashes.reduce((sum, stash) => sum + (stash.plan.paused ? 0 : stash.plan.amount), 0);
        expect(committed + spare).toBe(Math.floor(monthly / 100) * 100);
        for (const stash of stashes.filter((item) => !item.plan.paused)) {
          const months = Math.round((new Date(stash.deadline).getTime() - Date.now()) / (30.44 * 24 * 3600 * 1000));
          expect(futureValue(0, monthlyEquivalent(stash.plan), months, bucketMeta[stash.bucket].rate)).toBeGreaterThanOrEqual(stash.target * 0.98);
        }
        cases++;
      }
    }
  }
  saveMetrics("suitability", "s7", { cases });
});
