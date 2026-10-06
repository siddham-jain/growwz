import { bucketMeta, type Bucket } from "../data/funds";

export type Risk = "cautious" | "steady" | "bold";

const ladder: Bucket[] = ["steady", "balanced", "growth"];

export interface Recommendation {
  bucket: Bucket;
  reason: string;
}

// horizon decides first; risk comfort can only nudge, never put short-term money into equity
export function recommendBucket(months: number, risk: Risk, isEmergency: boolean): Recommendation {
  if (isEmergency) {
    return { bucket: "steady", reason: "Emergency money has to be there the day you need it, so it stays somewhere calm." };
  }
  let index = months < 24 ? 0 : months < 60 ? 1 : 2;
  const base = ladder[index];
  if (risk === "cautious" && index > 0) index -= 1;
  if (risk === "bold" && index < 2 && months >= 36) index += 1;
  const bucket = ladder[index];
  const years = Math.max(1, Math.round(months / 12));
  if (months < 24) {
    return { bucket, reason: `You need this in under 2 years. Shares can fall 20% in a bad year, so we keep it out of the stock market.` };
  }
  if (bucket !== base && risk === "cautious") {
    return { bucket, reason: `It's ${years} years away, but you said dips stress you out — so we went one notch calmer.` };
  }
  if (bucket !== base && risk === "bold") {
    return { bucket, reason: `It's ${years} years away and you're okay riding out dips, so we went one notch bolder.` };
  }
  if (bucket === "balanced") {
    return { bucket, reason: `${years} years is enough time for some shares, but not all. A mix keeps the ride smoother.` };
  }
  return { bucket, reason: `${years}+ years away. Time is the best cushion against dips — this is where growth funds shine.` };
}

// stepUp raises the monthly amount by that % every 12 months
export function futureValue(current: number, monthly: number, months: number, annualRate: number, stepUp = 0): number {
  const r = annualRate / 100 / 12;
  if (stepUp === 0) {
    if (r === 0) return current + monthly * months;
    const growth = Math.pow(1 + r, months);
    return current * growth + monthly * ((growth - 1) / r) * (1 + r);
  }
  let value = current;
  for (let month = 0; month < months; month++) {
    value = (value + monthly * Math.pow(1 + stepUp / 100, Math.floor(month / 12))) * (1 + r);
  }
  return value;
}

export function requiredMonthly(target: number, current: number, months: number, annualRate: number): number {
  if (months <= 0) return Math.max(0, target - current);
  const r = annualRate / 100 / 12;
  const growth = Math.pow(1 + r, months);
  const remaining = target - current * growth;
  if (remaining <= 0) return 0;
  return remaining * r / ((growth - 1) * (1 + r));
}

export function roundUpTo(value: number, step: number): number {
  return Math.ceil(value / step) * step;
}

export interface Projection {
  low: number;
  typical: number;
  high: number;
  points: { month: number; low: number; typical: number; high: number }[];
}

export function project(current: number, monthly: number, months: number, bucket: Bucket, stepUp = 0): Projection {
  const meta = bucketMeta[bucket];
  const steps = Math.max(1, Math.min(months, 60));
  const points = Array.from({ length: steps + 1 }, (_, step) => {
    const month = Math.round((step / steps) * months);
    return {
      month,
      low: futureValue(current, monthly, month, meta.low, stepUp),
      typical: futureValue(current, monthly, month, meta.rate, stepUp),
      high: futureValue(current, monthly, month, meta.high, stepUp),
    };
  });
  const last = points[points.length - 1];
  return { low: last.low, typical: last.typical, high: last.high, points };
}

// months until the target is reached at the typical rate; null if it never gets there in 40 years
export function monthsToTarget(target: number, current: number, monthly: number, bucket: Bucket, stepUp = 0): number | null {
  const rate = bucketMeta[bucket].rate;
  for (let month = 0; month <= 480; month++) {
    if (futureValue(current, monthly, month, rate, stepUp) >= target) return month;
  }
  return null;
}
