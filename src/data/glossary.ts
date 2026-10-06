export interface GlossaryEntry {
  term: string;
  plain: string;
  like: string;
}

export const glossary: Record<string, GlossaryEntry> = {
  nav: {
    term: "NAV",
    plain: "The price of one unit of a mutual fund today. A lower NAV doesn't mean a fund is \"cheaper\" or better.",
    like: "Like the price per slice of a pizza — what matters is how much the whole pizza grows.",
  },
  sip: {
    term: "SIP",
    plain: "Systematic Investment Plan. A fixed amount that goes in automatically every week or month.",
    like: "Like a Spotify subscription, except it pays you back.",
  },
  "expense-ratio": {
    term: "Expense ratio",
    plain: "The yearly fee the fund charges, as a % of your money. Lower is better.",
    like: "0.2% on ₹10,000 = ₹20 a year. Under 1% is fine; index funds are usually under 0.3%.",
  },
  "exit-load": {
    term: "Exit load",
    plain: "A small fee if you withdraw before a set time. It nudges people not to panic-sell.",
    like: "Like a cancellation fee — only if you leave early.",
  },
  "index-fund": {
    term: "Index fund",
    plain: "A fund that copies a market index (like the Nifty 50) instead of a manager picking stocks.",
    like: "Instead of betting on one player, you own the whole team.",
  },
  "liquid-fund": {
    term: "Liquid fund",
    plain: "A very low-risk fund that lends money for days or weeks. Withdrawals usually reach your bank in a day.",
    like: "A savings account that usually earns a bit more.",
  },
  direct: {
    term: "Direct plan",
    plain: "The version of a fund with no distributor commission, so the fee is lower. Groww only shows direct plans.",
    like: "Buying from the brand's own store instead of a reseller.",
  },
  xirr: {
    term: "XIRR",
    plain: "Your real yearly return when you invested in bits at different times (like SIPs).",
    like: "Your average speed across a trip with traffic stops.",
  },
  volatility: {
    term: "Volatility",
    plain: "How much and how fast something goes up and down. High volatility = bumpier ride.",
    like: "Metro (low) vs a bike ride through potholes (high). Both reach the destination.",
  },
  diversification: {
    term: "Diversification",
    plain: "Spreading money across many companies or asset types so one bad bet can't sink you.",
    like: "Not keeping all your notes in one Google Doc.",
  },
  compounding: {
    term: "Compounding",
    plain: "Earning returns on your returns. It's slow at first, then it gets fast.",
    like: "A snowball rolling downhill — the bigger it gets, the faster it grows.",
  },
  "large-cap": {
    term: "Large cap",
    plain: "The 100 biggest listed companies in India by value. Usually steadier than small companies.",
    like: "The Tatas and Reliances of the market.",
  },
  fno: {
    term: "F&O",
    plain: "Futures & Options. Contracts that bet on where a price will be by a date. Small moves cause big gains or losses.",
    like: "Like betting on a cricket score with borrowed money — exciting, and most people lose.",
  },
  "lot-size": {
    term: "Lot size",
    plain: "The minimum quantity an F&O contract comes in. One Nifty lot is worth lakhs of rupees of exposure.",
    like: "You can't buy one samosa; you have to buy the whole tray.",
  },
  premium: {
    term: "Option premium",
    plain: "The price you pay to buy an option. If the market doesn't move your way by expiry, it can go to zero.",
    like: "A non-refundable concert ticket — if the show's cancelled, it's gone.",
  },
  ltcg: {
    term: "LTCG tax",
    plain: "Tax on gains from equity held over 1 year. The first ₹1.25 lakh of gains each year is tax-free.",
    like: "Most first-time investors won't pay any for years.",
  },
  stepup: {
    term: "Step-up SIP",
    plain: "Your SIP auto-increases by a % each year — ideally when your salary does.",
    like: "Levelling up your workout as you get stronger.",
  },
};
