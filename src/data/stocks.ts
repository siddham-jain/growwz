export interface Stock {
  ticker: string;
  name: string;
  youKnowItAs: string;
  logo: string;
  logoBg: string;
  price: number;
  dayChange: number;
  yearChange: number;
  howTheyEarn: string;
  greenFlags: string[];
  redFlags: string[];
  seed: number;
}

// illustrative prices for the prototype, not live market data
export const stocks: Stock[] = [
  {
    ticker: "ETERNAL",
    name: "Eternal",
    youKnowItAs: "Zomato · Blinkit · District",
    logo: "Z",
    logoBg: "#E23744",
    price: 318.4,
    dayChange: 1.8,
    yearChange: 22.4,
    howTheyEarn: "A cut of every food order and quick-commerce basket, plus delivery fees and ads restaurants pay for.",
    greenFlags: ["Blinkit is growing very fast", "Now profitable after years of losses"],
    redFlags: ["Price already assumes a lot of future growth", "Fierce fight with Swiggy, Zepto, Flipkart Minutes"],
    seed: 3,
  },
  {
    ticker: "TRENT",
    name: "Trent",
    youKnowItAs: "Zudio · Westside · Star",
    logo: "T",
    logoBg: "#1C1C1C",
    price: 5240,
    dayChange: -0.6,
    yearChange: 8.1,
    howTheyEarn: "Sells its own-brand clothes at its stores, so it keeps more of every ₹ than brands sold through others.",
    greenFlags: ["Zudio opens hundreds of stores a year", "Part of the Tata group"],
    redFlags: ["Priced for years of fast growth — big falls if it slows", "Fashion trends change fast"],
    seed: 7,
  },
  {
    ticker: "NYKAA",
    name: "FSN E-Commerce",
    youKnowItAs: "Nykaa · Nykaa Fashion",
    logo: "N",
    logoBg: "#FC2779",
    price: 212.6,
    dayChange: 0.9,
    yearChange: 14.6,
    howTheyEarn: "Margin on beauty and fashion products it sells online and in stores, plus its own brands like Kay Beauty.",
    greenFlags: ["Strong loyal customer base", "Own brands earn higher margins"],
    redFlags: ["Thin profits for its size", "Competition from Tira, Myntra, Amazon"],
    seed: 11,
  },
  {
    ticker: "SWIGGY",
    name: "Swiggy",
    youKnowItAs: "Swiggy · Instamart · Dineout",
    logo: "S",
    logoBg: "#FC8019",
    price: 402.3,
    dayChange: -1.4,
    yearChange: -6.2,
    howTheyEarn: "Commission on food orders, quick-commerce baskets through Instamart, and delivery fees.",
    greenFlags: ["Big, loyal user base", "Instamart is scaling up"],
    redFlags: ["Still losing money overall", "Burns cash to compete in quick commerce"],
    seed: 5,
  },
  {
    ticker: "TITAN",
    name: "Titan Company",
    youKnowItAs: "Tanishq · Fastrack · Titan Eye+",
    logo: "T",
    logoBg: "#7A1F2B",
    price: 3418,
    dayChange: 0.3,
    yearChange: 4.9,
    howTheyEarn: "Mostly gold jewellery through Tanishq, plus watches, eyewear and wearables.",
    greenFlags: ["Decades of steady profits", "Trusted brand, Tata group"],
    redFlags: ["Gold price swings affect demand", "Expensive compared to its profits"],
    seed: 13,
  },
];

export const stockByTicker = (ticker: string): Stock | undefined => stocks.find((stock) => stock.ticker === ticker);

// deterministic pseudo-random walk so charts are stable between renders
export function pricePath(stock: Stock, length = 40): number[] {
  let state = stock.seed * 9301 + 49297;
  const random = () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
  const start = stock.price / (1 + stock.yearChange / 100);
  const drift = (stock.price - start) / (length - 1);
  const path: number[] = [];
  for (let index = 0; index < length; index++) {
    // noise tapers to zero so the path lands on today's price without a jump
    const taper = 1 - index / (length - 1);
    path.push(start + drift * index + (random() - 0.5) * stock.price * 0.08 * taper);
  }
  return path;
}
