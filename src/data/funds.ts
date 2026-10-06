export type Bucket = "steady" | "balanced" | "growth";

export interface Fund {
  id: string;
  name: string;
  category: string;
  bucket: Bucket;
  plainName: string;
  oneLiner: string;
  whoFor: string;
  riskLevel: 1 | 2 | 3 | 4 | 5;
  riskometer: string;
  goodFor: string;
  tag?: string;
  expenseRatio: number;
  minSip: number;
  returns3y: number;
  exitLoad: string;
  holdsLike: string[];
}

// illustrative numbers for the prototype, not live fund data
export const funds: Fund[] = [
  {
    id: "liquid",
    name: "Liquid Fund · Direct",
    category: "Debt · Liquid",
    bucket: "steady",
    plainName: "A parking spot for cash",
    oneLiner: "Lends money to big companies and the government for a few weeks at a time. Barely moves day to day.",
    whoFor: "Money you might need within a year — trips, emergencies, next semester's fees.",
    riskLevel: 1,
    riskometer: "Low to Moderate",
    goodFor: "Goals under 2 years",
    expenseRatio: 0.12,
    minSip: 100,
    returns3y: 6.8,
    exitLoad: "Tiny fee only if you withdraw within 7 days",
    holdsLike: ["Govt. treasury bills", "Bank deposits", "Short-term company loans"],
  },
  {
    id: "balanced",
    name: "Balanced Advantage Fund · Direct",
    category: "Hybrid · Dynamic asset allocation",
    bucket: "balanced",
    plainName: "Shares + bonds that auto-balance",
    oneLiner: "Holds more shares when markets are cheap and more bonds when they're pricey — so the ride is smoother.",
    whoFor: "Goals 2–5 years away: a laptop upgrade, moving out, a master's deposit.",
    riskLevel: 3,
    riskometer: "Moderately High",
    goodFor: "Goals 2–5 years away",
    expenseRatio: 0.65,
    minSip: 100,
    returns3y: 11.2,
    exitLoad: "1% if you withdraw within a year",
    holdsLike: ["HDFC Bank", "Reliance", "Govt. bonds"],
  },
  {
    id: "nifty50",
    name: "Nifty 50 Index Fund · Direct",
    category: "Equity · Large cap index",
    bucket: "growth",
    plainName: "India's top 50 companies, in one go",
    oneLiner: "Buys every company in the Nifty 50 in the same proportion. No fund manager guessing — you just get the market.",
    whoFor: "Money you won't touch for 5+ years. Swings a lot short-term, historically grows the most long-term.",
    riskLevel: 4,
    riskometer: "Very High",
    goodFor: "Goals 5+ years away",
    expenseRatio: 0.18,
    minSip: 100,
    returns3y: 13.9,
    exitLoad: "None",
    holdsLike: ["Reliance", "HDFC Bank", "Infosys", "TCS", "ITC"],
  },
  {
    id: "gold",
    name: "Gold ETF Fund of Fund · Direct",
    category: "Commodity · Gold",
    bucket: "balanced",
    plainName: "Gold, without the locker",
    oneLiner: "Tracks the price of gold. Often rises when stocks are having a bad time.",
    whoFor: "A small slice (5–10%) to balance out a stock-heavy portfolio.",
    riskLevel: 3,
    riskometer: "High",
    goodFor: "A 5–10% slice, any long goal",
    tag: "Commodity · hedge",
    expenseRatio: 0.15,
    minSip: 100,
    returns3y: 18.4,
    exitLoad: "None",
    holdsLike: ["Physical gold held by the AMC"],
  },
];

export const fundById = (id: string): Fund => funds.find((fund) => fund.id === id) ?? funds[0];

export const bucketFund: Record<Bucket, string> = {
  steady: "liquid",
  balanced: "balanced",
  growth: "nifty50",
};

export const bucketMeta: Record<Bucket, { label: string; rate: number; low: number; high: number; risk: string; dot: string }> = {
  steady: { label: "Steady", rate: 6.5, low: 5.5, high: 7.5, risk: "Barely moves", dot: "#00D09C" },
  balanced: { label: "Balanced", rate: 9.5, low: 4, high: 13, risk: "Some ups & downs", dot: "#5367FF" },
  growth: { label: "Growth", rate: 11.5, low: 3, high: 15, risk: "Big swings, fine for 5+ yrs", dot: "#F58A3D" },
};
