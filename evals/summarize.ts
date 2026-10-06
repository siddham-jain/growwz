import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";

const read = (group: string) =>
  existsSync(`evals/results/${group}`)
    ? readdirSync(`evals/results/${group}`).map((file) => ({ key: file.replace(".json", ""), ...JSON.parse(readFileSync(`evals/results/${group}/${file}`, "utf8")) }))
    : [];

const report = JSON.parse(readFileSync("evals/results/report.json", "utf8"));
const { expected = 0, unexpected = 0, flaky = 0 } = report.stats;
const copy = read("copy").sort((a, b) => a.screen.localeCompare(b.screen));
const a11y = read("a11y");
const journeys = read("journeys");

const lines = [
  "# Eval scorecard",
  "",
  `Generated ${new Date().toISOString().slice(0, 10)} · **${expected} passed, ${unexpected} failed, ${flaky} flaky**`,
  "",
  "## Copy: jargon and readability",
  "",
  "| Screen | Unexplained jargon | Reading ease | Words |",
  "|---|---|---|---|",
  ...copy.map((row) => `| ${row.screen} | ${row.unexplained.length ? row.unexplained.join(", ") : "none"} | ${row.readingEase} | ${row.words} |`),
  "",
  "## Accessibility",
  "",
  "| Screen | Serious/critical axe violations | Tap targets < 44px |",
  "|---|---|---|",
  ...a11y.map((row) => `| \`${row.path}\` | ${row.serious.length || 0} | ${row.smallTargets.length || 0} |`),
  "",
  "## Journeys (taps counted where effort matters)",
  "",
  "| Journey | Taps |",
  "|---|---|",
  ...journeys.map((row) => `| ${row.key} | ${row.taps || "—"} |`),
  "",
];
writeFileSync("evals/results/SCORECARD.md", lines.join("\n"));
console.log(lines.join("\n"));
