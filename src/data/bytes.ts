export interface Slide {
  kicker: string;
  title: string;
  body: string;
  visual: string;
}

export interface Byte {
  id: string;
  title: string;
  short: string;
  emoji: string;
  minutes: number;
  gradient: [string, string];
  slides: Slide[];
  quiz: { question: string; options: string[]; answer: number; explain: string };
}

export const bytes: Byte[] = [
  {
    id: "mutual-funds",
    title: "Mutual funds in 60 seconds",
    short: "MFs 101",
    emoji: "🧺",
    minutes: 1,
    gradient: ["#00D09C", "#00A37A"],
    slides: [
      { kicker: "The idea", title: "A mutual fund is a basket", body: "Lots of people put money in. A professional (or a formula) buys many things with it. You own a slice of the basket.", visual: "🧺" },
      { kicker: "Why it works", title: "You get 50 companies for ₹100", body: "Buying one share of each Nifty 50 company would cost lakhs. A fund lets you start with ₹100.", visual: "🏢" },
      { kicker: "What you pay", title: "A small yearly fee", body: "That's the expense ratio. Index funds charge around 0.1–0.3% a year — ₹10–30 on ₹10,000.", visual: "🧾" },
      { kicker: "The catch", title: "It goes up and down", body: "The basket's value moves with the market. Over years, good baskets have grown. Over weeks, anything can happen.", visual: "🎢" },
    ],
    quiz: {
      question: "You put ₹500 in a Nifty 50 index fund. What do you own?",
      options: ["One share of Reliance", "A tiny slice of all 50 companies", "A fixed deposit"],
      answer: 1,
      explain: "Exactly — a slice of all 50, weighted by their size.",
    },
  },
  {
    id: "dips",
    title: "Why markets fall (and what usually happens next)",
    short: "Dips",
    emoji: "📉",
    minutes: 1,
    gradient: ["#5367FF", "#3443C9"],
    slides: [
      { kicker: "Normal behaviour", title: "Markets fall. A lot. Regularly.", body: "A 10% drop happens most years. It feels personal the first time. It isn't.", visual: "🌧️" },
      { kicker: "Zoom out", title: "Bad weeks, good decades — so far", body: "The Nifty 50 has had crashes in 2008, 2020 and plenty of smaller ones, and still grew many times over since 2000. History isn't a guarantee, but it's why time matters.", visual: "🔭" },
      { kicker: "The SIP superpower", title: "Dips mean more units", body: "When prices fall, your same ₹500 SIP buys more units. Those units are what grow back.", visual: "🛒" },
      { kicker: "What actually hurts", title: "Selling in a panic", body: "A fall is only on paper until you sell. Many long-term losses come from selling near the bottom.", visual: "🧘" },
    ],
    quiz: {
      question: "Your 5-year stash is down 8% this month. Best move?",
      options: ["Withdraw before it falls more", "Stay put, keep the SIP going", "Move it all to one hot stock"],
      answer: 1,
      explain: "Yes. With 5 years to go, time is on your side — and the SIP is buying cheaper units.",
    },
  },
  {
    id: "emergency",
    title: "Emergency fund before everything",
    short: "Safety net",
    emoji: "🛟",
    minutes: 1,
    gradient: ["#F58A3D", "#D9661C"],
    slides: [
      { kicker: "Step zero", title: "Before stocks, a cushion", body: "Laptop dies. Notice period. Medical bill. Without a cushion, you sell investments at the worst time — or borrow.", visual: "🛟" },
      { kicker: "How much", title: "3 months of basics", body: "Rent + food + travel + bills, times three. Started with less? Even one month changes everything.", visual: "🧮" },
      { kicker: "Where", title: "Somewhere calm and quick", body: "A liquid fund: low risk, usually in your bank within a day, and usually earns more than a savings account.", visual: "⚡" },
    ],
    quiz: {
      question: "Where should your emergency cushion live?",
      options: ["A small-cap fund", "A liquid fund", "Crypto"],
      answer: 1,
      explain: "Right — calm and quick to withdraw beats high returns for this one.",
    },
  },
  {
    id: "fno",
    title: "F&O: what the numbers say",
    short: "Option math",
    emoji: "📊",
    minutes: 2,
    gradient: ["#2B2D3A", "#121318"],
    slides: [
      { kicker: "SEBI's own data", title: "91% lost money", body: "Of individual traders in equity F&O in FY25, about 9 in 10 ended the year with a loss. For under-30s it was 89%.", visual: "91%" },
      { kicker: "Why", title: "Leverage cuts both ways", body: "A small move in Nifty can double your money — or wipe it out — in a day. Then there are fees on every trade.", visual: "⚖️" },
      { kicker: "The trap", title: "\"I'll win it back\"", body: "3 in 4 traders who lost money kept trading. That's the same loop as a slot machine.", visual: "🔁" },
      { kicker: "If you're still curious", title: "Paper trade first", body: "Practice with virtual money for a few weeks. If you can't beat it on paper, the real thing won't be kinder.", visual: "📝" },
    ],
    quiz: {
      question: "You buy a call option. Nifty stays flat till expiry. What happens?",
      options: ["You get your money back", "You lose most or all of the premium", "You make a small profit"],
      answer: 1,
      explain: "Yes — options lose value as time passes. Flat markets quietly eat buyers' money.",
    },
  },
  {
    id: "first-salary",
    title: "Your first salary, sorted",
    short: "1st salary",
    emoji: "💸",
    minutes: 1,
    gradient: ["#C355F5", "#8B2FC9"],
    slides: [
      { kicker: "The rule of thumb", title: "50 · 30 · 20", body: "50% needs (rent, food, travel). 30% wants (Swiggy, shopping, trips). 20% future-you.", visual: "🥧" },
      { kicker: "The trick", title: "Pay future-you first", body: "Move the 20% the day salary lands, not whatever's left at month-end. Nothing's ever left at month-end.", visual: "🥇" },
      { kicker: "Don't stress", title: "Start smaller if you need to", body: "5% is a great start. Bump it up 1–2% every time your salary goes up.", visual: "🪜" },
    ],
    quiz: {
      question: "When's the best time to invest your monthly 20%?",
      options: ["Payday", "Whatever's left on the 30th", "Only when markets are down"],
      answer: 0,
      explain: "Payday. Automate it and you'll never have to rely on willpower.",
    },
  },
  {
    id: "index",
    title: "Index funds: buy the whole market",
    short: "Index funds",
    emoji: "🎯",
    minutes: 1,
    gradient: ["#00B386", "#007A5C"],
    slides: [
      { kicker: "The problem", title: "Picking winners is hard", body: "Most professional fund managers fail to beat the index over long periods, after fees.", visual: "🎯" },
      { kicker: "The fix", title: "Own the index", body: "An index fund copies the Nifty 50 or a broader index. No star manager, no guessing.", visual: "🧩" },
      { kicker: "The bonus", title: "Lowest fees around", body: "No research team to pay, so fees are often a third of what active funds charge.", visual: "🪙" },
    ],
    quiz: {
      question: "What does a Nifty 50 index fund try to do?",
      options: ["Beat the market", "Match the market", "Avoid the market"],
      answer: 1,
      explain: "Match it — cheaply and reliably.",
    },
  },
];

export const byteById = (id: string): Byte | undefined => bytes.find((byte) => byte.id === id);
