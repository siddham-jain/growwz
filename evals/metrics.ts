import { mkdirSync, writeFileSync } from "node:fs";

// one file per test so parallel workers never clobber each other
export function saveMetrics(group: string, key: string, data: unknown) {
  const dir = `evals/results/${group}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/${key.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.json`, JSON.stringify(data, null, 2));
}
